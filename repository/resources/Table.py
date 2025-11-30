from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import and_, delete, select, update
from models import Table

from schemas.resources import (
    TableCreate,
    TableUpdate,
    TableFilter,
    TableRead,
)


class TableRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_table(self, data: TableCreate) -> TableRead:
        """
        Create a new table.
        Validates table number is unique.
        """
        # Check if table number already exists
        existing = await self.db.execute(
            select(Table).where(Table.number == data.number)
        )
        if existing.scalar_one_or_none() is not None:
            raise ValueError(f"Table number {data.number} already exists.")

        table = Table(
            number=data.number,
            seats=data.seats,
        )
        self.db.add(table)
        await self.db.commit()
        await self.db.refresh(table)

        return TableRead.model_validate(table)

    async def get_all_tables(self, filters: TableFilter) -> list[TableRead]:
        """Get all tables with optional filters"""
        query = select(Table)
        conditions = []

        if filters.number is not None:
            conditions.append(Table.number == filters.number)
        if filters.seats is not None:
            conditions.append(Table.seats == filters.seats)

        if conditions:
            query = query.where(and_(*conditions))

        result = await self.db.execute(query)
        tables = result.scalars().all()

        return [TableRead.model_validate(table) for table in tables]

    async def get_table_by_id(self, table_id: int) -> TableRead | None:
        """Get table by id"""
        result = await self.db.execute(
            select(Table).where(Table.id == table_id)
        )
        table = result.scalar_one_or_none()
        
        if table is None:
            return None
        
        return TableRead.model_validate(table)

    async def update_table(
        self, table_id: int, data: TableUpdate
    ) -> TableRead | None:
        """Update table info"""
        table = await self.db.execute(
            select(Table).where(Table.id == table_id)
        )
        table = table.scalar_one_or_none()
        if table is None:
            return None

        # If updating number, check uniqueness
        if data.number is not None and data.number != table.number:
            existing = await self.db.execute(
                select(Table).where(Table.number == data.number)
            )
            if existing.scalar_one_or_none() is not None:
                raise ValueError(f"Table number {data.number} already exists.")

        update_data = {}
        if data.number is not None:
            update_data["number"] = data.number
        if data.seats is not None:
            update_data["seats"] = data.seats

        if not update_data:
            return TableRead.model_validate(table)

        await self.db.execute(
            update(Table).where(Table.id == table_id).values(**update_data)
        )
        await self.db.commit()
        await self.db.refresh(table)

        return TableRead.model_validate(table)

    async def delete_table(self, table_id: int) -> TableRead | None:
        """Delete table (cascade deletes orders)"""
        table = await self.db.execute(
            select(Table).where(Table.id == table_id)
        )
        table = table.scalar_one_or_none()
        if table is None:
            return None

        result = TableRead.model_validate(table)

        await self.db.execute(delete(Table).where(Table.id == table_id))
        await self.db.commit()

        return result
