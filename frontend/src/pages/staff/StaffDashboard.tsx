import { useEffect } from "react";
import { BsCashCoin } from "react-icons/bs";
import { GrInProgress } from "react-icons/gr";
import Greetings from "../../components/staff/home/Greetings";
import MiniCard from "../../components/staff/home/MiniCard";
import RecentOrders from "../../components/staff/home/RecentOrders";
import PopularDishes from "../../components/staff/home/PopularDishes";

export default function StaffDashboard() {
  useEffect(() => {
    document.title = "POS | Home";
  }, []);

  return (
    <section className="bg-[#1f1f1f] h-[calc(100vh-5rem)] overflow-hidden flex gap-3">
      {/* Left Div */}
      <div className="flex-[3] flex-col gap-8">
        <Greetings />
        <div className="flex items-center w-full gap-3 px-8 mt-8">
          <MiniCard title="CƠ SỞ 1: 144 Xuân Thủy" />
          <MiniCard title="Restro 8"/>
        </div>
      <div>
        <RecentOrders classname="mt-20"/>
      </div>
      </div>
      {/* Right Div */}
      <div className="flex-[2]">
        <PopularDishes />
      </div>
    </section>
  );
}
