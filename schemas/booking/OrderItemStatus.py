from pydantic import BaseModel, Field 

class OrderItemStatusCreate(BaseModel):
    status: str

class OrderItemStatusUpdate(BaseModel):
    status: str | None

class OrderItemStatusFilter(OrderItemStatusUpdate):
    pass

class OrderItemStatusRead(BaseModel):
    id: int
    status: str

    model_config = {
        "from_attributes": True
    }