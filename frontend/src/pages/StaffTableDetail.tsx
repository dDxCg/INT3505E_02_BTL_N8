import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  DollarSign,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import {
  getTableById,
  getOrderByTable,
  getOrderItems,
  updateItemStatus,
  deleteOrderItem,
  updateOrder,
} from '../services/api';
import type { TableRead, OrderRead, OrderItemRead } from '../types/schema';

export default function StaffTableDetail() {
  const { tableId } = useParams<{ tableId: string }>();
  const navigate = useNavigate();

  // State
  const [table, setTable] = useState<TableRead | null>(null);
  const [activeOrder, setActiveOrder] = useState<OrderRead | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItemRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // ============================================
  // FETCH DATA WITH AUTO-REFRESH
  // ============================================

  const fetchTableData = async () => {
    if (!tableId) return;

    try {
      const tableIdNum = parseInt(tableId);

      // Fetch table info and active orders
      const [tableData, orders] = await Promise.all([
        getTableById(tableIdNum),
        getOrderByTable(tableIdNum, 1), // status_id=1 (pending/active)
      ]);

      setTable(tableData);

      if (orders.length > 0) {
        const order = orders[0];
        setActiveOrder(order);

        // Fetch order items
        const items = await getOrderItems(order.id);
        setOrderItems(items);
      } else {
        setActiveOrder(null);
        setOrderItems([]);
      }
    } catch (error) {
      console.error('Failed to fetch table data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTableData();

    // Auto-refresh every 3 seconds
    const interval = setInterval(() => {
      fetchTableData();
    }, 3000);

    return () => clearInterval(interval);
  }, [tableId]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleServeItem = async (itemId: number) => {
    try {
      setActionLoading(itemId);
      await updateItemStatus(itemId, { status_id: 2 }); // 2 = Served
      await fetchTableData(); // Refresh data
    } catch (error) {
      console.error('Failed to serve item:', error);
      alert('Không thể lên món. Vui lòng thử lại.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelItem = async (itemId: number) => {
    if (!confirm('Bạn có chắc muốn hủy món này?')) return;

    try {
      setActionLoading(itemId);
      await deleteOrderItem(itemId);
      await fetchTableData(); // Refresh data
    } catch (error) {
      console.error('Failed to cancel item:', error);
      alert('Không thể hủy món. Vui lòng thử lại.');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePayment = async () => {
    if (!activeOrder) return;

    if (!confirm('Xác nhận thanh toán và đóng bàn?')) return;

    try {
      setPaymentLoading(true);
      await updateOrder(activeOrder.id, { status_id: 3 }); // 3 = Completed
      navigate('/staff'); // Go back to dashboard
    } catch (error) {
      console.error('Failed to complete payment:', error);
      alert('Không thể thanh toán. Vui lòng thử lại.');
      setPaymentLoading(false);
    }
  };

  // ============================================
  // CALCULATIONS
  // ============================================

  const pendingItems = orderItems.filter((item) => item.status_id === 1);
  const servedItems = orderItems.filter((item) => item.status_id === 2);

  const totalAmount = orderItems.reduce(
    (sum, item) => sum + item.dish.price * item.quantity,
    0
  );

  const formatPrice = (price: number): string => {
    return price.toLocaleString('vi-VN') + 'đ';
  };

  // ============================================
  // LOADING STATE
  // ============================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!table) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Không tìm thấy bàn</p>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/staff')}
              className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>

            <div className="text-center flex-1">
              <h1 className="text-2xl font-bold">Bàn #{table.number}</h1>
              <p className="text-sm text-blue-100">{table.seats} chỗ ngồi</p>
            </div>

            <div className="text-right">
              <div className="text-sm text-blue-100">Tổng tiền</div>
              <div className="text-xl font-bold">{formatPrice(totalAmount)}</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {!activeOrder ? (
          /* No Active Order */
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-6xl mb-4">🍽️</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Bàn đang trống
            </h2>
            <p className="text-gray-600">Chưa có order nào đang active</p>
          </div>
        ) : (
          <>
            {/* Pending Items Section */}
            {pendingItems.length > 0 && (
              <section className="mb-6">
                <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 mb-3">
                  <h2 className="text-lg font-bold text-yellow-900 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Cần xử lý ({pendingItems.length} món)
                  </h2>
                </div>

                <div className="space-y-3">
                  {pendingItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-yellow-50 border border-yellow-300 rounded-lg p-4"
                    >
                      {/* Item Info */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-lg">
                            {item.dish.name}
                          </h3>
                          <div className="text-sm text-gray-600 mt-1">
                            Số lượng:{' '}
                            <span className="font-semibold">
                              {item.quantity}
                            </span>
                          </div>
                          <div className="text-orange-600 font-bold mt-1">
                            {formatPrice(item.dish.price * item.quantity)}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => handleServeItem(item.id)}
                          disabled={actionLoading === item.id}
                          className="bg-green-500 text-white py-3 px-4 rounded-lg font-bold text-lg hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {actionLoading === item.id ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Đang xử lý...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-5 h-5" />
                              Lên món
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleCancelItem(item.id)}
                          disabled={actionLoading === item.id}
                          className="bg-gray-400 text-white py-3 px-4 rounded-lg font-bold text-lg hover:bg-red-500 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {actionLoading === item.id ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Đang xử lý...
                            </>
                          ) : (
                            <>
                              <XCircle className="w-5 h-5" />
                              Hủy
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Served Items Section */}
            {servedItems.length > 0 && (
              <section>
                <div className="bg-gray-100 rounded-lg p-3 mb-3">
                  <h2 className="text-lg font-bold text-gray-700">
                    Đã phục vụ ({servedItems.length} món)
                  </h2>
                </div>

                <div className="space-y-2">
                  {servedItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 opacity-70"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-700">
                            {item.dish.name}
                          </h3>
                          <div className="text-sm text-gray-500 mt-1">
                            Số lượng: {item.quantity}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-gray-700 font-bold">
                            {formatPrice(item.dish.price * item.quantity)}
                          </div>
                          <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Đã lên
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Empty State */}
            {pendingItems.length === 0 && servedItems.length === 0 && (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <div className="text-6xl mb-4">📋</div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Chưa có món nào
                </h2>
                <p className="text-gray-600">
                  Order đã tạo nhưng chưa có món được gọi
                </p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer - Payment Button */}
      {activeOrder && orderItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-blue-500 shadow-lg z-20">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <button
              onClick={handlePayment}
              disabled={paymentLoading || pendingItems.length > 0}
              className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-xl hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {paymentLoading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Đang xử lý...
                </>
              ) : pendingItems.length > 0 ? (
                <>
                  <AlertCircle className="w-6 h-6" />
                  Còn {pendingItems.length} món chưa lên
                </>
              ) : (
                <>
                  <DollarSign className="w-6 h-6" />
                  Thanh toán & Đóng bàn - {formatPrice(totalAmount)}
                </>
              )}
            </button>

            {pendingItems.length > 0 && (
              <p className="text-center text-sm text-gray-500 mt-2">
                Vui lòng lên hết món trước khi thanh toán
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
