import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './PaymentVNPayScreen.css';
import { toast } from "react-toastify";
import { apiClient } from '@/api/client';
import qrCodeImage from '@/assets/images/qr-code.png';

type Payment = {
  id: number;
  booking_id: number;
  amount: number;
  currency: string;
  method_id: number;
  provider_id: number;
  status_id: number;
  qr_url: string | null;
  provider_transaction_id?: string | null;
};

type PaymentScreenState = {
  bookingId: number;      
  tableId: number;        
  tableLabel: string;     
  amount: number;         
};

function formatCurrency(amount: number, currency: string) {
  if (currency === 'VND') {
    return amount.toLocaleString('vi-VN') + ' đ';
  }
  return amount.toLocaleString('en-US', { style: 'currency', currency });
}

export default function PaymentVNPayScreen() {
  const navigate = useNavigate();

  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const location = useLocation();
  const state = location.state as PaymentScreenState | null;

  // Nếu user gõ thẳng URL mà không đi từ flow -> không có state
  useEffect(() => {
    if (!state) navigate('/staff', { replace: true });
  }, [state, navigate]);

  const bookingId = state?.bookingId ?? 0;
  const displayTableLabel = state?.tableLabel ?? '';
  const amount = state?.amount ?? 0;


  const createPayment = async () => {
    if (!bookingId || !amount) {
      setError('Thiếu bookingId/amount (đi sai flow)');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/payments', {
        booking_id: bookingId,
        currency: 'VND',
        amount,
        method_id: 2, // bank / e-wallet
        provider_id: 2, // VNPAY
      });

      const data = response.data as Payment;
      setPayment(data);
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || err.message || 'Có lỗi xảy ra khi tạo thanh toán';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  if (state) createPayment();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [state]);

  useEffect(() => {
    if (!payment?.id) return;

    const interval = setInterval(async () => {
      try {
        const response = await apiClient.get(`/payments/${payment.id}`);
        const latest: Payment = response.data;
        setPayment(latest);

        // TODO: đổi số này theo payment_statuses
        const SUCCESS_ID = 2;

        if (latest.status_id === SUCCESS_ID) {
          clearInterval(interval);
          toast.success(`Thanh toán bàn ${displayTableLabel} thành công!`);
          navigate("/review", { replace: true });
        }
      } catch (e) {
        console.error(e);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [payment?.id, navigate, displayTableLabel]);


  return (
    <div className="payvnp-page">
      {/* HEADER */}
      <header className="payvnp-header">
        <p className="payvnp-subtitle">DEMO THANH TOÁN QUA PAYMENT SERVICE</p>

        <div className="payvnp-header-main">
          <div>
            <h1 className="payvnp-title">Thanh toán bàn {displayTableLabel}</h1>
            <div className="payvnp-meta">
              <span>Số khách: —</span>
              <span>Mở lúc: —</span>
              <span>Mã order: {bookingId}</span>
            </div>
          </div>

          <div className="payvnp-total-card">
            <span className="payvnp-total-label">Tổng cần thanh toán</span>
            <span className="payvnp-total-value">
              {payment ? formatCurrency(payment.amount, payment.currency) : '0 đ'}
            </span>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="payvnp-main">
        {/* Cột trái: món + nút thanh toán + lịch sử */}
        <section className="payvnp-left">
          <section className="payvnp-section">
            <h2 className="payvnp-section-title">Danh sách món</h2>
            <div className="payvnp-card payvnp-card-muted">
              {/* TODO: map order items thật ở đây */}
              <p>Order chưa có món nào.</p>
            </div>

            <button
              className="payvnp-btn-primary"
              onClick={createPayment}
              disabled={loading}
            >
              {loading ? 'Đang tạo mã QR...' : payment ? 'Tạo lại mã QR VNPay' : 'Thanh toán'}
            </button>
          </section>

          <section className="payvnp-section">
            <h2 className="payvnp-section-title">
              Lịch sử thanh toán của bàn {displayTableLabel}
            </h2>
            <div className="payvnp-card payvnp-card-muted">
              {/* TODO: sau này call API list payments by booking_id */}
              <p>Chưa có giao dịch nào cho bàn này.</p>
            </div>
          </section>
        </section>

        {/* Cột phải: QR VNPay */}
        <section className="payvnp-right">
          <div className="payvnp-qr-card">
            <h3 className="payvnp-qr-title">Quét mã VNPay</h3>

            {error && <p className="payvnp-error">{error}</p>}

            {!payment && !loading && (
              <p className="payvnp-qr-placeholder">
                Nhấn nút <strong>Thanh toán</strong> để tạo mã QR VNPay.
              </p>
            )}

            {loading && <p className="payvnp-qr-placeholder">Đang tạo yêu cầu thanh toán...</p>}

            {payment && !loading && (
              <>
                <div className="payvnp-qr-wrapper">
                  <img
                    src={qrCodeImage}
                    alt="VNPay QR Code"
                    style={{width: '240px', height: '240px', objectFit: 'contain'}}
                  />
                </div>
                <p className="payvnp-qr-hint">
                  Mở app Ngân hàng / Ví điện tử, chọn &quot;Quét mã VNPay&quot; để thanh toán.
                </p>
                {payment.qr_url && (
                  <a
                    href={payment.qr_url}
                    target="_blank"
                    rel="noreferrer"
                    className="payvnp-link"
                  >
                    Hoặc mở trang VNPay
                  </a>
                )}
              </>
            )}
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="payvnp-footer">
        <button
          className="payvnp-btn-ghost"
          type="button"
          onClick={() => navigate('/staff')}
        >
          ← Quay lại Staff Dashboard
        </button>
      </footer>
    </div>
  );
}
