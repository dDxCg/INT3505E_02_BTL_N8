import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, DollarSign, RefreshCw } from 'lucide-react';
import {
  useTable,
  useOrders,
  useOrderItems,
  useUpdateOrderItem,
  useUpdateOrder,
  useCreatePayment,
} from '../../hooks/useApi';
import { OrderItemCard } from '../../components/staff/OrderItemCard';
import type { OrderRead, OrderItemRead } from '../../types';

export const TableDetailPage = () => {
  const { tableId } = useParams<{ tableId: string }>();
  const navigate = useNavigate();
  const tableIdNum = parseInt(tableId || '0');

  const { data: table, isLoading: tableLoading } = useTable(tableIdNum);
  const {
    data: orders,
    isLoading: ordersLoading,
    refetch: refetchOrders,
  } = useOrders({ table_id: tableIdNum, status_id: 1 }); // Active orders only

  const activeOrder = orders?.[0]; // Assuming one active order per table

  const {
    data: orderItems,
    isLoading: itemsLoading,
    refetch: refetchItems,
  } = useOrderItems(
    activeOrder ? { order_id: activeOrder.id } : undefined
  );

  const updateOrderItem = useUpdateOrderItem();
  const updateOrder = useUpdateOrder();
  const createPayment = useCreatePayment();

  const [totalAmount, setTotalAmount] = useState(0);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

  useEffect(() => {
    if (orderItems) {
      const total = orderItems.reduce(
        (sum: number, item: OrderItemRead) =>
          sum + parseFloat(item.dish.price) * item.quantity,
        0
      );
      setTotalAmount(total);
    }
  }, [orderItems]);

  const handleUpdateItemStatus = async (itemId: number, statusId: number) => {
    try {
      await updateOrderItem.mutateAsync({
        id: itemId,
        data: { status_id: statusId },
      });
      refetchItems();
    } catch (error) {
      console.error('Failed to update item status:', error);
      alert('Có lỗi khi cập nhật trạng thái món');
    }
  };

  const handlePayment = async () => {
    if (!activeOrder) return;

    const confirmPayment = window.confirm(
      `Xác nhận thanh toán ${totalAmount.toLocaleString('vi-VN')}đ?`
    );

    if (!confirmPayment) return;

    setIsPaymentProcessing(true);
    try {
      // Create payment record
      await createPayment.mutateAsync({
        booking_id: activeOrder.id,
        currency: 'VND',
        amount: totalAmount.toString(),
        method_id: 1, // Cash - adjust based on your setup
        provider_id: 1, // Internal - adjust based on your setup
        provider_transaction_id: `TXN-${Date.now()}`, // Generate unique ID
        status_id: 1, // Completed - adjust based on your setup
      });

      // Update order status to completed (assuming status_id = 3 is completed)
      await updateOrder.mutateAsync({
        id: activeOrder.id,
        data: { status_id: 3 },
      });

      alert('Thanh toán thành công!');
      navigate('/staff');
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Có lỗi khi thanh toán. Vui lòng thử lại.');
    } finally {
      setIsPaymentProcessing(false);
    }
  };

  const handleRefresh = () => {
    refetchOrders();
    refetchItems();
  };

  const isLoading = tableLoading || ordersLoading || itemsLoading;

  const pendingItems = orderItems?.filter((item: OrderItemRead) => item.status_id === 1) || [];
  const servedItems = orderItems?.filter((item: OrderItemRead) => item.status_id === 2) || [];

  if (!tableId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Không tìm thấy bàn</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/staff')}
                className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <h1 className="text-2xl font-bold">
                Bàn {table?.number || tableId}
              </h1>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="p-2 bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw size={24} className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>

          {table && (
            <div className="text-sm opacity-90">
              Số ghế: {table.seats} | Trạng thái:{' '}
              {activeOrder ? 'Đang phục vụ' : 'Trống'}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        {!activeOrder ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Bàn này chưa có order nào</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Pending Items */}
            {pendingItems.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-3">
                  Đang chờ ({pendingItems.length})
                </h2>
                <div className="space-y-3">
                  {pendingItems.map((item: OrderItemRead) => (
                    <OrderItemCard
                      key={item.id}
                      item={item}
                      onUpdateStatus={handleUpdateItemStatus}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Served Items */}
            {servedItems.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-3">
                  Đã phục vụ ({servedItems.length})
                </h2>
                <div className="space-y-3">
                  {servedItems.map((item: OrderItemRead) => (
                    <OrderItemCard
                      key={item.id}
                      item={item}
                      onUpdateStatus={handleUpdateItemStatus}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Payment Section */}
            <div className="bg-white rounded-lg shadow-lg p-6 sticky bottom-0">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-bold text-gray-900">
                  Tổng cộng:
                </span>
                <span className="text-2xl font-bold text-blue-600">
                  {totalAmount.toLocaleString('vi-VN')}đ
                </span>
              </div>

              <button
                onClick={handlePayment}
                disabled={isPaymentProcessing || orderItems?.length === 0}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <DollarSign size={20} />
                <span>
                  {isPaymentProcessing ? 'Đang xử lý...' : 'Thanh toán'}
                </span>
              </button>

              {pendingItems.length > 0 && (
                <p className="text-sm text-yellow-600 mt-2 text-center">
                  Lưu ý: Còn {pendingItems.length} món chưa phục vụ
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
