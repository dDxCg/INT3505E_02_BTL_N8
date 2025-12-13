import { useEffect, useRef } from "react";
import { RiDeleteBin2Fill } from "react-icons/ri";
import { FaNotesMedical } from "react-icons/fa6";
import { FaCheckCircle } from "react-icons/fa";
import { usePOSStore } from "../../../stores/posStore";
import type { OrderItemRead } from "../../../types";

interface CartInfoProps {
  existingOrderItems?: OrderItemRead[];
}

const CartInfo: React.FC<CartInfoProps> = ({ existingOrderItems }) => {
  const cart = usePOSStore((state) => state.cart);
  const removeFromCart = usePOSStore((state) => state.removeFromCart);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [cart, existingOrderItems]);

  const handleRemove = (itemId: number) => {
    removeFromCart(itemId);
  };

  // Get status color
  const getStatusColor = (statusId: number) => {
    switch (statusId) {
      case 1: return "text-yellow-500"; // Pending
      case 2: return "text-orange-500"; // Cooking
      case 3: return "text-green-500"; // Ready
      case 4: return "text-blue-500"; // Served
      default: return "text-gray-500";
    }
  };

  return (
    <div className="px-4 py-2">
      <h1 className="text-lg text-[#e4e4e4] font-semibold tracking-wide">
        Order Details
      </h1>
      <div className="mt-4 overflow-y-scroll scrollbar-hide h-[380px]" ref={scrollRef}>
        {!existingOrderItems?.length && cart.length === 0 ? (
          <p className="text-[#ababab] text-sm flex justify-center items-center h-[380px]">
            No items yet. Start adding items!
          </p>
        ) : (
          <>
            {/* Existing Order Items (from table) */}
            {existingOrderItems && existingOrderItems.length > 0 && (
              <>
                <h2 className="text-xs text-[#ababab] font-medium mb-2 mt-2">
                  Existing Orders
                </h2>
                {existingOrderItems.map((item) => (
                  <div key={`existing-${item.id}`} className="bg-[#262626] rounded-lg px-4 py-4 mb-2 border-l-4 border-green-600">
                    <div className="flex items-center justify-between">
                      <h1 className="text-[#ababab] font-semibold tracking-wide text-md">
                        {item.dish.name}
                      </h1>
                      <p className="text-[#ababab] font-semibold">x{item.quantity}</p>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2 bg-[#1f1f1f] px-3 py-2 rounded-lg">
                        <FaCheckCircle className={`${getStatusColor(item.status_id)}`} size={16} />
                        <span className={`text-xs ${getStatusColor(item.status_id)}`}>
                          {item.status.status}
                        </span>
                      </div>
                      <p className="text-[#f5f5f5] text-md font-bold">
                        {(parseFloat(item.dish.price.toString()) * item.quantity).toLocaleString('vi-VN')}₫
                      </p>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* New Cart Items */}
            {cart.length > 0 && (
              <>
                <h2 className="text-xs text-[#ababab] font-medium mb-2 mt-4">
                  New Items to Add
                </h2>
                {cart.map((item) => (
                  <div key={item.id} className="bg-[#1f1f1f] rounded-lg px-4 py-4 mb-2 border-l-4 border-yellow-500">
                    <div className="flex items-center justify-between">
                      <h1 className="text-[#ababab] font-semibold tracking-wide text-md">
                        {item.name}
                      </h1>
                      <p className="text-[#ababab] font-semibold">x{item.quantity}</p>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-3">
                        <RiDeleteBin2Fill
                          onClick={() => handleRemove(item.id)}
                          className="text-[#ababab] cursor-pointer hover:text-red-500"
                          size={20}
                        />
                        <FaNotesMedical
                          className="text-[#ababab] cursor-pointer"
                          size={20}
                        />
                      </div>
                      <p className="text-[#f5f5f5] text-md font-bold">{item.price.toLocaleString('vi-VN')}₫</p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CartInfo;
