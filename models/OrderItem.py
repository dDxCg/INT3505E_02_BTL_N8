from configs.postgre import Base 
from sqlalchemy.orm import relationship
from sqlalchemy import Column, Integer, String, ForeignKey

class OrderItemStatus(Base):
    __tablename__ = "order_item_statuses"

    id = Column(Integer, primary_key=True)
    status = Column(String(50), unique=True, nullable=False)

    order_items = relationship("OrderItem", back_populates="status")

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    dish_id = Column(Integer, ForeignKey("dishes.id"))
    quantity = Column(Integer, default=1)
    status_id = Column(Integer, ForeignKey("order_item_statuses.id"))

    order = relationship("Order", back_populates="items")
    dish = relationship("Dish", back_populates="order_items")
    status = relationship("OrderItemStatus", back_populates="order_items")