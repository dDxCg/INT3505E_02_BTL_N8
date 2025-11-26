from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase

DATABASE_URL = "sqlite+aiosqlite:///./payment.db"


engine = create_async_engine(
    DATABASE_URL,
    echo=True,              
)

SessionLocal = async_sessionmaker(
    bind=engine,
    expire_on_commit=False,
    class_=AsyncSession,
)


class Base(DeclarativeBase):
    """Base class cho các model SQLAlchemy."""
    pass

async def init_db() -> None:
    """Tạo các bảng trong database nếu chưa tồn tại."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
