from configs.postgre import Base
from sqlalchemy.orm import relationship
from sqlalchemy import Column, Integer, Numeric, String, ForeignKey, DateTime
from datetime import datetime


class PaymentMethod(Base):
    __tablename__ = "payment_methods"

    id = Column(Integer, primary_key=True)
    name = Column(String(50), unique=True, nullable=False)

    # tên relationship ở phía Payment là "method"
    payments = relationship("Payment", back_populates="method")


class PaymentProvider(Base):
    __tablename__ = "payment_providers"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), unique=True, nullable=False)

    # tên relationship ở phía Payment là "provider"
    payments = relationship("Payment", back_populates="provider")


class PaymentStatus(Base):
    __tablename__ = "payment_statuses"

    id = Column(Integer, primary_key=True)
    status = Column(String(50), unique=True, nullable=False)

    # tên relationship ở phía Payment là "status"
    payments = relationship("Payment", back_populates="status")


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True)
    booking_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    currency = Column(String(3), nullable=False)
    amount = Column(Numeric(18, 2), nullable=False)
    method_id = Column(Integer, ForeignKey("payment_methods.id"), nullable=False)
    provider_id = Column(Integer, ForeignKey("payment_providers.id"), nullable=False)
    provider_transaction_id = Column(String(255), unique=True, nullable=False)
    gateway_txn_ref = Column(String(255), nullable=True)
    expired_at = Column(DateTime(timezone=True), nullable=True)
    paid_at = Column(DateTime, default=datetime.utcnow)
    status_id = Column(Integer, ForeignKey("payment_statuses.id"), nullable=False)
    method = relationship("PaymentMethod", back_populates="payments")
    provider = relationship("PaymentProvider", back_populates="payments")
    status = relationship("PaymentStatus", back_populates="payments")
    order = relationship("Order", back_populates="payments")
    
