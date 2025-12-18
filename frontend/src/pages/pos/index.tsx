import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { MdRestaurantMenu } from "react-icons/md";
import BackButton from "../../components/staff/shared/BackButton";
import MenuContainer from "../../components/staff/pos/MenuContainer";
import CustomerInfo from "../../components/staff/pos/CustomerInfo";
import CartInfo from "../../components/staff/pos/CartInfo";
import Bill from "../../components/staff/pos/Bill";
import { usePOSStore } from "../../stores/posStore";
import { useOrders, useOrderItems } from "../../hooks/useApi";

export default function POSPage() {
  const location = useLocation();
  const customer = usePOSStore((state) => state.customer);
  const updateTable = usePOSStore((state) => state.updateTable);

  // Get table data from navigation state
  const tableData = location.state as {
    tableId: number;
    tableNo: string;
    seats: number;
    status: string;
  } | null;

  // Fetch orders for this table
  const { data: ordersData } = useOrders(
    tableData?.tableId ? { table_id: tableData.tableId } : {},
    {
      enabled: !!tableData?.tableId,
      refetchInterval: 5000, // Refresh every 5 seconds
    }
  );

  // Get the active order (status_id 1 or 2: pending or cooking)
  const activeOrder = ordersData?.find(order =>
    order.status_id && order.status_id >= 1 && order.status_id <= 2
  );

  // Fetch order items if there's an active order
  const { data: orderItems } = useOrderItems(
    activeOrder ? { order_id: activeOrder.id } : undefined,
    {
      enabled: !!activeOrder,
      refetchInterval: 5000,
    }
  );

  // Update POS store with table data from navigation
  useEffect(() => {
    if (tableData) {
      updateTable(tableData.tableId, tableData.tableNo);
    }
  }, [tableData, updateTable]);

  useEffect(() => {
    document.title = "POS | Menu";
  }, []);

  return (
    <section className="bg-[#1f1f1f] h-[calc(100vh-5rem)] overflow-hidden flex gap-3">
      {/* Left Div */}
      <div className="flex-[3]">
        <div className="flex items-center justify-between px-10 py-4">
          <div className="flex items-center gap-4">
            <BackButton />
            <h1 className="text-[#f5f5f5] text-2xl font-bold tracking-wider">
              Menu
            </h1>
          </div>
          <div className="flex items-center justify-around gap-4">
            <div className="flex items-center gap-3 cursor-pointer">
              <MdRestaurantMenu className="text-[#f5f5f5] text-4xl" />
              <div className="flex flex-col items-start">
                <h1 className="text-md text-[#f5f5f5] font-semibold tracking-wide">
                  {customer.customerName || "Customer Name"}
                </h1>
                <p className="text-xs text-[#ababab] font-medium">
                  Table : {customer.table?.tableNo || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <MenuContainer />
      </div>
      {/* Right Div */}
      <div className="flex-[1] bg-[#1a1a1a] mt-4 mr-3 h-[780px] rounded-lg pt-2">
        {/* Customer Info */}
        <CustomerInfo />
        <hr className="border-[#2a2a2a] border-t-2" />
        {/* Cart Items + Existing Order Items */}
        <CartInfo existingOrderItems={orderItems} />
        <hr className="border-[#2a2a2a] border-t-2" />
        {/* Bills */}
        <Bill activeOrder={activeOrder} existingOrderItems={orderItems} />
      </div>
    </section>
  );
}
