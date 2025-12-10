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

    async def get_history_by_period(self, ingredient_id: int, start: str, end: str):
        pass

    async def compare_2_periods(self, ingredient_id: int, start_1: str, end_1: str, start_2: str, end_2: str):
        pass

    
    #scheduler (table for custom schedule config) - msq queue - consumer -> (noti mail, noti real time - ws, log)
    async def alert_usage(self):
        pass

    async def alert_threshold(self):
        pass