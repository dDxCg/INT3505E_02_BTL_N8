import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';
import './PaymentVNPayScreen.css';

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

const API_BASE = 'http://localhost:8000/api/v1'; // nếu em có sẵn env thì dùng env

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

  // TODO: sau này nhận orderId/bookingId từ params
  const bookingId = 1;
  const displayTableLabel = '1';

  const createPayment = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(`${API_BASE}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          booking_id: bookingId,
          currency: 'VND',
          amount: 200000,
          method_id: 2, // bank / e-wallet
          provider_id: 2, // VNPAY
        }),
      });

      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status}`);
      }

      const data = (await resp.json()) as Payment;
      setPayment(data);
    } catch (err: any) {
      setError(err.message ?? 'Có lỗi xảy ra khi tạo thanh toán');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Nếu muốn auto tạo payment khi mở màn thì bỏ comment:
    // createPayment();
  }, []);

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

            {payment?.qr_url && !loading && (
              <>
                <div className="payvnp-qr-wrapper">
                  <QRCode value={payment.qr_url} size={240} style={{width: '240px', height: '240px'}} />
                </div>
                <p className="payvnp-qr-hint">
                  Mở app Ngân hàng / Ví điện tử, chọn &quot;Quét mã VNPay&quot; để thanh toán.
                </p>
                <a
                  href={payment.qr_url}
                  target="_blank"
                  rel="noreferrer"
                  className="payvnp-link"
                >
                  Hoặc mở trang VNPay
                </a>
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
