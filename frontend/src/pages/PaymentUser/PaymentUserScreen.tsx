import { useEffect, useState } from "react";
import "./PaymentUserScreen.css";

const TABLE_ID = "A1";
const GUEST_COUNT = 3;
const OPENED_AT = "19:32";
const BOOKING_ID = 123;

const ITEMS = [
  { id: 1, name: "Lẩu bò", quantity: 1, unitPrice: 350_000 },
  { id: 2, name: "Coca", quantity: 2, unitPrice: 15_000 },
  { id: 3, name: "Rau thêm", quantity: 1, unitPrice: 30_000 },
];

const TOTAL_AMOUNT = ITEMS.reduce(
  (sum, item) => sum + item.quantity * item.unitPrice,
  0
);

const API_BASE_URL = "http://localhost:8000/api/v1";

type PaymentStatus =
  | "PENDING"
  | "SUCCESS"
  | "FAILED"
  | "EXPIRED"
  | "REFUNDED"
  | "UNKNOWN";

interface Payment {
  id: number;
  booking_id: number;
  amount: number;
  currency: string;
  status?: PaymentStatus | string;
  status_id?: number;
  provider_transaction_id?: string;
  qr_url?: string;
  created_at?: string;
}

function formatCurrency(amount: number) {
  return amount.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  });
}

function formatProviderTxId(id?: string) {
  if (!id) return "—";

  // Ngắn sẵn thì giữ nguyên
  if (id.length <= 18) return id;

  const head = id.slice(0, 10); // ví dụ: pending_97…
  const tail = id.slice(-6);    // …5486ac
  return `${head}…${tail}`;
}


function getStatusLabel(status?: PaymentStatus | string, statusId?: number) {
  const s = status?.toString().toUpperCase();

  switch (s) {
    case "PENDING":
      return "Đang chờ thanh toán";
    case "SUCCESS":
      return "Thanh toán thành công";
    case "FAILED":
      return "Thanh toán thất bại";
    case "EXPIRED":
      return "Giao dịch hết hạn";
    case "REFUNDED":
      return "Đã hoàn tiền";
  }

  switch (statusId) {
    case 1:
      return "Đang chờ thanh toán";
    case 2:
      return "Thanh toán thành công";
    case 3:
      return "Thanh toán thất bại";
    case 4:
      return "Giao dịch hết hạn";
    case 5:
      return "Đã hoàn tiền";
    default:
      return "Không xác định";
  }
}

function getStatusClass(status?: PaymentStatus | string, statusId?: number) {
  const s = status?.toString().toUpperCase();

  if (s === "SUCCESS" || statusId === 2) return "status-badge success";
  if (s === "FAILED" || statusId === 3) return "status-badge failed";
  if (s === "EXPIRED" || statusId === 4) return "status-badge expired";
  if (s === "REFUNDED" || statusId === 5) return "status-badge refunded";

  // default = pending
  return "status-badge pending";
}

export default function PaymentUserScreen() {
  const [isCreating, setIsCreating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [history, setHistory] = useState<Payment[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function fetchHistory() {
    try {
      const res = await fetch(
        `${API_BASE_URL}/payments?booking_id=${BOOKING_ID}`
      );
      if (!res.ok) return;
      const data: Payment[] = await res.json();
      setHistory(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleCreatePayment() {
    try {
      setIsCreating(true);
      setError(null);

      const res = await fetch(`${API_BASE_URL}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          booking_id: BOOKING_ID,
          amount: TOTAL_AMOUNT,
          currency: "VND",
          method_id: 1,
          provider_id: 1,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Tạo payment thất bại: ${res.status} - ${text}`);
      }

      const data: Payment = await res.json();
      setPayment(data);
      fetchHistory();
    } catch (err) {
      console.error(err);
      const message =
        err instanceof Error ? err.message : "Có lỗi xảy ra khi tạo payment";
      setError(message);
    } finally {
      setIsCreating(false);
    }
  }

  async function handleRefreshStatus() {
    if (!payment) return;
    try {
      setIsRefreshing(true);
      const res = await fetch(`${API_BASE_URL}/payments/${payment.id}`);
      if (!res.ok) return;
      const data: Payment = await res.json();
      setPayment(data);
      fetchHistory();
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    fetchHistory();
  }, []);

  const isPending =
    payment &&
    (payment.status?.toString().toUpperCase() === "PENDING" ||
      payment.status_id === 1);

  return (
    <div className="payment-page">
      <div className="payment-card">
        <header className="payment-header">
          <div>
            <p className="payment-subtitle">Demo thanh toán qua Payment Service</p>
            <h1 className="payment-title">Thanh toán bàn {TABLE_ID}</h1>
            <p className="payment-meta">
              Số khách: <strong>{GUEST_COUNT}</strong> · Mở lúc{" "}
              <strong>{OPENED_AT}</strong> · Mã order{" "}
              <strong>{BOOKING_ID}</strong>
            </p>
          </div>
          <div className="payment-amount-box">
            <span className="amount-label">Tổng cần thanh toán</span>
            <span className="amount-value">
              {formatCurrency(TOTAL_AMOUNT)}
            </span>
          </div>
        </header>

        <section className="payment-section">
          <h2 className="section-title">Danh sách món</h2>
          <div className="items-table">
            {ITEMS.map((item) => (
              <div key={item.id} className="item-row">
                <div className="item-name">{item.name}</div>
                <div className="item-qty">
                  x{item.quantity}
                </div>
                <div className="item-line">
                  {formatCurrency(item.quantity * item.unitPrice)}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="payment-section">
          <div className="payment-actions">
            <button
              className="primary-button"
              onClick={handleCreatePayment}
              disabled={isCreating || isPending}
            >
              {isCreating
                ? "Đang tạo payment..."
                : isPending
                ? "Đang xử lý thanh toán..."
                : "Thanh toán"}
            </button>
            {error && <p className="error-text">Lỗi: {error}</p>}
          </div>
        </section>

        {payment && (
          <section className="payment-section status-section">
            <div className="status-header">
              <h2 className="section-title">Trạng thái thanh toán hiện tại</h2>
              <span
                className={getStatusClass(payment.status, payment.status_id)}
              >
                {getStatusLabel(payment.status, payment.status_id)}
              </span>
            </div>

            <div className="status-grid">
              <div className="status-item">
                <span className="status-label">Mã payment</span>
                <span className="status-value">#{payment.id}</span>
              </div>
              <div className="status-item">
  <span className="status-label">Mã giao dịch cổng</span>
  <span
    className="status-value status-value-id"
    title={payment.provider_transaction_id ?? ""}
  >
    {formatProviderTxId(payment.provider_transaction_id)}
  </span>
</div>

              <div className="status-item">
                <span className="status-label">Số tiền</span>
                <span className="status-value">
                  {formatCurrency(payment.amount)}
                </span>
              </div>
              <div className="status-item">
                <span className="status-label">QR thanh toán</span>
                <span className="status-value">
                  {payment.qr_url ? (
                    <a
                      href={payment.qr_url}
                      target="_blank"
                      rel="noreferrer"
                      className="link"
                    >
                      Mở QR (demo)
                    </a>
                  ) : (
                    "Không có"
                  )}
                </span>
              </div>
            </div>

            <button
              className="secondary-button"
              onClick={handleRefreshStatus}
              disabled={isRefreshing}
            >
              {isRefreshing ? "Đang làm mới..." : "Làm mới trạng thái"}
            </button>
          </section>
        )}

        <section className="payment-section">
          <h2 className="section-title">
            Lịch sử thanh toán cho booking #{BOOKING_ID}
          </h2>

          {history.length === 0 ? (
            <p className="muted-text">Chưa có payment nào.</p>
          ) : (
            <div className="history-table-wrapper">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Số tiền</th>
                    <th>Trạng thái</th>
                    <th>Thời gian tạo</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((p) => (
                    <tr key={p.id}>
                      <td>#{p.id}</td>
                      <td>{formatCurrency(p.amount)}</td>
                      <td>{getStatusLabel(p.status, p.status_id)}</td>
                      <td>{p.created_at ?? ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
