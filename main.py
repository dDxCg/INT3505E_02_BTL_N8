from fastapi import FastAPI, APIRouter
from routes.v1 import all_v1_routers


app = FastAPI(title="Restaurant API", version="1.0.0")


api_router = APIRouter(prefix="/api/v1")

for router in all_v1_routers:
    api_router.include_router(router)

@api_router.get("/test")
async def test():
    return {"status": "ok"}

app.include_router(api_router)