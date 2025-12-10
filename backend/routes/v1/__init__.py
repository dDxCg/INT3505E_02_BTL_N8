from .payments import router as payments_router
from .resources.Ingredient import router as ingredient_router
from .resources.Equipment import router as equipment_router
from .resources.EquipmentType import router as equipment_type_router
from .resources.EquipmentStatus import router as equipment_status_router
from .resources.IngredientUnit import router as ingredient_unit_router
from .resources.IngredientHistory import router as ingredient_history_router
from .resources.Dish import router as dish_router
from .resources.Table import router as tables_router
from .resources.TableStatus import router as table_status_router

from .booking.Order import router as orders_router
from .booking.OrderItem import router as order_items_router
from .booking.OrderStatus import router as order_statuses_router
from .booking.OrderItemStatus import router as order_items_statuses_router

from .feedback.Feedback import router as feedback_router


all_v1_routers = [
    dish_router,
    tables_router,
    table_status_router,
    equipment_router,
    equipment_type_router,
    equipment_status_router,
    ingredient_router,
    ingredient_unit_router,
    ingredient_history_router,
    orders_router,
    order_items_router,
    order_statuses_router,
    order_items_statuses_router,
    feedback_router,
    payments_router,
]
