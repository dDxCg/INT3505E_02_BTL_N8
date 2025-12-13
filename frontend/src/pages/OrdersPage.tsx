import { useState, useEffect, useMemo } from "react";
import BackButton from "../components/staff/shared/BackButton";
import OrderCard from "../components/staff/orders/OrderCard";
import { useOrders, useOrderItems } from "../hooks/useApi";
import type { Order } from "../types/staff.types";

const OrdersPage: React.FC = () => {
  const [status, setStatus] = useState("all");

  // Map status filter to status_id
  const getStatusId = (statusFilter: string): number | undefined => {
    switch (statusFilter) {
      case "pending":
        return 1; // PENDING - Guest orders start here!
      case "progress":
        return 2; // COOKING
      case "ready":
        return 3; // COMPLETED
      case "completed":
        return 4; // PAID
      default:
        return undefined; // all
    }
  };

  // Fetch orders from API with optional status filter
  const statusId = getStatusId(status);
  const { data: ordersData, isLoading, error } = useOrders(
    statusId ? { status_id: statusId } : {}  // Pass empty object instead of undefined
  );

  useEffect(() => {
    document.title = "POS | Orders";
  }, []);

  // Debug logging
  useEffect(() => {
    console.log("OrdersPage - Status filter:", status);
    console.log("OrdersPage - Status ID:", statusId);
    console.log("OrdersPage - Orders data:", ordersData);
    console.log("OrdersPage - Mapped orders:", orders);
  }, [status, statusId, ordersData, orders]);

  // Map backend orders to frontend Order type
  const orders: Order[] = useMemo(() => {
    if (!ordersData) return [];

    return ordersData.map((order) => {
      // Map status_id to status name
      const getStatusName = (statusId: number): string => {
        switch (statusId) {
          case 1:
            return "Pending";
          case 2:
            return "In Progress";
          case 3:
            return "Ready";
          case 4:
            return "Completed";
          case 5:
            return "Cancelled";
          default:
            return "Unknown";
        }
      };

      return {
        id: order.id.toString(),
        customer: order.guest_id ? `Guest ${order.guest_id}` : `Customer ${order.id}`,
        tableNo: order.table_id.toString(),
        status: getStatusName(order.status_id),
        dateTime: new Date().toISOString(), // Backend doesn't provide created_at, using current time
        items: 0, // Will be updated if we fetch order items
        total: 0, // Will be updated if we fetch order total
      };
    });
  }, [ordersData]);

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
    <section className="bg-[#1f1f1f] h-[calc(100vh-5rem)] overflow-hidden">
      <div className="flex items-center justify-between px-10 py-4">
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
            onClick={() => setStatus("pending")}
            className={`text-[#ababab] text-lg ${
              status === "pending" && "bg-[#383838] rounded-lg px-5 py-2"
            }  rounded-lg px-5 py-2 font-semibold`}
          >
            Pending
          </button>
          <button
            onClick={() => setStatus("progress")}
            className={`text-[#ababab] text-lg ${
              status === "progress" && "bg-[#383838] rounded-lg px-5 py-2"
            }  rounded-lg px-5 py-2 font-semibold`}
          >
            In Progress
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
            onClick={() => setStatus("completed")}
            className={`text-[#ababab] text-lg ${
              status === "completed" && "bg-[#383838] rounded-lg px-5 py-2"
            }  rounded-lg px-5 py-2 font-semibold`}
          >
            Completed
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 px-16 py-4 overflow-y-scroll scrollbar-hide">
        {orders.length > 0 ? (
          orders.map((order) => {
            return <OrderCard key={order.id} order={order} />;
          })
        ) : (
          <p className="col-span-3 text-gray-500">No orders available</p>
        )}
      </div>
    </section>
  );
};

export default OrdersPage;
