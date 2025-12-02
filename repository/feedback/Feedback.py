from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import and_, delete, select, update
from models import Feedback, Order
from schemas.feedback import (
    FeedbackCreate,
    FeedbackFilter,
    FeedbackUpdate,
)


class FeedbackRepository:
    def __init__(self, db: AsyncSession):
        self.db = db


    async def create_feedback(self, data: FeedbackCreate) -> Feedback:
        feedback = await self.db.execute(select(Feedback).where(Feedback.order_id == data.order_id))
        if (feedback.scalar_one_or_none() is not None):
            raise ValueError(f"Feedback for order_id {data.order_id} already exists.")
        feedback = Feedback(**data.model_dump())  
        self.db.add(feedback)
        await self.db.commit()
        await self.db.refresh(feedback)  
        return feedback


    async def get_all_feedback(self, filters: FeedbackFilter) -> list[Feedback]:
        query = select(Feedback)
        conditions = []

        if filters.order_id is not None:
            conditions.append(Feedback.order_id == filters.order_id)
        if filters.comment is not None:
            conditions.append(Feedback.comment.ilike(f"%{filters.comment}%"))
        if filters.rating is not None:
            conditions.append(Feedback.rating == filters.rating)

        if conditions:
            query = query.where(and_(*conditions))

        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_feedback_by_id(self, feedback_id: int) -> Feedback | None:
        result = await self.db.execute(select(Feedback).where(Feedback.id == feedback_id))
        return result.scalar_one_or_none()
    
    async def update_feedback(self, feedback_id: int, data: FeedbackUpdate) -> Feedback | None:
        feedback = await self.get_feedback_by_id(feedback_id)
        if feedback is None:
            return None
        
        update_data = {k: v for k, v in data.model_dump().items() if v is not None}
        if not update_data:
            return feedback
        
        if 'order_id' in update_data:
            order = await self.db.execute(select(Order).where(Order.id == update_data['order_id']))
            if order.scalar_one_or_none() is None:
                raise ValueError(f"Order with id {update_data['order_id']} does not exist.")

        await self.db.execute(
            update(Feedback)
            .where(Feedback.id == feedback_id)
            .values(**update_data)
        )
        await self.db.commit()
        return feedback
    
    async def delete_feedback(self, feedback_id: int) -> bool:
        feedback = await self.get_feedback_by_id(feedback_id)
        if feedback is None:
            return None
        await self.db.execute(delete(Feedback).where(Feedback.id == feedback_id))
        await self.db.commit()
        return feedback