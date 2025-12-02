import { useState } from "react";

type OrderItem = {
  id: number;
  name: string;
  quantity: number;
  unitPrice: number;
};

type PaymentResponse = {
  id: number;
  booking_id: number;
  amount: number;
  currency: string;
  method_id: number;
  provider_id: number;
  status_id: number;
  paid_at: string;
  qr_url: string;
  provider_transaction_id: string;
};

type PaymentStatus = "idle" | "loading" | "success" | "error";

function formatCurrency(value: number) {
  return value.toLocaleString("vi-VN") + " VND";
}

export default function PaymentUser() {
  // --- dữ liệu demo của order (để sau này nối với Order Service) ---
  const tableId = "A1";
  const guestCount = 3;
  const orderId = 123; // sẽ map với booking_id
  const openedAt = "19:32";

  const items: OrderItem[] = [
    { id: 1, name: "Lẩu bò", quantity: 1, unitPrice: 350000 },
    { id: 2, name: "Coca", quantity: 2, unitPrice: 15000 },
    { id: 3, name: "Rau thêm", quantity: 1, unitPrice: 30000 },
  ];

  const totalAmount = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  // --- state cho payment ---
  const [status, setStatus] = useState<PaymentStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [payment, setPayment] = useState<PaymentResponse | null>(null);

  async function handlePayClick() {
    setStatus("loading");
    setError(null);
    setPayment(null);

    try {
      const res = await fetch("http://localhost:8000/api/v1/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          booking_id: orderId,
          amount: totalAmount,
          currency: "VND",
          method_id: 1, // QR code
          provider_id: 1, // ví dụ: MoMo
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text || "Request failed"}`);
      }

      const data: PaymentResponse = await res.json();
      setPayment(data);
      setStatus("success");
    } catch (err) {
      console.error(err);
      setStatus("error");
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  }

  return (
    <div style={{ padding: "24px", fontFamily: "system-ui, sans-serif" }}>
      <h1>Thanh toán cho bàn {tableId}</h1>

      <p>
        Số khách: {guestCount} – Mở lúc: {openedAt} – Mã order: {orderId}
      </p>

      <h2>Danh sách món</h2>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            {item.name} – {item.quantity} x {formatCurrency(item.unitPrice)} ={" "}
            {formatCurrency(item.quantity * item.unitPrice)}
          </li>
        ))}
      </ul>

      <h3>Tổng tiền: {formatCurrency(totalAmount)}</h3>

      {/* Nút thanh toán */}
      <button
        onClick={handlePayClick}
        disabled={status === "loading"}
        style={{ padding: "8px 16px", fontSize: "16px", cursor: "pointer" }}
      >
        {status === "loading" ? "Đang tạo yêu cầu thanh toán..." : "Thanh toán"}
      </button>

      {/* Trạng thái / lỗi */}
      {status === "error" && (
        <div style={{ marginTop: "16px", color: "red" }}>
          <p>Lỗi khi tạo payment: {error}</p>
          <button onClick={handlePayClick}>Thử lại</button>
        </div>
      )}

      {/* Kết quả payment */}
      {status === "success" && payment && (
        <div style={{ marginTop: "24px" }}>
          <h2>Đang xử lý thanh toán...</h2>
          <p>Mã payment: {payment.id}</p>
          <p>Mã giao dịch cổng: {payment.provider_transaction_id}</p>
          <p>
            QR URL (demo):{" "}
            <a href={payment.qr_url} target="_blank" rel="noreferrer">
              {payment.qr_url}
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
