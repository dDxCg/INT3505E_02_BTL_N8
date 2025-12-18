import { FaCheckDouble, FaLongArrowAltRight, FaCircle } from "react-icons/fa";
import { getAvatarName } from "../../../utils/staffUtils";
import type { Order } from "../../../types/staff.types";

interface OrderListProps {
  order: Order;
}

const OrderList: React.FC<OrderListProps> = ({ order }) => {
  return (
    <div className="flex items-center gap-5 mb-3">
      <button className="bg-[#f6b100] p-3 text-xl font-bold rounded-lg">
        {getAvatarName(order.customer)}
      </button>
      <div className="flex items-center justify-between w-[100%]">
        <div className="flex flex-col items-start gap-1">
          <h1 className="text-[#f5f5f5] text-lg font-semibold tracking-wide">
            {order.customer}
          </h1>
          <p className="text-[#ababab] text-sm">{order.items} Items</p>
        </div>

        <h1 className="text-[#f6b100] font-semibold border border-[#f6b100] rounded-lg p-1">
          Table <FaLongArrowAltRight className="text-[#ababab] ml-2 inline" />{" "}
          {order.tableNo}
        </h1>

        <div className="flex flex-col items-end gap-2">
          {order.status === "Created" && (
            <p className="text-blue-500 bg-blue-500/10 px-3 py-1 rounded-lg text-sm">
              <FaCircle className="inline mr-2" /> {order.status}
            </p>
          )}
          {order.status === "Preparing" && (
            <p className="text-orange-500 bg-orange-500/10 px-3 py-1 rounded-lg text-sm">
              <FaCircle className="inline mr-2" /> {order.status}
            </p>
          )}
          {order.status === "Ready" && (
            <p className="text-green-500 bg-green-500/10 px-3 py-1 rounded-lg text-sm">
              <FaCheckDouble className="inline mr-2" /> {order.status}
            </p>
          )}
          {order.status === "Served" && (
            <p className="text-cyan-500 bg-cyan-500/10 px-3 py-1 rounded-lg text-sm">
              <FaCheckDouble className="inline mr-2" /> {order.status}
            </p>
          )}
          {order.status === "Completed" && (
            <p className="text-purple-500 bg-purple-500/10 px-3 py-1 rounded-lg text-sm">
              <FaCheckDouble className="inline mr-2" /> {order.status}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderList;
