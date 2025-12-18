from datetime import datetime, timedelta
from typing import Optional
import jwt
import dotenv
from fastapi import HTTPException, status

dotenv.load_dotenv()

SECRET_KEY = dotenv.get_key(".env", "SECRET_KEY")
ALGORITHM = dotenv.get_key(".env", "ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(
    dotenv.get_key(".env", "ACCESS_TOKEN_EXPIRE_MINUTES")
)

class JWTService:
    @staticmethod
    def create_access_token(
        *,
        user_id: int,
        role: str,
        expires_delta: Optional[timedelta] = None,
    ) -> str:
        now = datetime.utcnow()
        expire = now + (
            expires_delta
            if expires_delta
            else timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        )

        payload = {
            "sub": str(user_id),
            "role": role,
            "iat": now,
            "exp": expire,
        }

        return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

    @staticmethod
    def verify_token(token: str) -> dict:
        try:
            return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token expired",
            )
        except jwt.InvalidTokenError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
            )
