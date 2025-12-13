import { useState, useMemo, useEffect } from "react";
import { GrRadialSelected } from "react-icons/gr";
import { FaShoppingCart } from "react-icons/fa";
import { usePOSStore } from "../../../stores/posStore";
import { useDishes } from "../../../hooks/useApi";
import type { MenuCategory, MenuItem } from "../../../types/staff.types";

const MenuContainer: React.FC = () => {
  // Fetch dishes from API
  const { data: dishesData, isLoading } = useDishes();
  const addToCart = usePOSStore((state) => state.addToCart);

  // Create menu categories from API dishes
  const menus: MenuCategory[] = useMemo(() => {
    if (!dishesData) return [];

    // For now, put all dishes in one "All Items" category
    // TODO: Backend should add category field to dishes table
    const allItems: MenuItem[] = dishesData.map(dish => ({
      id: dish.id,
      name: dish.name,
      price: typeof dish.price === 'string' ? parseFloat(dish.price) : dish.price,
      category: "All Items"
    }));

    return [
      {
        id: 1,
        name: "All Items",
        bgColor: "#b73e3e",
        icon: "🍽️",
        items: allItems
      }
    ];
  }, [dishesData]);

  const [selected, setSelected] = useState<MenuCategory | null>(null);
  const [itemCount, setItemCount] = useState(0);
  const [itemId, setItemId] = useState<number>();

  // Set default selected category when menus load
  useEffect(() => {
    if (menus.length > 0 && !selected) {
      setSelected(menus[0]);
    }
  }, [menus, selected]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <p className="text-[#f5f5f5] text-xl">Loading menu...</p>
      </div>
    );
  }

  const increment = (id: number) => {
    setItemId(id);
    if (itemCount >= 4) return;
    setItemCount((prev) => prev + 1);
  };

  const decrement = (id: number) => {
    setItemId(id);
    if (itemCount <= 0) return;
    setItemCount((prev) => prev - 1);
  };

  const handleAddToCart = (item: MenuItem) => {
    if (itemCount === 0) return;

    const { id, name, price } = item;
    const newCartItem = {
      id: Date.now(), // Unique ID for cart item
      dish_id: id, // Store original dish ID for API calls
      name,
      pricePerQuantity: price,
      quantity: itemCount,
      price: price * itemCount
    };

    addToCart(newCartItem);
    setItemCount(0);
  };

  return (
    <>
      {/* Category Grid */}
      <div className="grid grid-cols-4 gap-4 px-10 py-4 w-[100%]">
        {menus.map((menu) => {
          return (
            <div
              key={menu.id}
              className="flex flex-col items-start justify-between p-4 rounded-lg h-[100px] cursor-pointer"
              style={{ backgroundColor: menu.bgColor }}
              onClick={() => {
                setSelected(menu);
                setItemId(0);
                setItemCount(0);
              }}
            >
              <div className="flex items-center justify-between w-full">
                <h1 className="text-[#f5f5f5] text-lg font-semibold">
                  {menu.icon} {menu.name}
                </h1>
                {selected?.id === menu.id && (
                  <GrRadialSelected className="text-white" size={20} />
                )}
              </div>
              <p className="text-[#ababab] text-sm font-semibold">
                {menu.items.length} Items
              </p>
            </div>
          );
        })}
      </div>

      <hr className="border-[#2a2a2a] border-t-2 mt-4" />

      {/* Items Grid */}
      <div className="grid grid-cols-4 gap-4 px-10 py-4 w-[100%]">
        {selected?.items.map((item) => {
          return (
            <div
              key={item.id}
              className="flex flex-col items-start justify-between p-4 rounded-lg h-[150px] cursor-pointer hover:bg-[#2a2a2a] bg-[#1a1a1a]"
            >
              <div className="flex items-start justify-between w-full">
                <h1 className="text-[#f5f5f5] text-lg font-semibold">
                  {item.name}
                </h1>
                <button
                  onClick={() => handleAddToCart(item)}
                  className="bg-[#2e4a40] text-[#02ca3a] p-2 rounded-lg"
                >
                  <FaShoppingCart size={20} />
                </button>
              </div>
              <div className="flex items-center justify-between w-full">
                <p className="text-[#f5f5f5] text-xl font-bold">
                  {item.price.toLocaleString('vi-VN')}₫
                </p>
                <div className="flex items-center justify-between bg-[#1f1f1f] px-4 py-3 rounded-lg gap-6 w-[50%]">
                  <button
                    onClick={() => decrement(item.id)}
                    className="text-yellow-500 text-2xl"
                  >
                    &minus;
                  </button>
                  <span className="text-white">
                    {itemId === item.id ? itemCount : "0"}
                  </span>
                  <button
                    onClick={() => increment(item.id)}
                    className="text-yellow-500 text-2xl"
                  >
                    &#43;
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default MenuContainer;
