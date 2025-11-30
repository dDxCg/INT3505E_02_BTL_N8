from pydantic import BaseModel, Field 

class OrderStatusCreate(BaseModel):
    status: str

class OrderStatusUpdate(BaseModel):
    status: str | None

class OrderStatusFilter(OrderStatusUpdate):
    pass

class OrderStatusRead(BaseModel):
    id: int
    status: str

    model_config = {
        "from_attributes": True
    }

