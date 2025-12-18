import { X } from "lucide-react";
import { useOrderItems } from "../../../hooks/useApi";
import type { Order } from "../../../types/staff.types";

interface OrderDetailModalProps {
  order: Order;
  onClose: () => void;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order, onClose }) => {
  // Fetch order items
  const { data: orderItems, isLoading } = useOrderItems({ order_id: parseInt(order.id) });

  // Map status_id to color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Created":
        return "text-blue-500 bg-blue-500/10";
      case "Preparing":
        return "text-orange-500 bg-orange-500/10";
      case "Ready":
        return "text-green-500 bg-green-500/10";
      case "Served":
        return "text-cyan-500 bg-cyan-500/10";
      case "Completed":
        return "text-purple-500 bg-purple-500/10";
      default:
        return "text-gray-500 bg-gray-500/10";
    }
  };

  // Map order item status_id to label and color
  const getItemStatus = (statusId: number) => {
    switch (statusId) {
      case 1:
        return { label: "Pending", color: "text-yellow-500" };
      case 2:
        return { label: "Preparing", color: "text-orange-500" };
      case 3:
        return { label: "Ready", color: "text-green-500" };
      case 4:
        return { label: "Served", color: "text-cyan-500" };
      default:
        return { label: "Unknown", color: "text-gray-500" };
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1f1f1f] rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-[#f5f5f5]">Order Details</h2>
            <p className="text-[#ababab] text-sm mt-1">Order #{order.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#2a2a2a] rounded-lg transition-colors"
          >
            <X className="text-[#ababab]" size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Order Info */}
          <div className="bg-[#262626] rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[#ababab] text-sm">Order</p>
                <p className="text-[#f5f5f5] font-semibold">{order.customer}</p>
              </div>
              <div>
                <p className="text-[#ababab] text-sm">Table</p>
                <p className="text-[#f5f5f5] font-semibold">#{order.tableNo}</p>
              </div>
              <div>
                <p className="text-[#ababab] text-sm">Status</p>
                <p className={`font-semibold px-3 py-1 rounded-lg inline-block ${getStatusColor(order.status)}`}>
                  {order.status}
                </p>
              </div>
              <div>
                <p className="text-[#ababab] text-sm">Total</p>
                <p className="text-[#f5f5f5] font-bold text-xl">
                  {order.total.toLocaleString('vi-VN')}₫
                </p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="text-lg font-semibold text-[#f5f5f5] mb-3">
              Order Items ({order.items})
            </h3>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-[#ababab]">Loading items...</p>
              </div>
            ) : orderItems && orderItems.length > 0 ? (
              <div className="space-y-2">
                {orderItems.map((item) => {
                  const itemStatus = getItemStatus(item.status_id);
                  return (
                    <div
                      key={item.id}
                      className="bg-[#262626] rounded-lg p-4 flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <h4 className="text-[#f5f5f5] font-semibold">
                          {item.dish.name}
                        </h4>
                        <p className="text-[#ababab] text-sm mt-1">
                          Quantity: {item.quantity} × {parseFloat(item.dish.price.toString()).toLocaleString('vi-VN')}₫
                        </p>
                        <p className={`text-sm mt-1 ${itemStatus.color}`}>
                          Status: {itemStatus.label}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[#f5f5f5] font-bold text-lg">
                          {(parseFloat(item.dish.price.toString()) * item.quantity).toLocaleString('vi-VN')}₫
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-[#ababab]">No items in this order</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-700 p-6">
          <button
            onClick={onClose}
            className="w-full bg-[#025cca] hover:bg-[#0250a8] text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
