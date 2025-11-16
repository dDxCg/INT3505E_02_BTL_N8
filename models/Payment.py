from configs.postgre import Base 
from sqlalchemy.orm import relationship
from sqlalchemy import Column, Integer, String, Float, ForeignKey, Enum, DateTime
from datetime import datetime
import enum
from .enum import PaymentMethod

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    amount = Column(Float, nullable=False)
    method = Column(Enum(PaymentMethod), nullable=False)
    paid_at = Column(DateTime, default=datetime.utcnow)

    order = relationship("Order", back_populates="payments")