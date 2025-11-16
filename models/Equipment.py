from sqlalchemy import Column, Integer, String, Float, Enum
from sqlalchemy.orm import relationship
from configs.postgre import Base
import enum

class EquipmentStatus(enum.Enum):
    available = "available"
    in_use = "in_use"
    maintenance = "maintenance"
    broken = "broken"

class Equipment(Base):
    __tablename__ = "equipments"

    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    type = Column(String(50), nullable=False)
    status = Column(Enum(EquipmentStatus), default=EquipmentStatus.available)