import { useState, useMemo, useEffect } from "react";
import { GrRadialSelected } from "react-icons/gr";
import { FaShoppingCart } from "react-icons/fa";
import { usePOSStore } from "../../../stores/posStore";
import { useDishes, useTags } from "../../../hooks/useApi";
import type { MenuCategory, MenuItem } from "../../../types/staff.types";

const MenuContainer: React.FC = () => {
  // Fetch dishes with tags and images from API
  const { data: dishesData, isLoading } = useDishes();
  const { data: tagsData, isLoading: tagsLoading } = useTags();
  const addToCart = usePOSStore((state) => state.addToCart);

  // Create menu categories from tags
  const menus: MenuCategory[] = useMemo(() => {
    if (!dishesData || !tagsData) return [];

    // Sort dishes by ID ascending for consistent ordering
    const sortedDishes = [...dishesData].sort((a, b) => a.id - b.id);

    // Create categories from tags only (no "Tất cả" category)
    const tagCategories: MenuCategory[] = tagsData.map((tag, index) => {
      const categoryDishes = sortedDishes
        .filter(dish => dish.tags?.some(dishTag => dishTag.id === tag.id))
        .map(dish => ({
          id: dish.id,
          name: dish.name,
          price: typeof dish.price === 'string' ? parseFloat(dish.price) : dish.price,
          category: tag.name,
          image_url: dish.image_url
        }));

      // Assign colors based on tag
      const colors = ["#2e7d32", "#f57c00", "#c2185b", "#0288d1"];
      const icons = ["🥗", "🍖", "🍰", "🥤"];

      return {
        id: tag.id,
        name: tag.name,
        bgColor: colors[index % colors.length],
        icon: icons[index % icons.length],
        items: categoryDishes
      };
    });

    return tagCategories;
  }, [dishesData, tagsData]);

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
  if (isLoading || tagsLoading) {
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
    <div className="flex flex-col gap-10">
      
      {/* Category Grid */}
      <div className="grid grid-cols-4 gap-4 px-10 py-4 w-[100%] mb-0">
        {menus.map((menu) => {
          return (
            <div
              key={menu.id}
              className="flex flex-col items-center justify-center p-4 rounded-lg h-[100px] cursor-pointer"
              style={{ backgroundColor: menu.bgColor }}
              onClick={() => {
                setSelected(menu);
                setItemId(0);
                setItemCount(0);
              }}
            >
              <div className="flex flex-col items-center justify-center w-full gap-2">
                <h1 className="text-[#f5f5f5] text-2xl font-bold flex flex-col items-center">
                  {menu.icon} {menu.name}
                </h1>
                {selected?.id === menu.id && (
                  <GrRadialSelected className="text-white" size={20} />
                )}
              </div>
    
            </div>
          );
        })}
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-5 gap-3 px-10 py-4 w-[100%] overflow-y-auto max-h-[calc(100vh-300px)]">
        {selected?.items.map((item) => {
          return (
            <div
              key={item.id}
              className="flex flex-col items-start justify-between rounded-lg h-[200px] cursor-pointer hover:bg-[#2a2a2a] bg-[#1a1a1a] overflow-hidden"
            >
              {/* Dish Image */}
              <div className="w-full h-[110px] bg-gray-800 overflow-hidden">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200">
                    <span className="text-3xl">🍜</span>
                  </div>
                )}
              </div>

              {/* Item Info */}
              <div className="p-3 w-full flex flex-col gap-1">
                <div className="flex items-start justify-between w-full gap-2">
                  <h1 className="text-[#f5f5f5] text-sm font-semibold line-clamp-1 flex-1">
                    {item.name}
                  </h1>
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="bg-[#2e4a40] text-[#02ca3a] p-1.5 rounded-lg flex-shrink-0"
                  >
                    <FaShoppingCart size={12} />
                  </button>
                </div>
                <div className="flex items-center justify-between w-full">
                  <p className="text-[#f5f5f5] text-sm font-bold">
                    {item.price.toLocaleString('vi-VN')}₫
                  </p>
                  <div className="flex items-center justify-between bg-[#1f1f1f] px-2 py-1 rounded-lg gap-2">
                    <button
                      onClick={() => decrement(item.id)}
                      className="text-yellow-500 text-base"
                    >
                      &minus;
                    </button>
                    <span className="text-white text-xs min-w-[15px] text-center">
                      {itemId === item.id ? itemCount : "0"}
                    </span>
                    <button
                      onClick={() => increment(item.id)}
                      className="text-yellow-500 text-base"
                    >
                      &#43;
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MenuContainer;
