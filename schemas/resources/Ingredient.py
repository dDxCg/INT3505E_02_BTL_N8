from pydantic import BaseModel

# --- Ingredient Schemas ---
class IngredientCreate(BaseModel):
    name: str
    unit_id: int
    quantity: float
    threshold: float

class IngredientUpdate(BaseModel):
    name: str | None = None
    unit_id: int | None = None
    quantity: float | None = None
    threshold: float | None = None

class IngredientFilter(IngredientUpdate):
    pass

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

class IngredientUnitFilter(IngredientUnitUpdate):
    pass

class IngredientUnitRead(BaseModel):
    id: int
    name: str

    class Config:
        orm_mode = True