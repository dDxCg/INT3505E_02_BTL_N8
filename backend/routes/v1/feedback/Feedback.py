from fastapi import APIRouter, Depends
from configs.postgre import get_db
from sqlalchemy.ext.asyncio import AsyncSession

from repository.feedback import FeedbackRepository
from schemas.feedback import FeedbackCreate, FeedbackUpdate, FeedbackRead, FeedbackFilter


router = APIRouter(prefix="/feedbacks", tags=["Feedbacks"])


@router.post("/", response_model=FeedbackRead)
async def create_feedback(
    feedback: FeedbackCreate,
    db: AsyncSession = Depends(get_db),
):
    feedback_repository = FeedbackRepository(db)
    return await feedback_repository.create_feedback(feedback)


@router.get("/", response_model=list[FeedbackRead])
async def get_feedbacks(
    filter: FeedbackFilter = Depends(),
    db: AsyncSession = Depends(get_db),
):
    feedback_repository = FeedbackRepository(db)
    return await feedback_repository.get_all_feedback(filter)


@router.get("/{feedback_id}", response_model=FeedbackRead)
async def get_feedback_by_id(
    feedback_id: int,
    db: AsyncSession = Depends(get_db),
):
    feedback_repository = FeedbackRepository(db)
    return await feedback_repository.get_feedback_by_id(feedback_id)


@router.put("/{feedback_id}", response_model=FeedbackRead)
async def update_feedback(
    feedback_id: int,
    feedback: FeedbackUpdate,
    db: AsyncSession = Depends(get_db),
):
    feedback_repository = FeedbackRepository(db)
    return await feedback_repository.update_feedback(feedback_id, feedback)


@router.delete("/{feedback_id}", response_model=FeedbackRead)
async def delete_feedback(
    feedback_id: int,
    db: AsyncSession = Depends(get_db),
):
    feedback_repository = FeedbackRepository(db)
    return await feedback_repository.delete_feedback(feedback_id)