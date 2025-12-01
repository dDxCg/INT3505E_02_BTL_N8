# configs/postgre.py

import os
import ssl

from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# 1) Load .env ở project root
ENV = os.getenv('ENV', 'local')
dotenv_path = f".env.{ENV}"
load_dotenv(dotenv_path)

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is not set. Kiểm tra lại file .env hoặc biến môi trường nhé."
    )

# 2) Chuyển URL sync -> async (asyncpg)
if DATABASE_URL.startswith("postgresql://"):
    ASYNC_DATABASE_URL = DATABASE_URL.replace(
        "postgresql://", "postgresql+asyncpg://", 1
    )
else:
    ASYNC_DATABASE_URL = DATABASE_URL

# 3) SSL cho Neon (tạm thời relax cho local)
ssl_context = ssl.create_default_context()
ssl_context.check_hostname = False
ssl_context.verify_mode = ssl.CERT_NONE

engine = create_async_engine(
    ASYNC_DATABASE_URL,
    echo=True,
    connect_args={"ssl": ssl_context},
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
