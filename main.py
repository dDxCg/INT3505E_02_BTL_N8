# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from configs.postgre import engine, Base

from models.Payment import Payment, PaymentMethod, PaymentProvider, PaymentStatus
from models.Order import Order  # sửa path theo project thực tế

from routes.v1.payments.Payment import router as payment_router
from routes.v1.payments.PaymentStatus import router as payment_status_router
from routes.v1.payments.PaymentMethod import router as payment_method_router
from routes.v1.payments.PaymentProvider import router as payment_provider_router

app = FastAPI(title="Restaurant API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      
    allow_credentials=False,  
    allow_methods=["*"],
    allow_headers=["*"],
)

API_PREFIX = "/api/v1"

app.include_router(payment_router, prefix=API_PREFIX)
app.include_router(payment_status_router, prefix=API_PREFIX)
app.include_router(payment_method_router, prefix=API_PREFIX)
app.include_router(payment_provider_router, prefix=API_PREFIX)


@app.on_event("startup")
async def on_startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
