import { useMemo } from "react";
import { FaSearch } from "react-icons/fa";
import { Link } from "react-router-dom";
import OrderList from "./OrderList";
import { useOrders, useOrderItems, useOrderTotal } from "../../../hooks/useApi";
import type { Order } from "../../../types/staff.types";
import type { OrderRead } from "../../../types";

// Wrapper component that fetches total and items count for a single order
const OrderListWithData: React.FC<{ orderData: OrderRead }> = ({ orderData }) => {
  // Fetch order total from API
  const { data: totalData } = useOrderTotal(orderData.id);

  // Fetch order items to count them
  const { data: orderItems } = useOrderItems({ order_id: orderData.id });

  // Map status_id to status name
  const getStatusName = (statusId: number): string => {
    switch (statusId) {
      case 1:
        return "Created";
      case 2:
        return "Preparing";
      case 3:
        return "Ready";
      case 4:
        return "Served";
      case 5:
        return "Completed";
      default:
        return "Unknown";
    }
  };

  const order: Order = {
    id: orderData.id.toString(),
    customer: `Order #${orderData.id}`,
    tableNo: orderData.table_id.toString(),
    status: getStatusName(orderData.status_id),
    dateTime: new Date().toISOString(),
    items: orderItems?.length || 0,
    total: totalData || 0,
  };

  return <OrderList order={order} />;
};

const RecentOrders: React.FC = () => {
  // Fetch all orders from API
  const { data: ordersData, isLoading } = useOrders({});

  // Get latest 7 orders sorted by ID descending
  const recentOrders = useMemo(() => {
    if (!ordersData) return [];
    return [...ordersData].sort((a, b) => b.id - a.id).slice(0, 7);
  }, [ordersData]);

  return (
    <div className="flex-1 px-8 mt-6 flex flex-col min-h-0">
      <div className="bg-[#1a1a1a] w-full flex-1 rounded-lg flex flex-col min-h-0">
        <div className="flex-shrink-0 flex justify-between items-center px-6 py-4">
          <h1 className="text-[#f5f5f5] text-lg font-semibold tracking-wide">
            Recent Orders
          </h1>
          <Link to="/staff/orders" className="text-[#025cca] text-sm font-semibold hover:underline">
            View all
          </Link>
        </div>

        <div className="flex-shrink-0 flex items-center gap-4 bg-[#1f1f1f] rounded-[15px] px-6 py-4 mx-6">
          <FaSearch className="text-[#f5f5f5]" />
          <input
            type="text"
            placeholder="Search recent orders"
            className="bg-[#1f1f1f] outline-none text-[#f5f5f5] w-full"
          />
        </div>

        {/* Order list */}
        <div className="flex-1 mt-4 px-6 overflow-y-auto min-h-0">
          {isLoading ? (
            <p className="text-gray-500 text-center">Loading orders...</p>
          ) : recentOrders.length > 0 ? (
            recentOrders.map((orderData) => {
              return <OrderListWithData key={orderData.id} orderData={orderData} />;
            })
          ) : (
            <p className="text-gray-500 text-center">No orders available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecentOrders;
