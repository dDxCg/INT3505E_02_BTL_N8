from configs.postgre import Base 
from sqlalchemy.orm import relationship
from sqlalchemy import Column, Integer, String, Float, ForeignKey, Enum
import enum


class Table(Base):
    __tablename__ = "tables"

    id = Column(Integer, primary_key=True)
    number = Column(Integer, unique=True, nullable=False)
    seats = Column(Integer, nullable=False)

    orders = relationship("Order", back_populates="table", cascade="all, delete-orphan")