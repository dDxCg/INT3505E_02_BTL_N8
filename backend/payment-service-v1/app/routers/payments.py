# chạy app bằng lệnh: uvicorn app.main:app --reload
from fastapi import APIRouter, HTTPException, status
from app.schemas.payments import Payment, PaymentMethod, PaymentStatus, PaymentCreate, PaymentProvider, PaymentUpdate, PaymentWebhookPayload, PaymentRefund 
from datetime import datetime 
from app.repositories.payments import list_payments_repo, create_payment_repo, get_payment_repo, update_payment_status_repo
router = APIRouter()

@router.get("/payments")
async def list_payments(
    booking_id: int | None = None,
    payment_status: PaymentStatus | None = None,
    from_date: datetime | None = None,
    to_date: datetime | None = None,
) -> list[Payment]:
    return await list_payments_repo(
        booking_id=booking_id,
        payment_status=payment_status,
        from_date=from_date,
        to_date=to_date,
    )

@router.post("/payments", status_code=status.HTTP_201_CREATED)
async def create_payment(body: PaymentCreate) -> Payment:
    if body.booking_id <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="booking_id cần lớn hơn 0",
        )
    if body.amount<=0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="amount cần lớn hơn 0",
        )
    if body.method == PaymentMethod.E_WALLET and body.provider is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Khi method = e_wallet thì provider là bắt buộc",
        )
    return await create_payment_repo(body)

@router.get("/payments/{payment_id}")
async def get_payment(payment_id: str) -> Payment:
    payment = await get_payment_repo(payment_id)
    if payment is None: 
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy payment",
        )
    return payment

@router.put("/payments/{payment_id}")
async def update_payment(
    payment_id: str,
    body: PaymentUpdate,
) -> Payment:
    try:
        payment = await update_payment_status_repo(
            payment_id=payment_id,
            new_status=body.status,
        )
    except ValueError as e: 
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e),
        )
    if payment is None:
        raise HTTPException(status_code=404, detail="Không tìm thấy payment")
    return payment 

@router.post("/payments/webhook/{provider}")
async def payment_webhook(
    provider: PaymentProvider,
    body: PaymentWebhookPayload,
) -> Payment:
    # Map success -> status
    new_status = PaymentStatus.SUCCESS if body.success else PaymentStatus.FAILED

    try:
        payment = await update_payment_status_repo(
            payment_id=body.payment_id,
            new_status=new_status,
            provider_transaction_id=body.provider_transaction_id,
        )
    except ValueError as e:
        # State transition không hợp lệ
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e),
        )

    if payment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy payment",
        )

    # Optional: kiểm tra provider khớp với payment
    if payment.provider is not None and payment.provider != provider:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Provider của payment không khớp với URL webhook",
        )

    return payment

@router.post("/payments/{payment_id}/refund")
async def refund_payment(
    payment_id: str,
    body: PaymentRefund,
) -> Payment:
    
    if body.amount is not None and body.amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="amount refund phải lớn hơn 0",
        )
    
    payment = await get_payment_repo(payment_id)
    if payment is None: 
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy payment",
        )
    
    if body.amount is not None and body.amount > payment.amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Số tiền hoàn lại không được lớn hơn số tiền thanh toán",
        )
    
    if payment.status != PaymentStatus.SUCCESS:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Chỉ được hoàn tiền cho payment ở trạng thái success",
        )
    
    try: 
        updated = await update_payment_status_repo(
            payment_id=payment_id,
            new_status=PaymentStatus.REFUNDED,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e),
        )
    
    if updated is None: 
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy payment",
        )
    
    return updated
