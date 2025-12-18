from pydantic import BaseModel
from enum import Enum
from datetime import datetime 
from typing import Optional

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
    expired_at: datetime | None = None       
    gateway_txn_ref: str | None = None 
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

class PaymentStatusBase(BaseModel):
    status: str

class PaymentStatusCreate(PaymentStatusBase):
    pass 

class PaymentStatusUpdate(BaseModel):
    status: Optional[str] = None

class PaymentStatusRead(PaymentStatusBase):
    id: int

    class Config: 
        from_attributes = True

class PaymentMethodBase(BaseModel):
    name: str

class PaymentMethodCreate(PaymentMethodBase):
    pass


class PaymentMethodUpdate(PaymentMethodBase):
    pass


class PaymentMethodRead(PaymentMethodBase):
    id: int

    class Config:
        from_attributes = True

class PaymentProviderBase(BaseModel):
    name: str


class PaymentProviderCreate(PaymentProviderBase):
    pass


class PaymentProviderUpdate(BaseModel):
    name: str


class PaymentProviderRead(PaymentProviderBase):
    id: int

    class Config:
        from_attributes = True