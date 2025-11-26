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
    id: str
    booking_id: int 
    amount: int 
    currency: Currency = Currency.VND
    method: PaymentMethod
    status: PaymentStatus
    created_at: datetime
    provider: PaymentProvider | None = None
    qr_url: str | None = None 
    provider_transaction_id: str | None = None

class PaymentCreate(BaseModel):
    booking_id: int
    amount: int
    currency: Currency = Currency.VND
    method: PaymentMethod
    provider: PaymentProvider | None = None

class PaymentUpdate(BaseModel):
    status: PaymentStatus

class PaymentWebhookPayload(BaseModel):
    payment_id: str
    success: bool
    provider_transaction_id: str | None = None

class PaymentRefund(BaseModel):
    amount: int | None = None 