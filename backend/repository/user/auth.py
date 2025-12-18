# repository/user/auth.py
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from models import User, Role
from schemas.user.user import UserCreate, UserBase
from utils.security import hash_password, verify_password
from services.security.jwt import JWTService

class AuthRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    # -------------------------
    # REGISTER → USER
    # -------------------------
    async def create_user(self, payload: UserCreate) -> UserBase:
        role = await self.db.get(Role, payload.role_id)
        if not role:
            raise ValueError("Role not found")

        user = User(
            contact_info=payload.contact_info,
            email=payload.email,
            name=payload.name,
            password=hash_password(payload.password),
            role_id=payload.role_id,
        )

        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)

        return UserBase.model_validate(user)

    # -------------------------
    # LOGIN → TOKEN
    # -------------------------
    async def sign_in(self, contact_info: str, password: str) -> str | None:
        stmt = (
            select(User)
            .options(selectinload(User.role))
            .where(User.contact_info == contact_info)
        )

        result = await self.db.execute(stmt)
        user = result.scalar_one_or_none()

        if not user:
            return None

        if not verify_password(password, user.password):
            return None

        if not user.role:
            raise RuntimeError("User has no role assigned")

        return JWTService.create_access_token(
            user_id=user.id,
            role=user.role.name,
        )
