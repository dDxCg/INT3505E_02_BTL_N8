import { useState, useEffect, useMemo } from "react";
import BackButton from "../../components/staff/shared/BackButton";
import OrderCard from "../../components/staff/orders/OrderCard";
import OrderDetailModal from "../../components/staff/orders/OrderDetailModal";
import { useOrders, useOrderItems, useOrderTotal } from "../../hooks/useApi";
import type { Order } from "../../types/staff.types";
import type { OrderRead } from "../../types";

// Wrapper component that fetches total and items count for a single order
const OrderCardWithData: React.FC<{ orderData: OrderRead; onOrderClick: (order: Order) => void }> = ({ orderData, onOrderClick }) => {
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

  return <OrderCard order={order} onClick={() => onOrderClick(order)} />;
};

const OrdersPage: React.FC = () => {
  const [status, setStatus] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Map status filter to status_id
  const getStatusId = (statusFilter: string): number | undefined => {
    switch (statusFilter) {
      case "created":
        return 1; // CREATED
      case "preparing":
        return 2; // PREPARING
      case "ready":
        return 3; // READY
      case "served":
        return 4; // SERVED
      case "completed":
        return 5; // COMPLETED
      default:
        return undefined; // all
    }
  };

  // Fetch orders from API with optional status filter
  const statusId = getStatusId(status);
  const { data: ordersData, isLoading, error } = useOrders(
    statusId ? { status_id: statusId } : {}  // Pass empty object instead of undefined
  );

  // Sort orders in descending order (newest first)
  const sortedOrders = useMemo(() => {
    if (!ordersData) return [];
    return [...ordersData].sort((a, b) => b.id - a.id);
  }, [ordersData]);

  useEffect(() => {
    document.title = "POS | Orders";
  }, []);

  // Debug logging
  useEffect(() => {
    console.log("OrdersPage - Status filter:", status);
    console.log("OrdersPage - Status ID:", statusId);
    console.log("OrdersPage - Orders data:", ordersData);
  }, [status, statusId, ordersData]);

  // Loading state
  if (isLoading) {
    return (
      <section className="bg-[#1f1f1f] h-[calc(100vh-5rem)] overflow-hidden flex items-center justify-center">
        <div className="text-[#f5f5f5] text-xl">Loading orders...</div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="bg-[#1f1f1f] h-[calc(100vh-5rem)] overflow-hidden flex items-center justify-center">
        <div className="text-red-500 text-xl">
          Error loading orders. Please try again.
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#1f1f1f] min-h-screen flex flex-col">
      <div className="flex-shrink-0 flex items-center justify-between px-10 py-4">
        <div className="flex items-center gap-4">
          <BackButton />
          <h1 className="text-[#f5f5f5] text-2xl font-bold tracking-wider">
            Orders
          </h1>
        </div>
        <div className="flex items-center justify-around gap-4">
          <button
            onClick={() => setStatus("all")}
            className={`text-[#ababab] text-lg ${
              status === "all" && "bg-[#383838] rounded-lg px-5 py-2"
            }  rounded-lg px-5 py-2 font-semibold`}
          >
            All
          </button>
          <button
            onClick={() => setStatus("created")}
            className={`text-[#ababab] text-lg ${
              status === "created" && "bg-[#383838] rounded-lg px-5 py-2"
            }  rounded-lg px-5 py-2 font-semibold`}
          >
            Created
          </button>
          <button
            onClick={() => setStatus("preparing")}
            className={`text-[#ababab] text-lg ${
              status === "preparing" && "bg-[#383838] rounded-lg px-5 py-2"
            }  rounded-lg px-5 py-2 font-semibold`}
          >
            Preparing
          </button>
          <button
            onClick={() => setStatus("ready")}
            className={`text-[#ababab] text-lg ${
              status === "ready" && "bg-[#383838] rounded-lg px-5 py-2"
            }  rounded-lg px-5 py-2 font-semibold`}
          >
            Ready
          </button>
          <button
            onClick={() => setStatus("served")}
            className={`text-[#ababab] text-lg ${
              status === "served" && "bg-[#383838] rounded-lg px-5 py-2"
            }  rounded-lg px-5 py-2 font-semibold`}
          >
            Served
          </button>
          <button
            onClick={() => setStatus("completed")}
            className={`text-[#ababab] text-lg ${
              status === "completed" && "bg-[#383838] rounded-lg px-5 py-2"
            }  rounded-lg px-5 py-2 font-semibold`}
          >
            Completed
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-[repeat(auto-fill,minmax(400px,1fr))] gap-4 px-8 py-6 overflow-y-auto content-start auto-rows-min">
        {sortedOrders && sortedOrders.length > 0 ? (
          sortedOrders.map((orderData) => {
            return <OrderCardWithData key={orderData.id} orderData={orderData} onOrderClick={setSelectedOrder} />;
          })
        ) : (
          <p className="col-span-full text-gray-500 text-center">No orders available</p>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </section>
  );
};

export default OrdersPage;
