from fastapi import FastAPI, APIRouter


app = FastAPI(title="Restaurant API", version="1.0.0")


api_router = APIRouter(prefix="/api")

@api_router.get("/test")
async def test():
    return {"status": "ok"}

app.include_router(api_router)