from pydantic import BaseModel

# --- Ingredient Schemas ---
class IngredientCreate(BaseModel):
    name: str
    unit_id: int
    quantity: float
    threshold: float

class IngredientOptional(BaseModel):
    name: str | None = None
    unit_id: int | None = None
    quantity: float | None = None
    threshold: float | None = None

class IngredientRead(BaseModel):
    id: int
    name: str
    unit_id: int
    quantity: float
    threshold: float

    class Config:
        orm_mode = True


# --- Ingredient Unit Schemas ---
class IngredientUnitCreate(BaseModel):
    name: str

class IngredientUnitUpdate(BaseModel):
    name: str | None = None

class IngredientUnitRead(BaseModel):
    id: int
    name: str

    class Config:
        orm_mode = True