from fastapi import APIRouter
from .vnpay import router as vnpay_router
from .Payment import router as payment_router
from .PaymentStatus import router as payment_status_router
from .PaymentMethod import router as payment_method_router
from .PaymentProvider import router as payment_provider_router

router = APIRouter()
router.include_router(payment_router)
router.include_router(payment_status_router)
router.include_router(payment_method_router)
router.include_router(payment_provider_router)
router.include_router(vnpay_router) 

