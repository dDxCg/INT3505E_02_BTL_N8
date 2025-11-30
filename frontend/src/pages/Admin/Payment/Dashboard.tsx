// frontend/src/pages/Admin/Payment/Dashboard.tsx
import React, { useCallback, useEffect, useState } from "react";
import { Table } from "@/components/Admin/Table/Table";
import type { Payment } from "./types";

const METHOD_LABELS: Record<number, string> = {
  1: "Bank transfer",
  2: "E-Wallet",
};

const PROVIDER_LABELS: Record<number, string> = {
  1: "MoMo",
  2: "VNPAY",
  3: "ZaloPay",
};

const STATUS_LABELS: Record<number, string> = {
  1: "Pending",
  2: "Success",
  3: "Failed",
  4: "Expired",
  5: "Refunded",
};

const formatAmount = (amount: number, currency: string) =>
  `${amount.toLocaleString("vi-VN")} ${currency}`;

const formatDateTime = (iso: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString("vi-VN");
};

// ==== Toast ====

type ToastType = "success" | "error";

interface ToastState {
  type: ToastType;
  message: string;
}

// ==== Modal props ====

interface PaymentDetailModalProps {
  payment: Payment;
  onClose: () => void;
  onUpdated: (payment: Payment) => void;
  onNotify: (type: ToastType, message: string) => void;
}

// ==== Modal component ====

const PaymentDetailModal: React.FC<PaymentDetailModalProps> = ({
  payment,
  onClose,
  onUpdated,
  onNotify,
}) => {
  const [statusId, setStatusId] = useState<number>(payment.status_id);
  const [saving, setSaving] = useState(false);

  const handleUpdateStatus = async () => {
    setSaving(true);
    try {
      const res = await fetch(
        `http://localhost:8000/api/v1/payments/${payment.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status_id: statusId,
          }),
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const updated: Payment = await res.json();
      onUpdated(updated);
      onNotify("success", "Cập nhật trạng thái payment thành công.");
      onClose();
    } catch (err) {
      console.error("Failed to update payment:", err);
      onNotify("error", "Không cập nhật được trạng thái payment.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1100,
      }}
    >
      <div
        style={{
          background: "white",
          padding: "24px 32px",
          borderRadius: 8,
          maxWidth: 800,
          width: "90%",
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: 16 }}>
          Payment #{payment.id}
        </h2>

        <p>
          <strong>Booking:</strong> {payment.booking_id}
        </p>
        <p>
          <strong>Amount:</strong>{" "}
          {formatAmount(payment.amount, payment.currency)}
        </p>
        <p>
          <strong>Method:</strong>{" "}
          {METHOD_LABELS[Number(payment.method_id)] ?? payment.method_id}
        </p>
        <p>
          <strong>Provider:</strong>{" "}
          {PROVIDER_LABELS[Number(payment.provider_id)] ?? payment.provider_id}
        </p>
        <p>
          <strong>Status:</strong>{" "}
          <select
            value={statusId}
            onChange={(e) => setStatusId(Number(e.target.value))}
          >
            {Object.entries(STATUS_LABELS).map(([id, label]) => (
              <option key={id} value={Number(id)}>
                {label}
              </option>
            ))}
          </select>
        </p>
        <p>
          <strong>Paid at:</strong> {formatDateTime(payment.paid_at)}
        </p>
        <p>
          <strong>QR URL:</strong>{" "}
          {payment.qr_url ? (
            <a href={payment.qr_url} target="_blank" rel="noreferrer">
              Mở liên kết
            </a>
          ) : (
            "—"
          )}
        </p>
        <p>
          <strong>Provider Txn ID:</strong>{" "}
          {payment.provider_transaction_id ?? "—"}
        </p>

        <div style={{ marginTop: 24, display: "flex", gap: 8 }}>
          <button onClick={handleUpdateStatus} disabled={saving}>
            {saving ? "Updating..." : "Update status"}
          </button>
          <button onClick={onClose} type="button">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ==== Main dashboard ====

// status filter dùng union type rõ ràng, tránh string | number mơ hồ
type StatusFilter = "all" | 1 | 2 | 3 | 4 | 5;

interface PaymentRow {
  id: number;
  booking_id: number;
  amount: string;
  method: string;
  provider: string;
  status: string;
  paid_at: string;
  qr_url: string;
  provider_transaction_id: string;
}

const PaymentDashboard: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // filter state
  const [bookingFilter, setBookingFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  // modal + toast
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((type: ToastType, message: string) => {
    setToast({ type, message });
    window.setTimeout(() => {
      setToast(null);
    }, 3000);
  }, []);

  const loadPayments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:8000/api/v1/payments");
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data: Payment[] = await res.json();
      setPayments(data);
      showToast("success", "Đã tải danh sách payments.");
    } catch (err) {
      console.error("Failed to load payments:", err);
      setError("Không tải được danh sách payments.");
      showToast("error", "Không tải được danh sách payments.");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void loadPayments();
  }, [loadPayments]);

  const filteredPayments = payments.filter((p) => {
    const matchBooking =
      bookingFilter.trim() === "" ||
      String(p.booking_id).includes(bookingFilter.trim());

    const matchStatus =
      statusFilter === "all" ? true : p.status_id === statusFilter;

    return matchBooking && matchStatus;
  });

  const tableData: PaymentRow[] = filteredPayments.map((p) => ({
    id: p.id,
    booking_id: p.booking_id,
    amount: formatAmount(p.amount, p.currency),
    method: METHOD_LABELS[Number(p.method_id)] ?? String(p.method_id),
    provider: PROVIDER_LABELS[Number(p.provider_id)] ?? String(p.provider_id),
    status: STATUS_LABELS[Number(p.status_id)] ?? String(p.status_id),
    paid_at: formatDateTime(p.paid_at),
    qr_url: p.qr_url ?? "",
    provider_transaction_id: p.provider_transaction_id ?? "",
}));


  const handleOpenDetail = (row: PaymentRow) => {
    const found = payments.find((p) => p.id === row.id);
    if (found) {
      setSelectedPayment(found);
    }
  };

  const handleUpdatedPayment = (updated: Payment) => {
    setPayments((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
  };

  return (
    <div style={{ position: "relative" }}>
      <h1>Payment Management</h1>

      {/* Controls */}
      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "center",
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <button onClick={loadPayments} disabled={loading}>
          {loading ? "Loading..." : "Reload payments"}
        </button>

        <div>
          <label style={{ marginRight: 4 }}>Booking ID:</label>
          <input
            type="text"
            value={bookingFilter}
            onChange={(e) => setBookingFilter(e.target.value)}
            placeholder="VD: 1, 2, 10..."
            style={{ width: 120 }}
          />
        </div>

        <div>
          <label style={{ marginRight: 4 }}>Status:</label>
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value === "all"
                  ? "all"
                  : (Number(e.target.value) as StatusFilter)
              )
            }
          >
            <option value="all">All</option>
            {Object.entries(STATUS_LABELS).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => {
            setBookingFilter("");
            setStatusFilter("all");
          }}
        >
          Clear filters
        </button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <Table
        data={tableData}
        onEdit={(row: PaymentRow) => handleOpenDetail(row)}
        onDelete={() => {
          /* chưa cần xoá payment */
        }}
      />

      {selectedPayment && (
        <PaymentDetailModal
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
          onUpdated={handleUpdatedPayment}
          onNotify={showToast}
        />
      )}

      {toast && (
        <div
          style={{
            position: "fixed",
            right: 24,
            bottom: 24,
            padding: "10px 14px",
            borderRadius: 6,
            color: "#fff",
            backgroundColor:
              toast.type === "success" ? "#2e7d32" : "#d32f2f",
            boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
            zIndex: 1200,
          }}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default PaymentDashboard;
