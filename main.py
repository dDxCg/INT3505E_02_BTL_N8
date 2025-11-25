from fastapi import FastAPI, APIRouter
from routes.v1 import all_v1_routers


app = FastAPI(title="Restaurant API", version="1.0.0")


api_router = APIRouter(prefix="/api")

for router in all_v1_routers:
    api_router.include_router(router, prefix="/v1")

@api_router.get("/test")
async def test():
    return {"status": "ok"}

app.include_router(api_router)