from pydantic import BaseModel, Field
from ..resources import DishRead
from .OrderItemStatus import OrderItemStatusRead


# --- OrderItem Schemas ---
class OrderItemBase(BaseModel):
    id: int
    order_id: int
    dish_id: int
    status_id: int
    quantity: int

    model_config = {
        "from_attributes": True
    }

class OrderItemCreate(BaseModel):
    order_id: int
    dish_id: int
    quantity: int = Field(..., gt=0)  # Quantity must be greater than 0
    status_id: int

class OrderItemUpdate(BaseModel):
    order_id: int | None = None
    dish_id: int | None = None
    quantity: int | None = Field(None, gt=0)  # Quantity must be greater than 0
    status_id: int | None = None

class OrderItemFilter(OrderItemUpdate):
    pass

class OrderItemRead(OrderItemBase):
    dish: DishRead
    status: OrderItemStatusRead


