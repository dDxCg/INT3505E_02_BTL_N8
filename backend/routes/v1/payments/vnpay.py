from fastapi import APIRouter, Request, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession


from configs.postgre import get_db                     
from schemas.payments import PaymentWebhookPayload  
from repository.payments.payments import handle_webhook_repo

router = APIRouter(prefix="/payments/vnpay", tags=["VNPay"])

def _is_success(params: dict) -> bool:
    return params.get("vnp_ResponseCode") == "00" and params.get("vnp_TransactionStatus") == "00"

@router.get("/return")
async def vnpay_return(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    params = dict(request.query_params)

    # 1) lấy payment_id từ vnp_TxnRef
    try:
        payment_id = int(params.get("vnp_TxnRef", "0"))
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid vnp_TxnRef")

    # 2) suy ra success
    success = _is_success(params)

    # 3) lấy provider txn id (tuỳ em dùng cái nào)
    provider_txn_id = params.get("vnp_TransactionNo") or params.get("vnp_BankTranNo")

    # 4) gọi lại logic chung của em (reuse webhook repo)
    payload = PaymentWebhookPayload(
        payment_id=payment_id,
        success=success,
        provider_transaction_id=provider_txn_id,
    )

    updated = await handle_webhook_repo(db, "vnpay", payload)
    return JSONResponse({"ok": True, "updated": updated, "params": params})

@router.get("/ipn")
async def vnpay_ipn(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    params = dict(request.query_params)

    try:
        payment_id = int(params.get("vnp_TxnRef", "0"))
    except ValueError:
        return JSONResponse({"RspCode": "97", "Message": "Invalid TxnRef"})

    success = _is_success(params)
    provider_txn_id = params.get("vnp_TransactionNo") or params.get("vnp_BankTranNo")

    payload = PaymentWebhookPayload(
        payment_id=payment_id,
        success=success,
        provider_transaction_id=provider_txn_id,
    )

    await handle_webhook_repo(db, "vnpay", payload)

    # VNPay IPN thường cần kiểu phản hồi này
    return JSONResponse({"RspCode": "00", "Message": "OK"})
