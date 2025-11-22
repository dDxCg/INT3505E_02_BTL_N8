from configs.postgre import Base 
from sqlalchemy.orm import relationship
from sqlalchemy import Column, Integer, String, Float, ForeignKey, Enum
import enum
from .enum import OrderStatus

class OrderStatus(Base):
    __tablename__ = "order_statuses"

    id = Column(Integer, primary_key=True)
    status = Column(String(50), unique=True, nullable=False)

    orders = relationship("Order", back_populates="status")

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True)
    table_id = Column(Integer, ForeignKey("tables.id"))
    status_id = Column(Integer, ForeignKey("order_statuses.id"))

    table = relationship("Table", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    
    status = relationship("OrderStatus", back_populates="orders")