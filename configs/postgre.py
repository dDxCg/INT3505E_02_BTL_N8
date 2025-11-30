# configs/postgre.py (đã sửa)

import os
import re
import ssl

from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker, declarative_base

ENV = os.getenv('ENV', 'local')
dotenv_path = f".env.{ENV}"
load_dotenv(dotenv_path)

raw_db_url = os.getenv("DATABASE_URL")
if not raw_db_url:
    raise RuntimeError(
        "DATABASE_URL is not set. Kiểm tra lại file .env hoặc biến môi trường nhé."
    )


ASYNC_DATABASE_URL = re.sub(
    r"^postgresql:",
    "postgresql+asyncpg:",
    raw_db_url,
)

# SSL cho Neon
ssl_context = ssl.create_default_context()

engine = create_async_engine(
    ASYNC_DATABASE_URL,
    echo=True,                      
    connect_args={"ssl": ssl_context},
    pool_pre_ping=True,             
    
)

SessionFactory = sessionmaker(
    engine,
    expire_on_commit=False,
    class_=AsyncSession,
)

Base = declarative_base()


async def get_db():
    async with SessionFactory() as session:
        yield session
