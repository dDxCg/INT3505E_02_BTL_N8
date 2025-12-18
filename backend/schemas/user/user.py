from models import User, Role
from pydantic import BaseModel, EmailStr

class RoleBase(BaseModel):
    name: str
    id: int

    model_config = {
        "from_attributes": True
    }

class UserBase(BaseModel):
    contact_info: str
    email: EmailStr
    name: str | None = None
    role_id: int

    model_config = {
        "from_attributes": True
    }

class UserCreate(UserBase):
    password: str