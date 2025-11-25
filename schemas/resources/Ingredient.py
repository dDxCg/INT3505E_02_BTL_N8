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

    model_config = {
        "from_attributes": True
    }


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

    model_config = {
        "from_attributes": True
    }


# --- Ingredient History Schemas ---
class IngredientHistoryCreate(BaseModel):
    ingredient_id: int
    change: float
    reason: str | None = None
    created_at: str | None = None


class IngredientHistoryRead(BaseModel):
    id: int
    ingredient_id: int
    change: float
    reason: str | None = None
    created_at: str

    model_config = {
        "from_attributes": True
    }

class IngredientHistoryUpdate(BaseModel):
    ingredient_id: int | None = None
    change: float | None = None
    reason: str | None = None
    created_at: str | None = None

class IngredientHistoryFilter(IngredientHistoryUpdate):
    pass