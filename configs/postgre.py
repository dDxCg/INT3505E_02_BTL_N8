# configs/postgre.py
import os
from pathlib import Path
from typing import AsyncGenerator

from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.pool import NullPool


BASE_DIR = Path(__file__).resolve().parent.parent  # .../INT3505E_02_BTL_N8
ENV_PATH = BASE_DIR / ".env"

print(f"[postgre.py] Loading .env from: {ENV_PATH}")

load_dotenv(ENV_PATH)

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError(f"DATABASE_URL is not set – hãy kiểm tra file .env ở: {ENV_PATH}")


engine = create_async_engine(
    DATABASE_URL,
    echo=True,          
    pool_pre_ping=True,
    poolclass=NullPool,
)


class Base(DeclarativeBase):
    """Base cho toàn bộ models."""
    pass


AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    expire_on_commit=False,
    class_=AsyncSession,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
