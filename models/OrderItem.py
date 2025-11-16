from configs.postgre import Base 
from sqlalchemy.orm import relationship
from sqlalchemy import Column, Integer, String, Float, ForeignKey, Enum
import enum
from .enum import OrderItemStatus


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    dish_id = Column(Integer, ForeignKey("dishes.id"))
    quantity = Column(Integer, default=1)
    status = Column(Enum(OrderItemStatus), default=OrderItemStatus.pending)  

    order = relationship("Order", back_populates="items")
    dish = relationship("Dish", back_populates="order_items")