from pydantic import BaseModel
from decimal import Decimal


class TagBase(BaseModel):
    name: str


class TagCreate(TagBase):
    pass


class TagUpdate(BaseModel):
    name: str | None = None


class TagFilter(TagUpdate):
    pass


class TagRead(TagBase):
    id: int

    model_config = {
        "from_attributes": True
    }


# Define DishReadExtended here to avoid circular imports
class DishReadExtended(BaseModel):
    id: int
    name: str
    price: Decimal
    description: str | None = None
    image_url: str | None = None
    tags: list[TagRead] = []

    model_config = {
        "from_attributes": True
    }
