# backend/utils/vnpay.py
from datetime import datetime, timedelta
from urllib.parse import quote_plus 

import hashlib 
import hmac 

from configs.vnpay import vnpay_config

def _build_signed_query(params: dict[str, str]) -> tuple[str, str]:
    """
    Docstring for _build_signed_query
    
    :param params: Description
    :type params: dict[str, str]
    :return: Description
    :rtype: tuple[str, str]
    """
    sorted_keys = sorted(params.keys())
    # dữ liệu để ký
    sign_data = "&".join(
        f"{k}={quote_plus(str(params[k]))}" for k in sorted_keys
    )

    secure_hash = hmac.new(
        vnpay_config.hash_secret.encode("utf-8"),
        sign_data.encode("utf-8"),
        hashlib.sha512,
    ).hexdigest()

    # query string cho URL (không có hash)
    query_string = "&".join(
        f"{k}={quote_plus(str(params[k]))}" for k in sorted_keys
    )

    return query_string, secure_hash

def build_vnpay_payment_url(payment_id: int, amount: float, client_ip: str) -> str:
    now = datetime.now()
    vnp_create = now.strftime("%Y%m%d%H%M%S")
    vnp_expire = (now + timedelta(minutes=15)).strftime("%Y%m%d%H%M%S")

    params = {
        "vnp_Version": vnpay_config.version,
        "vnp_Command": vnpay_config.command,
        "vnp_TmnCode": vnpay_config.tmn_code,
        "vnp_Amount": str(int(amount * 100)),  # VNPay yêu cầu *100
        "vnp_CurrCode": vnpay_config.curr_code,
        "vnp_TxnRef": str(payment_id),
        "vnp_OrderInfo": f"Payment for booking {payment_id}",
        "vnp_OrderType": "other",
        "vnp_Locale": "vn",
        "vnp_CreateDate": vnp_create,
        "vnp_ExpireDate": vnp_expire,
        "vnp_IpAddr": client_ip,
        "vnp_ReturnUrl": vnpay_config.return_url,
    }

    query_string, secure_hash = _build_signed_query(params)
    # Gắn thêm vnp_SecureHash vào cuối
    base_url = vnpay_config.pay_url or "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html"
    return f"{vnpay_config.pay_url}?{query_string}&vnp_SecureHash={secure_hash}"