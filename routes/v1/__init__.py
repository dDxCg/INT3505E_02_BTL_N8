from .resources.Ingredient import router as ingredient_router
from .resources.Equipment import router as equipment_router
from .resources.EquipmentType import router as equipment_type_router
from .resources.EquipmentStatus import router as equipment_status_router
from .resources.IngredientUnit import router as ingredient_unit_router

all_v1_routers = [
    equipment_router,
    ingredient_router,
    equipment_type_router,
    equipment_status_router,
    ingredient_unit_router,
]