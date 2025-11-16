from sqlalchemy import Column, Integer, String, Float, Enum
from sqlalchemy.orm import relationship
from configs.postgre import Base
import enum
from .enum import EquipmentStatus, EquipmentType


class Equipment(Base):
    __tablename__ = "equipments"

    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    type = Column(Enum(EquipmentType), nullable=False, default=EquipmentType.pending)
    status = Column(Enum(EquipmentStatus), default=EquipmentStatus.available)