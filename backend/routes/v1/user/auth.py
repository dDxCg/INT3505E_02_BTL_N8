from pydantic import BaseModel
from configs.postgre import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import APIRouter, Depends, HTTPException, status
from repository.user.auth import AuthRepository
from schemas.user.user import UserCreate, UserBase

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class LoginRequest(BaseModel):
    contact_info: str
    password: str

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserBase, status_code=status.HTTP_201_CREATED)
async def register_user(
    payload: UserCreate,
    db: AsyncSession = Depends(get_db),
):
    """Register a new user."""
    try:
        auth_repo = AuthRepository(db)
        user = await auth_repo.create_user(payload)
        return user
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )
    
@router.post("/login", response_model=TokenResponse)
async def login_user(
    payload: LoginRequest,
    db: AsyncSession = Depends(get_db),
):
    """Authenticate user and return access token."""
    auth_repo = AuthRepository(db)
    token = await auth_repo.sign_in(
        payload.contact_info,
        payload.password,
    )

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    return TokenResponse(access_token=token)
