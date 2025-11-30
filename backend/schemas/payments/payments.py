from pydantic import BaseModel
from enum import Enum
from datetime import datetime 

class Currency(str, Enum):
    VND = "VND"
    USD = "USD"
    EUR = "EUR"

class PaymentMethod(str, Enum):
    BANK_TRANSFER = "bank_transfer"
    E_WALLET = "e_wallet"

class PaymentStatus(str, Enum):
    PENDING = "pending"
    SUCCESS = "success"
    FAILED = "failed"
    EXPIRED = "expired"
    REFUNDED = "refunded"

class PaymentProvider(str,Enum):
    MOMO = "momo"
    VNPAY = "vnpay"
    ZALOPAY = "zalopay"
    
class Payment(BaseModel):
    id: int 
    booking_id: int 
    amount: float
    currency: str
    method_id: int 
    provider_id: int 
    status_id: int 
    paid_at: datetime | None = None
    qr_url: str | None = None 
    provider_transaction_id: str | None = None

    class Config:
        from_attributes = True

class PaymentCreate(BaseModel):
    booking_id: int
    currency: str
    amount: float
    method_id: int
    provider_id: int

class PaymentUpdate(BaseModel):
    status_id: int
    provider_transaction_id: str | None = None

class PaymentWebhookPayload(BaseModel):
    payment_id: int 
    success: bool
    provider_transaction_id: str | None = None

class PaymentRefund(BaseModel):
    amount: float | None = None 