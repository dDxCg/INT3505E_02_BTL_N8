# backend/configs/vnpay.py
import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv

# Load .env backend
BASE_DIR = Path(__file__).resolve().parent.parent
env_path = BASE_DIR / ".env"
load_dotenv(env_path)


@dataclass
class VNPayConfig:
    tmn_code: str
    hash_secret: str
    pay_url: str
    return_url: str
    ipn_url: str
    version: str = "2.1.0"
    command: str = "pay"
    curr_code: str = "VND"


vnpay_config = VNPayConfig(
    tmn_code=os.getenv("VNPAY_TMN_CODE", ""),
    hash_secret=os.getenv("VNPAY_HASH_SECRET", ""),
    pay_url=os.getenv("VNPAY_PAY_URL", ""),
    return_url=os.getenv("VNPAY_RETURN_URL", ""),
    ipn_url=os.getenv("VNPAY_IPN_URL", ""),
)
