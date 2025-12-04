from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import json
from datetime import datetime
from fastapi.responses import StreamingResponse
from recipe_chat import process_message

app = FastAPI(title="Food Chatbot API", version="1.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage (replace with database in production)
menu_data = []
conversation_history = []

# Pydantic models
class MessageRequest(BaseModel):
    message: str
    preference_tags: Optional[List[str]] = []

class MenuUploadResponse(BaseModel):
    status: str
    items_processed: int
    message: str

@app.get("/")
async def root():
    return {
        "message": "Food Chatbot API",
        "endpoints": {
            "POST /messaging": "Send a message with preference tags",
            "POST /upload-menu": "Upload menu data for RAG",
            "GET /menu": "Get current menu data",
            "GET /health": "Health check"
        }
    }

@app.post("/messaging")
async def messaging(request: MessageRequest):
    try:
        # Log the conversation
        conversation_history.append({
            "timestamp": datetime.now().isoformat(),
            "user_message": request.message,
            "preference_tags": request.preference_tags
        })
        
        # Create a generator function for streaming
        async def generate_response():
            try:
                for chunk in process_message(request.message, stream=True):
                    # Yield each chunk as it comes from the model
                    yield chunk
            except Exception as e:
                yield f"\nError: {str(e)}"
        
        return StreamingResponse(
            generate_response(),
            media_type="text/plain",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            }
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload-menu", response_model=MenuUploadResponse)
async def upload_menu(file: UploadFile = File(...)):
    """
    Upload menu data in JSON format for RAG.
    Expected format: [{"name": "Dish Name", "description": "...", "tags": ["tag1", "tag2"], ...}]
    """
    try:
        # Read file content
        content = await file.read()
        
        # Parse JSON
        try:
            new_menu = json.loads(content.decode('utf-8'))
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid JSON format")
        
        # Validate structure
        if not isinstance(new_menu, list):
            raise HTTPException(status_code=400, detail="Menu data must be a list of items")
        
        # Clear existing menu and add new data
        global menu_data
        menu_data = new_menu
        
        return MenuUploadResponse(
            status="success",
            items_processed=len(new_menu),
            message=f"Successfully uploaded {len(new_menu)} menu items"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

@app.get("/menu")
async def get_menu():
    """Get current menu data"""
    return {
        "total_items": len(menu_data),
        "menu": menu_data
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "conversation_count": len(conversation_history)
    }

@app.get("/history")
async def get_history():
    """Get conversation history"""
    return {
        "total_conversations": len(conversation_history),
        "history": conversation_history
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)