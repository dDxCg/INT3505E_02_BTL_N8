from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from configs.postgre import Base

class EquipmentType(Base):
    __tablename__ = "equipment_types"

    id = Column(Integer, primary_key=True)
    name = Column(String(50), unique=True, nullable=False)

    equipments = relationship("Equipment", back_populates="type")

class EquipmentStatus(Base):
    __tablename__ = "equipment_statuses"

    id = Column(Integer, primary_key=True)
    status = Column(String(50), unique=True, nullable=False)

    equipments = relationship("Equipment", back_populates="status") 

class Equipment(Base):
    __tablename__ = "equipments"

    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    type_id = Column(Integer, ForeignKey("equipment_types.id"), nullable=False)
    status_id = Column(Integer, ForeignKey("equipment_statuses.id"), nullable=False)

    type = relationship("EquipmentType", back_populates="equipments")
    status = relationship("EquipmentStatus", back_populates="equipments")