from pydantic import BaseModel, Field
from decimal import Decimal

# --- Dish Schemas ---
class DishCreate(BaseModel):
    name: str
    price: Decimal
    description: str | None = None

class DishUpdate(BaseModel):
    name: str | None = None
    price: Decimal | None = None
    description: str | None = None

class DishFilter(DishUpdate):
    pass

class DishRead(BaseModel):
    id: int
    name: str
    price: Decimal
    description: str | None = None

    model_config = {
        "from_attributes": True
    }