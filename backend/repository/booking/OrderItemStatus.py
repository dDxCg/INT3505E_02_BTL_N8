from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import and_, delete, select, update

from models import OrderItemStatus
from schemas.booking import OrderItemStatusCreate, OrderItemStatusFilter, OrderItemStatusUpdate


class OrderItemStatusRepository:
	def __init__(self, db: AsyncSession):
		self.db = db

	async def create_status(self, data: OrderItemStatusCreate) -> OrderItemStatus:
		existing = await self.db.execute(select(OrderItemStatus).where(OrderItemStatus.status == data.status))
		if existing.scalar_one_or_none() is not None:
			raise ValueError(f"Order status '{data.status}' already exists")

		status = OrderItemStatus(status=data.status)
		self.db.add(status)
		await self.db.commit()
		await self.db.refresh(status)

		return status

	async def get_all_statuses(self, filters: OrderItemStatusFilter) -> list[OrderItemStatus]:
		query = select(OrderItemStatus)
		conditions = []

		if filters is not None:
			if filters.status is not None:
				conditions.append(OrderItemStatus.status == filters.status)

		if conditions:
			query = query.where(and_(*conditions))

		result = await self.db.execute(query)
		return result.scalars().all()

	async def get_status_by_id(self, status_id: int) -> OrderItemStatus | None:
		result = await self.db.execute(select(OrderItemStatus).where(OrderItemStatus.id == status_id))
		return result.scalar_one_or_none()
		

	async def update_status(self, status_id: int, data: OrderItemStatusUpdate) -> OrderItemStatus | None:
		status = await self.get_status_by_id(status_id)
		if status is None:
			return None

		update_data = {}
		if data.status is not None:
			exists = await self.db.execute(select(OrderItemStatus).where(OrderItemStatus.status == data.status, OrderItemStatus.id != status_id))
			if exists.scalar_one_or_none() is not None:
				raise ValueError(f"Order status '{data.status}' already exists")

			update_data["status"] = data.status

		if not update_data:
			return status

		await self.db.execute(update(OrderItemStatus).where(OrderItemStatus.id == status_id).values(**update_data))
		await self.db.commit()
		await self.db.refresh(status)

		return status

	async def delete_status(self, status_id: int) -> OrderItemStatus | None:
		status = await self.get_status_by_id(status_id)
		if status is None:
			return None

		await self.db.execute(delete(OrderItemStatus).where(OrderItemStatus.id == status_id))
		await self.db.commit()

		return status