# main.py
import os

from fastapi import FastAPI, APIRouter
from routes.v1 import all_v1_routers

from configs.postgre import engine, Base

# *** IMPORT MODELS ĐỂ Base.metadata BIẾT HẾT BẢNG ***
from models.Payment import Payment, PaymentMethod, PaymentProvider, PaymentStatus
from models.Order import Order  # sửa path theo project thực tế

app = FastAPI(title="Restaurant API", version="1.0.0")

api_router = APIRouter(prefix="/api")

for router in all_v1_routers:
    api_router.include_router(router, prefix="/v1")


@api_router.get("/test")
async def test():
    return {"status": "ok"}


# mount API router
app.include_router(api_router)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
