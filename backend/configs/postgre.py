# backend/configs/postgre.py

import os
import ssl
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# 1) Xác định thư mục backend và load .env ở đó
BASE_DIR = Path(__file__).resolve().parent.parent  # .../backend
ENV = os.getenv("ENV", "local")

env_candidates = [
    BASE_DIR / ".env",          
    BASE_DIR / f".env.{ENV}",   
]

for env_path in env_candidates:
    if env_path.exists():
        print(f"[configs/postgre] Loading env file: {env_path}")
        load_dotenv(env_path, override=False)

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    checked = ", ".join(str(p) for p in env_candidates)
    raise RuntimeError(
        f"DATABASE_URL is not set. Kiểm tra lại file .env (đã thử: {checked}) "
        "hoặc biến môi trường nhé."
    )

# 2) Đảm bảo dùng asyncpg cho SQLAlchemy async
if DATABASE_URL.startswith("postgresql://") and "+asyncpg" not in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace(
        "postgresql://", "postgresql+asyncpg://", 1
    )

# 3) SSL cho Neon (nếu dùng asyncpg)
connect_args: dict = {}
if DATABASE_URL.startswith("postgresql+asyncpg://"):
    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE
    connect_args = {"ssl": ssl_context}

engine = create_async_engine(
    DATABASE_URL,
    echo=True,
    connect_args=connect_args,
)

SessionFactory = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    autoflush=False,
    autocommit=False,
    expire_on_commit=False,
)

Base = declarative_base()


async def get_db():
    async with SessionFactory() as session:
        try:
            yield session
        finally:
            await session.close()
