from pydantic import BaseModel, Field
from decimal import Decimal

# --- Dish Schemas ---
class DishCreate(BaseModel):
    name: str
    price: Decimal
    description: str | None = None
    image_url: str | None = None  # Optional image URL from Supabase
    tag_ids: list[int] = []  # List of tag IDs to associate with the dish

class DishUpdate(BaseModel):
    name: str | None = None
    price: Decimal | None = None
    description: str | None = None
    image_url: str | None = None  # Optional image URL update
    tag_ids: list[int] | None = None  # Optional list of tag IDs to update

class DishFilter(BaseModel):
    name: str | None = None
    price: Decimal | None = None
    description: str | None = None

class DishReadBase(BaseModel):
    id: int
    name: str
    price: Decimal
    description: str | None = None
    image_url: str | None = None

    model_config = {
        "from_attributes": True
    }

# For backward compatibility
class DishRead(DishReadBase):
    pass