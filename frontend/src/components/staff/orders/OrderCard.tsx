import { FaCheckDouble, FaLongArrowAltRight, FaCircle } from "react-icons/fa";
import { formatDateAndTime, getAvatarName } from "../../../utils/staffUtils";
import type { Order } from "../../../types/staff.types";

interface OrderCardProps {
  order: Order;
  onClick?: () => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onClick }) => {
  return (
    <div
      key={order.id}
      onClick={onClick}
      className="w-[500px] bg-[#262626] p-4 rounded-lg mb-4 cursor-pointer hover:bg-[#2a2a2a] transition-colors"
    >
      <div className="flex items-center gap-5">
        <button className="bg-[#f6b100] p-3 text-xl font-bold rounded-lg">
          {getAvatarName(order.customer)}
        </button>
        <div className="flex items-center justify-between w-[100%]">
          <div className="flex flex-col items-start gap-1">
            <h1 className="text-[#f5f5f5] text-lg font-semibold tracking-wide">
              {order.customer}
            </h1>
            <p className="text-[#ababab] text-sm">
              #{Math.floor(new Date(order.dateTime).getTime())} / Dine in
            </p>
            <p className="text-[#ababab] text-sm">
              Table <FaLongArrowAltRight className="text-[#ababab] ml-2 inline" /> {order.tableNo}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {order.status === "Ready" ? (
              <>
                <p className="text-green-600 bg-[#2e4a40] px-2 py-1 rounded-lg">
                  <FaCheckDouble className="inline mr-2" /> {order.status}
                </p>
                <p className="text-[#ababab] text-sm">
                  <FaCircle className="inline mr-2 text-green-600" /> Ready to serve
                </p>
              </>
            ) : (
              <>
                <p className="text-yellow-600 bg-[#4a452e] px-2 py-1 rounded-lg">
                  <FaCircle className="inline mr-2" /> {order.status}
                </p>
                <p className="text-[#ababab] text-sm">
                  <FaCircle className="inline mr-2 text-yellow-600" /> Preparing your order
                </p>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center mt-4 text-[#ababab]">
        <p>{formatDateAndTime(order.dateTime)}</p>
        <p>{order.items} Items</p>
      </div>
      <hr className="w-full mt-4 border-t-1 border-gray-500" />
      <div className="flex items-center justify-between mt-4">
        <h1 className="text-[#f5f5f5] text-lg font-semibold">Total</h1>
        <p className="text-[#f5f5f5] text-lg font-semibold">{order.total.toLocaleString('vi-VN')}₫</p>
      </div>
    </div>
  );
};

export default OrderCard;
