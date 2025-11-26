from fastapi import FastAPI
from app.routers import payments
from app.db import init_db
app = FastAPI()

app.include_router(payments.router, prefix="/api/v1")

@app.on_event("startup")
async def on_startup() -> None:
    await init_db()
