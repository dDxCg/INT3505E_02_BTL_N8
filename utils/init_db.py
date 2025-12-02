import asyncio
from configs.postgre import engine, Base  
import models

async def init_tables():
    async with engine.begin() as conn:
        def create(sync_conn):
            print("Creating tables on Neon...")
            Base.metadata.create_all(sync_conn, checkfirst=True)
            print("Done creating tables.")
        await conn.run_sync(create)

if __name__ == "__main__":
    asyncio.run(init_tables())
