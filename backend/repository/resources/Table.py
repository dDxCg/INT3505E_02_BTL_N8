from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import and_, delete, select, update
from sqlalchemy.orm import selectinload
from models import Table, TableStatus

from schemas.resources import (
    TableCreate,
    TableUpdate,
    TableFilter,
    TableReadBase,
    TableReadExtended,
    TableStatusRead,
    TableStatusCreate,
    TableStatusFilter,
    TableStatusUpdate
)


class TableRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_table(self, data: TableCreate) -> TableReadBase:
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

        return TableReadBase.model_validate(table)

    async def get_all_tables(self, filters: TableFilter) -> list[TableReadExtended]:
        """Get all tables with optional filters"""
        query = select(Table).options(selectinload(Table.status))
        conditions = []

        if filters.number is not None:
            conditions.append(Table.number == filters.number)
        if filters.seats is not None:
            conditions.append(Table.seats == filters.seats)
        if filters.status_id is not None:
            conditions.append(Table.status_id == filters.status_id)

        if conditions:
            query = query.where(and_(*conditions))

        result = await self.db.execute(query)
        tables = result.scalars().all()

        return [TableReadExtended.model_validate(table) for table in tables]

    async def get_table_by_id(self, table_id: int) -> TableReadExtended | None:
        """Get table by id"""
        result = await self.db.execute(
            select(Table)
            .options(
                selectinload(Table.status)
            )
            .where(Table.id == table_id)
        )
        table = result.scalar_one_or_none()
        
        if table is None:
            return None
        
        return TableReadExtended.model_validate(table)

    async def update_table(
        self, table_id: int, data: TableUpdate
    ) -> TableReadBase | None:
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
            return TableReadBase.model_validate(table)

        await self.db.execute(
            update(Table).where(Table.id == table_id).values(**update_data)
        )
        await self.db.commit()
        await self.db.refresh(table)

        return TableReadBase.model_validate(table)

    async def delete_table(self, table_id: int) -> TableReadBase | None:
        """Delete table (cascade deletes orders)"""
        table = await self.db.execute(
            select(Table).where(Table.id == table_id)
        )
        table = table.scalar_one_or_none()
        if table is None:
            return None

        result = TableReadBase.model_validate(table)

        await self.db.execute(delete(Table).where(Table.id == table_id))
        await self.db.commit()

        return result

class TableStatusRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_table_status(self, data: TableStatusCreate) -> TableStatusRead:
        table_status = TableStatus(**data.model_dump())
        self.db.add(table_status)
        await self.db.commit()
        await self.db.refresh(table_status)
        return TableStatusRead.model_validate(table_status)

    async def get_table_status_by_id(self, status_id: int) -> TableStatusRead | None:
        result = await self.db.execute(select(TableStatus).where(TableStatus.id == status_id))
        table_status = result.scalar_one_or_none()
        return TableStatusRead.model_validate(table_status)

    async def get_all_table_statuses(self, filters: TableStatusFilter) -> list[TableStatusRead]:
        query = select(TableStatus)
        conditions = []

        if filters.status is not None:
            conditions.append(TableStatus.status.ilike(f"%{filters.status}"))
        
        if conditions:
            query = query.where(and_(*conditions))

        result = await self.db.execute(query)
        statuses = result.scalars().all()
        return [TableStatusRead.model_validate(status) for status in statuses]

    async def update_table_status(self, status_id: int, data: TableStatusUpdate) -> TableStatusRead | None:
        status = await self.get_table_status_by_id(status_id)
        if not status:
            return None
        
        update_data = {}
        for k, v in data.model_dump().items():
            if v is not None:
                update_data[k] = v

        if not update_data:
            return status
        
        await self.db.execute(update(TableStatus).where(TableStatus.id == status_id).values(**update_data))
        await self.db.commit()
        await self.db.refresh(status)
        return TableStatusRead.model_validate(status)

    async def delete_table_status(self, status_id: int) -> TableStatusRead | None:
        status = self.get_table_status_by_id(status_id)
        if status is None:
            return None
        
        await self.db.execute(delete(TableStatus).where(TableStatus.id == status_id))
        await self.db.commit()
        return TableStatusRead.model_validate(status)