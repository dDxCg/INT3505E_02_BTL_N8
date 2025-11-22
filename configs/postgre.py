import os
import re
import ssl
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

ENV = os.getenv('ENV', 'local')
dotenv_path = f".env.{ENV}"
load_dotenv(dotenv_path)

DATABASE_URL = re.sub(
    r'^postgresql:',
    'postgresql+asyncpg:',
    os.getenv('DATABASE_URL')
)

ssl_context = ssl.create_default_context()
engine = create_async_engine(
    DATABASE_URL,
    echo=True,
    connect_args={"ssl": ssl_context}
)

# Session class for ORM
SessionFactory = sessionmaker(
    engine, expire_on_commit=False, class_=AsyncSession
)

Base = declarative_base()
