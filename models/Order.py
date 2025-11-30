from configs.postgre import Base
from sqlalchemy.orm import relationship
from sqlalchemy import Column, Integer, String, ForeignKey


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
    guest_id = Column(Integer, ForeignKey("guests.id"), nullable=True)

    table = relationship("Table", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    guest = relationship("Guest", back_populates="orders")
    status = relationship("OrderStatus", back_populates="orders")
    feedbacks = relationship("Feedback", back_populates="order", cascade="all, delete-orphan")
    # 1 order -> nhiều payment
    payments = relationship("Payment", back_populates="order", cascade="all, delete-orphan")
    # phải trỏ đúng tới Payment.order
