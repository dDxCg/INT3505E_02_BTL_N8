// src/pages/PaymentUser/PaymentUserScreen.tsx
import { useEffect, useState } from "react";

const API_BASE_URL = "http://localhost:8000/api/v1";

type PaymentStatusCode =
  | "PENDING"
  | "SUCCESS"
  | "FAILED"
  | "EXPIRED"
  | "REFUNDED"
  | "UNKNOWN";

interface Payment {
  id: number;
  booking_id: number;
  amount: number | string;
  currency: string;
  method_id: number;
  provider_id: number;
  status_id: number;
  paid_at: string;
  qr_url: string;
  provider_transaction_id: string;
}

// --- Mock order info (demo cho 1 bàn) ---
const TABLE_ID = "A1";
const GUEST_COUNT = 3;
const OPENED_AT = "19:32";
const BOOKING_ID = 123;

const ORDER_ITEMS = [
  { id: 1, name: "Lẩu bò", quantity: 1, unitPrice: 350_000 },
  { id: 2, name: "Coca", quantity: 2, unitPrice: 15_000 },
  { id: 3, name: "Rau thêm", quantity: 1, unitPrice: 30_000 },
];

const formatCurrency = (v: number | string) =>
  Number(v).toLocaleString("vi-VN") + " VND";

// Map status_id -> code (theo bảng payment_statuses của nhóm em)
const STATUS_CODE_BY_ID: Record<number, PaymentStatusCode> = {
  1: "PENDING",
  2: "SUCCESS",
  3: "FAILED",
  4: "EXPIRED",
  5: "REFUNDED",
};

function getStatusCode(p: Payment | null): PaymentStatusCode {
  if (!p) return "UNKNOWN";
  return STATUS_CODE_BY_ID[p.status_id] ?? "UNKNOWN";
}

function getStatusText(p: Payment | null): string {
  const code = getStatusCode(p);
  switch (code) {
    case "PENDING":
      return "Đang xử lý thanh toán… Vui lòng chờ cổng thanh toán phản hồi.";
    case "SUCCESS":
      return "Thanh toán thành công ✅ – Có thể in hóa đơn & đóng bàn.";
    case "FAILED":
      return "Thanh toán thất bại ❌ – Hãy tạo lại giao dịch hoặc đổi phương thức.";
    case "EXPIRED":
      return "Giao dịch đã hết hạn ❌ – Vui lòng tạo giao dịch thanh toán mới.";
    case "REFUNDED":
      return "Giao dịch đã được hoàn tiền.";
    default:
      return "Trạng thái thanh toán không xác định.";
  }
}

function isFinalStatus(p: Payment | null): boolean {
  const code = getStatusCode(p);
  return ["SUCCESS", "FAILED", "EXPIRED", "REFUNDED"].includes(code);
}

// helper để không dùng `any` trong catch
function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return fallback;
}

export default function PaymentUserScreen() {
  const [payment, setPayment] = useState<Payment | null>(null);
  const [history, setHistory] = useState<Payment[]>([]);
  const [creating, setCreating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalAmount = ORDER_ITEMS.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  // --- API helpers ---

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await fetch(
        `${API_BASE_URL}/payments?booking_id=${BOOKING_ID}`
      );
      if (!res.ok) throw new Error("Không lấy được lịch sử thanh toán");
      const data: Payment[] = await res.json();
      // sort mới nhất lên đầu
      data.sort(
        (a, b) =>
          new Date(b.paid_at).getTime() - new Date(a.paid_at).getTime()
      );
      setHistory(data);
    } catch (err: unknown) {
      setError(
        getErrorMessage(err, "Có lỗi khi tải lịch sử thanh toán")
      );
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleCreatePayment = async () => {
    try {
      setError(null);
      setCreating(true);

      const res = await fetch(`${API_BASE_URL}/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          booking_id: BOOKING_ID,
          amount: totalAmount,
          currency: "VND",
          method_id: 1,
          provider_id: 1,
        }),
      });

      if (!res.ok) {
        throw new Error(`Tạo payment thất bại (HTTP ${res.status})`);
      }

      const data: Payment = await res.json();
      setPayment(data);
      await fetchHistory();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Có lỗi khi tạo payment"));
    } finally {
      setCreating(false);
    }
  };

  const handleRefreshStatus = async () => {
    if (!payment) return;
    try {
      setError(null);
      setRefreshing(true);

      const res = await fetch(`${API_BASE_URL}/payments/${payment.id}`);
      if (!res.ok) {
        throw new Error(
          `Không lấy được trạng thái payment (HTTP ${res.status})`
        );
      }
      const data: Payment = await res.json();
      setPayment(data);
      await fetchHistory();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Có lỗi khi làm mới trạng thái"));
    } finally {
      setRefreshing(false);
    }
  };

  // load history lần đầu
  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "24px",
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI'",
        lineHeight: 1.5,
      }}
    >
      {/* Thông tin order */}
      <h1 style={{ fontSize: "32px", marginBottom: "8px" }}>
        Thanh toán cho bàn {TABLE_ID}
      </h1>

      <p style={{ marginTop: 0, marginBottom: "24px" }}>
        Số khách: <strong>{GUEST_COUNT}</strong> – Mở lúc{" "}
        <strong>{OPENED_AT}</strong> – Mã order:{" "}
        <strong>{BOOKING_ID}</strong>
      </p>

      <section style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "22px", marginBottom: "12px" }}>
          Danh sách món
        </h2>
        <ul style={{ paddingLeft: "20px", marginTop: 0 }}>
          {ORDER_ITEMS.map((item) => (
            <li key={item.id}>
              {item.name} – {item.quantity} x{" "}
              {formatCurrency(item.unitPrice)} ={" "}
              <strong>
                {formatCurrency(item.quantity * item.unitPrice)}
              </strong>
            </li>
          ))}
        </ul>
      </section>

      <p style={{ fontSize: "20px", fontWeight: 700 }}>
        Tổng tiền: {formatCurrency(totalAmount)}
      </p>

      <button
        onClick={handleCreatePayment}
        disabled={creating || (!!payment && !isFinalStatus(payment))}
        style={{
          marginTop: "16px",
          padding: "10px 20px",
          fontSize: "16px",
          borderRadius: "6px",
          border: "1px solid #111",
          backgroundColor: "#111",
          color: "#fff",
          cursor:
            creating || (!!payment && !isFinalStatus(payment))
              ? "not-allowed"
              : "pointer",
        }}
      >
        {creating
          ? "Đang tạo giao dịch..."
          : !!payment && !isFinalStatus(payment)
          ? "Đang chờ kết quả..."
          : "Thanh toán"}
      </button>

      {/* Block trạng thái thanh toán hiện tại */}
      {payment && (
        <section
          style={{
            marginTop: "40px",
            paddingTop: "24px",
            borderTop: "1px solid #ddd",
          }}
        >
          <h2 style={{ fontSize: "22px", marginBottom: "12px" }}>
            Trạng thái thanh toán
          </h2>

          <p>
            <strong>Mã payment:</strong> {payment.id}
          </p>
          <p>
            <strong>Mã giao dịch cổng:</strong>{" "}
            {payment.provider_transaction_id}
          </p>
          <p>
            <strong>QR URL (demo):</strong>{" "}
            <a href={payment.qr_url} target="_blank" rel="noreferrer">
              {payment.qr_url}
            </a>
          </p>
          <p>
            <strong>Trạng thái:</strong> {getStatusCode(payment)}
          </p>
          <p style={{ marginTop: "8px" }}>{getStatusText(payment)}</p>

          <button
            onClick={handleRefreshStatus}
            disabled={refreshing}
            style={{
              marginTop: "12px",
              padding: "8px 16px",
              borderRadius: "6px",
              border: "1px solid #555",
              backgroundColor: "#fff",
              cursor: refreshing ? "not-allowed" : "pointer",
            }}
          >
            {refreshing ? "Đang kiểm tra..." : "Làm mới trạng thái"}
          </button>
        </section>
      )}

      {/* Lỗi chung */}
      {error && (
        <p style={{ color: "red", marginTop: "16px" }}>
          Lỗi: {error}
        </p>
      )}

      {/* Lịch sử thanh toán */}
      <section
        style={{
          marginTop: "40px",
          paddingTop: "24px",
          borderTop: "1px solid #ddd",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "12px",
          }}
        >
          <h2 style={{ fontSize: "22px", margin: 0 }}>
            Lịch sử thanh toán
          </h2>
          <button
            onClick={fetchHistory}
            disabled={loadingHistory}
            style={{
              padding: "4px 10px",
              fontSize: "13px",
              borderRadius: "4px",
              border: "1px solid #555",
              background: "#fff",
              cursor: loadingHistory ? "not-allowed" : "pointer",
            }}
          >
            {loadingHistory ? "Đang tải..." : "Tải lại"}
          </button>
        </div>

        {history.length === 0 ? (
          <p>Chưa có giao dịch thanh toán nào cho order này.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "14px",
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                    }}
                  >
                    ID
                  </th>
                  <th
                    style={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                    }}
                  >
                    Số tiền
                  </th>
                  <th
                    style={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                    }}
                  >
                    Trạng thái
                  </th>
                  <th
                    style={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                    }}
                  >
                    Thời gian
                  </th>
                  <th
                    style={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                    }}
                  >
                    Mã giao dịch cổng
                  </th>
                </tr>
              </thead>
              <tbody>
                {history.map((p) => (
                  <tr key={p.id}>
                    <td
                      style={{
                        borderBottom: "1px solid #eee",
                        padding: "6px 8px",
                        textAlign: "center",
                      }}
                    >
                      {p.id}
                    </td>
                    <td
                      style={{
                        borderBottom: "1px solid #eee",
                        padding: "6px 8px",
                      }}
                    >
                      {formatCurrency(p.amount)} ({p.currency})
                    </td>
                    <td
                      style={{
                        borderBottom: "1px solid #eee",
                        padding: "6px 8px",
                      }}
                    >
                      {getStatusCode(p)}
                    </td>
                    <td
                      style={{
                        borderBottom: "1px solid #eee",
                        padding: "6px 8px",
                      }}
                    >
                      {new Date(p.paid_at).toLocaleString("vi-VN")}
                    </td>
                    <td
                      style={{
                        borderBottom: "1px solid #eee",
                        padding: "6px 8px",
                        maxWidth: "220px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={p.provider_transaction_id}
                    >
                      {p.provider_transaction_id}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
