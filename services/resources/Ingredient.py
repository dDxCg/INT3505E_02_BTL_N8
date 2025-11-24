from sqlalchemy.ext.asyncio import AsyncSession

class RestockService:
    def __init__(self, db: AsyncSession):
        pass

    async def check_low_stock(self):
        pass

    async def alert_low_stock(self):
        pass

    async def get_restock(self):
        pass

class TrackingService:
    def __init__(self, db: AsyncSession):
        pass

    async def log_change(self, ingredient_id: int, change: float, reason: str):
        pass

    async def get_history(self, ingredient_id: int):
        pass

    async def compare_periods(self, ingredient_id: int, start_date_1: str, end_date_1: str, start_date_2: str, end_date_2: str):
        pass

    async def alert_usage_increasing(self):
        pass