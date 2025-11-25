from pydantic import BaseModel, Field

# --- Feedback Schemas ---
class FeedbackCreate(BaseModel):
    order_id: int
    comment: str
    rating: int = Field(..., ge=1, le=5)  # Rating between 1 and 5

class FeedbackUpdate(BaseModel):
    comment: str | None = None
    rating: int | None = Field(None, ge=1, le=5)  # Rating between 1 and 5  

class FeedbackFilter(FeedbackUpdate):
    order_id: int | None = None  
class FeedbackRead(BaseModel):
    id: int
    order_id: int
    comment: str
    rating: int

    model_config = {
        "from_attributes": True
    }