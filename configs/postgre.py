import os
import re
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv(".env.local")

DATABASE_URL = re.sub(
    r'^postgresql:',
    'postgresql+asyncpg:',
    os.getenv('DATABASE_URL')
)

engine = create_async_engine(DATABASE_URL, echo=True)

# Session class for ORM
SessionFactory = sessionmaker(
    engine, expire_on_commit=False, class_=AsyncSession
)

Base = declarative_base()
