import enum
from sqlalchemy import Enum

class EquipmentStatus(enum.Enum):
    available = "available"
    in_use = "in_use"
    maintenance = "maintenance"
    broken = "broken"

class Unit(enum.Enum):
    grams = "grams"
    kilograms = "kilograms"
    liters = "liters"
    pieces = "pieces"

class OrderStatus(enum.Enum):
    pending = "pending"
    served = "served"
    paid = "paid"
    cancelled = "cancelled"

class OrderItemStatus(enum.Enum):
    pending = "pending"
    cooking = "cooking"
    served = "served"
    cancelled = "cancelled"

class PaymentMethod(enum.Enum):
    cash = "cash"
    mobile = "mobile"
    card = "card"

class Role(enum.Enum):
    staff = "staff"
    admin = "admin"
    owner = "owner"

class EquipmentType(enum.Enum):
    pending = "pending"
    oven = "oven"
    stove = "stove"
    grill = "grill"
    fridge = "fridge"
    freezer = "freezer"
    microwave = "microwave"
    sink = "sink"
    dishwasher = "dishwasher"
    coffee_machine = "coffee_machine"