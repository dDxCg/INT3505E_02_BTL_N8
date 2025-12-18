import { useState } from "react";
import { usePOSStore } from "../../../stores/posStore";
import { formatDate, getAvatarName } from "../../../utils/staffUtils";

const CustomerInfo: React.FC = () => {
  const [dateTime] = useState(new Date());
  const customer = usePOSStore((state) => state.customer);

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex flex-col items-start">
        <h1 className="text-md text-[#f5f5f5] font-semibold tracking-wide">
          {customer.customerName || "Customer Name"}
        </h1>
        <p className="text-xs text-[#ababab] font-medium mt-1">
          #{customer.orderId || "N/A"} / Dine in
        </p>
        <p className="text-xs text-[#ababab] font-medium mt-2">
          {formatDate(dateTime)}
        </p>
      </div>
      <button className="bg-[#f6b100] p-3 text-xl font-bold rounded-lg">
        {getAvatarName(customer.customerName) || "CN"}
      </button>
    </div>
  );
};

export default CustomerInfo;
