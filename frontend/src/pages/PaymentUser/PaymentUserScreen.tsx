// frontend/src/pages/PaymentUser/PaymentUserScreen.tsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import "./PaymentUserScreen.css";

const API_BASE_URL = "http://localhost:8000/api/v1";
const DEMO_ORDER_ID = 1; // fallback khi mở /payment-demo

type PaymentStatus =
  | "PENDING"
  | "SUCCESS"
  | "FAILED"
  | "EXPIRED"
  | "REFUNDED"
  | "UNKNOWN";

interface Payment {
  id: number;
  amount: number;
  currency: string;
  status?: PaymentStatus | string;
  status_id?: number;
  provider_transaction_id?: string;
  qr_url?: string;
  created_at?: string;
}

interface Order {
  id: number;
  table_id: number;
  status_id: number;
  guest_id: number | null;
}

interface TableInfo {
  id: number;
  number: number;
  seats: number;
}

interface OrderItemDish {
  id: number;
  name: string;
  price: string; // "40000.00"
  description: string | null;
}

interface OrderItemStatus {
  id: number;
  status: string;
}

interface OrderItem {
  id: number;
  order_id: number;
  dish_id: number;
  status_id: number;
  quantity: number;
  dish: OrderItemDish;
  status: OrderItemStatus;
}

// lịch sử payment theo bàn: backend trả thêm order_id (hoặc chưa có)
interface TablePaymentHistoryItem extends Payment {
  order_id?: number;
}

type LocationState = {
  tableLabel?: string; // ví dụ: "4"
  guestCount?: number;
  openedAt?: string;
};

function formatCurrency(amount: number) {
  return amount.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  });
}

function formatProviderTxId(id?: string) {
  if (!id) return "—";
  if (id.length <= 18) return id;
  const head = id.slice(0, 10);
  const tail = id.slice(-6);
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

  return "status-badge pending";
}

// map từ tên trạng thái sang status_id cho backend
function statusToId(status: Exclude<PaymentStatus, "UNKNOWN">): number {
  switch (status) {
    case "PENDING":
      return 1;
    case "SUCCESS":
      return 2;
    case "FAILED":
      return 3;
    case "EXPIRED":
      return 4;
    case "REFUNDED":
      return 5;
  }
}

export default function PaymentUserScreen() {
  const { orderId: orderIdParam } = useParams<{ orderId?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const locationState = (location.state as LocationState) || {};

  // ---- identify order ----
  const ORDER_ID = useMemo(() => {
    if (!orderIdParam) return DEMO_ORDER_ID;
    const n = Number(orderIdParam);
    if (!Number.isFinite(n) || n <= 0) return DEMO_ORDER_ID;
    return n;
  }, [orderIdParam]);

  // ---- ORDER + TABLE + ITEMS ----
  const [order, setOrder] = useState<Order | null>(null);
  const [tableInfo, setTableInfo] = useState<TableInfo | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);
  const [errorOrder, setErrorOrder] = useState<string | null>(null);
  const [errorOrderItems, setErrorOrderItems] = useState<string | null>(null);

  // ---- PAYMENTS ----
  const [payment, setPayment] = useState<Payment | null>(null);
  const [errorPayment, setErrorPayment] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // ---- HISTORY THEO BÀN ----
  const [tableHistory, setTableHistory] = useState<TablePaymentHistoryItem[]>(
    []
  );

  // ---- TỔNG TIỀN ----
  const totalAmount = useMemo(() => {
    if (!orderItems.length) return 0;
    return orderItems.reduce((sum, item) => {
      const price = Number(item.dish.price || 0);
      return sum + price * item.quantity;
    }, 0);
  }, [orderItems]);

  const isPending =
    !!payment &&
    (payment.status?.toString().toUpperCase() === "PENDING" ||
      payment.status_id === 1);

  const isSuccess =
    !!payment &&
    (payment.status?.toString().toUpperCase() === "SUCCESS" ||
      payment.status_id === 2);

  // --------- API HELPERS ---------

  // đóng order khi thanh toán thành công
  async function closeOrder(orderId: number) {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status_id: 3 }),
      });
      if (!res.ok) {
        console.error(
          "[Payment] Failed to close order",
          res.status,
          await res.text()
        );
      }
    } catch (err) {
      console.error("[Payment] Error when closing order:", err);
    }
  }

  // lịch sử thanh toán của 1 bàn (qua /payments?booking_id=table_id)
  async function fetchTableHistory(tableId: number) {
    // if (!tableId) return;
    // try {
    //   const res = await fetch(`${API_BASE_URL}/payments?booking_id=${tableId}`);
    //   if (!res.ok) return;
    //   const data: TablePaymentHistoryItem[] = await res.json();
    //   // sort mới nhất lên trên
    //   const sorted = [...data].sort((a, b) => {
    //     const ta = a.created_at ? Date.parse(a.created_at) : 0;
    //     const tb = b.created_at ? Date.parse(b.created_at) : 0;
    //     return tb - ta;
    //   });
    //   setTableHistory(sorted);
    //   // chọn payment MỚI NHẤT của bàn làm current payment
    //   if (sorted.length > 0) {
    //     setPayment(sorted[0]); // ← KHÔNG còn set null nên block trạng thái không biến mất nữa
    //   } else {
    //     setPayment(null);
    //   }
    // } catch (err) {
    //   console.error("[Payment] Error when fetching table history:", err);
    // }
  }

  async function fetchOrderAndItems(currentOrderId: number) {
    try {
      setIsLoadingOrder(true);
      setErrorOrder(null);
      setErrorOrderItems(null);

      const orderUrl = `${API_BASE_URL}/orders/${currentOrderId}`;
      const itemsUrl = `${API_BASE_URL}/orders/items/?order_id=${currentOrderId}`;

      const [orderRes, itemsRes] = await Promise.all([
        fetch(orderUrl),
        fetch(itemsUrl),
      ]);

      if (!orderRes.ok) {
        setErrorOrder(
          `Không lấy được thông tin order (HTTP ${orderRes.status})`
        );
      } else {
        const orderData: Order = await orderRes.json();
        setOrder(orderData);

        // load thông tin bàn + lịch sử thanh toán theo bàn
        if (orderData.table_id) {
          try {
            const tableRes = await fetch(
              `${API_BASE_URL}/tables/${orderData.table_id}`
            );
            if (tableRes.ok) {
              const tableData: TableInfo = await tableRes.json();
              setTableInfo(tableData);
            }
          } catch (err) {
            console.error("[Payment] Error when fetching table info:", err);
          }

          await fetchTableHistory(orderData.table_id);
        }
      }

      if (!itemsRes.ok) {
        setErrorOrderItems(
          `Không lấy được danh sách món (HTTP ${itemsRes.status})`
        );
      } else {
        const itemsData: OrderItem[] = await itemsRes.json();
        setOrderItems(itemsData);
      }
    } catch (err) {
      console.error("[Payment] Error when fetching order/items:", err);
      if (!errorOrder) setErrorOrder("Không lấy được thông tin order");
      if (!errorOrderItems) setErrorOrderItems("Không lấy được danh sách món");
    } finally {
      setIsLoadingOrder(false);
    }
  }

  async function handleCreatePayment() {
    if (!totalAmount) {
      setErrorPayment("Order chưa có món, không thể tạo payment.");
      return;
    }
    if (!order || !order.table_id) {
      setErrorPayment("Không xác định được bàn cho order này.");
      return;
    }

    try {
      setIsCreating(true);
      setErrorPayment(null);

      const body = {
        booking_id: order.id, // ❗ booking_id != table_id
        amount: totalAmount,
        currency: "VND",
        method_id: 1,
        provider_id: 1,
      };

      const res = await fetch(`${API_BASE_URL}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Tạo payment thất bại: ${res.status} - ${text}`);
      }

      const data: Payment = await res.json();
      // console.log(data);
      setPayment(data);

      if (order.table_id) {
        await fetchTableHistory(order.table_id);
      }
    } catch (err) {
      console.error(err);
      const message =
        err instanceof Error ? err.message : "Có lỗi xảy ra khi tạo payment";
      setErrorPayment(message);
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

      if (order?.table_id) {
        await fetchTableHistory(order.table_id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefreshing(false);
    }
  }

  async function handleUpdateStatus(
    newStatus: Exclude<PaymentStatus, "UNKNOWN">
  ) {
    if (!payment) return;

    try {
      setIsUpdatingStatus(true);
      setErrorPayment(null);

      if (newStatus === "REFUNDED") {
        // dùng endpoint refund riêng
        const res = await fetch(
          `${API_BASE_URL}/payments/${payment.id}/refund`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              amount: payment.amount,
              reason: "Manual refund từ màn staff",
            }),
          }
        );

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Hoàn tiền thất bại: ${res.status} - ${text}`);
        }
      } else {
        // các trạng thái khác dùng PUT /payments/{id} với status_id (KHÔNG còn 422)
        const status_id = statusToId(newStatus);

        const res = await fetch(`${API_BASE_URL}/payments/${payment.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status_id }),
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(
            `Cập nhật trạng thái thất bại: ${res.status} - ${text}`
          );
        }
      }

      // nếu SUCCESS thì đóng order
      if (newStatus === "SUCCESS") {
        await closeOrder(ORDER_ID);
      }

      // refresh lại payment + history
      if (order?.table_id) {
        await fetchTableHistory(order.table_id);
      }
      await handleRefreshStatus();
    } catch (err) {
      console.error(err);
      const message =
        err instanceof Error
          ? err.message
          : "Có lỗi xảy ra khi cập nhật trạng thái";
      setErrorPayment(message);
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  // --------- INIT ---------
  useEffect(() => {
    fetchOrderAndItems(ORDER_ID);
  }, [ORDER_ID]);

  // --------- UI ---------

  const tableLabel =
    locationState.tableLabel ??
    (tableInfo?.number
      ? tableInfo.number.toString()
      : order?.id
      ? order.id.toString()
      : "—");

  const guestCount =
    locationState.guestCount !== undefined ? locationState.guestCount : "—";
  const openedAt = locationState.openedAt ?? "—";

  return (
    <div className="payment-page">
      <div className="payment-card">
        <header className="payment-header">
          <div>
            <p className="payment-subtitle">
              Demo thanh toán qua Payment Service
            </p>
            <h1 className="payment-title">Thanh toán bàn {tableLabel}</h1>
            <p className="payment-meta">
              Số khách: <strong>{guestCount}</strong> · Mở lúc{" "}
              <strong>{openedAt}</strong> · Mã order <strong>{ORDER_ID}</strong>
            </p>
            {errorOrder && (
              <p className="error-text" style={{ marginTop: 4 }}>
                {errorOrder}
              </p>
            )}
          </div>

          <div className="payment-amount-box">
            <span className="amount-label">Tổng cần thanh toán</span>
            <span className="amount-value">
              {formatCurrency(totalAmount || 0)}
            </span>
          </div>
        </header>

        {/* DANH SÁCH MÓN */}
        <section className="payment-section">
          <h2 className="section-title">Danh sách món</h2>

          {isLoadingOrder ? (
            <p className="muted-text">Đang tải dữ liệu order…</p>
          ) : orderItems.length === 0 ? (
            <p className="muted-text">Order chưa có món nào.</p>
          ) : (
            <div className="items-table">
              {orderItems.map((item) => (
                <div key={item.id} className="item-row">
                  <div className="item-name">{item.dish.name}</div>
                  <div className="item-qty">x{item.quantity}</div>
                  <div className="item-line">
                    {formatCurrency(Number(item.dish.price) * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {errorOrderItems && (
            <p className="error-text">Lỗi: {errorOrderItems}</p>
          )}
        </section>

        {/* NÚT TẠO PAYMENT */}
        <section className="payment-section">
          <div className="payment-actions">
            <button
              className="primary-button"
              onClick={handleCreatePayment}
              disabled={
                isCreating ||
                isPending ||
                isSuccess || // khóa nút khi đã thanh toán thành công
                totalAmount === 0
              }
            >
              {isCreating
                ? "Đang tạo payment..."
                : isPending
                ? "Đang xử lý thanh toán..."
                : isSuccess
                ? "Đã thanh toán thành công"
                : "Thanh toán"}
            </button>
            {errorPayment && <p className="error-text">Lỗi: {errorPayment}</p>}
          </div>
        </section>

        {/* TRẠNG THÁI HIỆN TẠI */}
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

            {/* NÚT XÁC NHẬN TRẠNG THÁI */}
            <div className="status-actions">
              <span className="status-actions-label">Xác nhận trạng thái:</span>
              <div className="status-actions-buttons">
                <button
                  className="status-btn success"
                  onClick={() => handleUpdateStatus("SUCCESS")}
                  disabled={isUpdatingStatus}
                >
                  Đã thanh toán
                </button>
                <button
                  className="status-btn failed"
                  onClick={() => handleUpdateStatus("FAILED")}
                  disabled={isUpdatingStatus}
                >
                  Thanh toán thất bại
                </button>
                <button
                  className="status-btn expired"
                  onClick={() => handleUpdateStatus("EXPIRED")}
                  disabled={isUpdatingStatus}
                >
                  Hết hạn
                </button>
                <button
                  className="status-btn refunded"
                  onClick={() => handleUpdateStatus("REFUNDED")}
                  disabled={isUpdatingStatus}
                >
                  Đã hoàn tiền
                </button>
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

        {/* LỊCH SỬ THANH TOÁN CỦA BÀN */}
        <section className="payment-section">
          <h2 className="section-title">
            Lịch sử thanh toán của bàn {tableLabel}
          </h2>

          {tableHistory.length === 0 ? (
            <p className="muted-text">Chưa có giao dịch nào cho bàn này.</p>
          ) : (
            <div className="history-table-wrapper">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Số tiền</th>
                    <th>Trạng thái</th>
                    <th>Thời gian tạo</th>
                  </tr>
                </thead>
                <tbody>
                  {tableHistory.map((p) => (
                    <tr key={p.id}>
                      <td>#{p.order_id}</td>
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

        {/* NÚT QUAY LẠI DASHBOARD */}
        <section className="payment-section">
          <button
            className="secondary-button"
            onClick={() => navigate("/staff")}
          >
            ⬅️ Quay lại Staff Dashboard
          </button>
        </section>
      </div>
    </div>
  );
}
