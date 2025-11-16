import asyncio
from sqlalchemy import inspect, text
from configs.postgre import engine

async def check_connection():
    async with engine.connect() as conn:
        result = await conn.execute(
            text("SELECT current_database(), current_schema(), current_user")
        )
        print(result.fetchall())

async def check_tables():
    async with engine.connect() as conn:
        def get_tables(sync_conn):
            inspector = inspect(sync_conn)
            tables = inspector.get_table_names()
            return tables
        
        tables = await conn.run_sync(get_tables)
        print("Tables in DB:", tables)

async def main():
    await check_connection()
    await check_tables()

if __name__ == "__main__":
    asyncio.run(main())
