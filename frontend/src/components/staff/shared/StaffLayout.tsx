import { Outlet } from "react-router-dom";
import Header from "./Header";
import BottomNav from "./BottomNav";
import { useWebSocket } from "../../../hooks/useWebSocket";

const StaffLayout: React.FC = () => {
  // TODO: Get user data from Zustand store
  const userName = "TEST USER";
  const userRole = "Admin";

  // Initialize WebSocket connection for real-time updates
  const { isConnected } = useWebSocket();

  const handleLogout = () => {
    // TODO: Implement logout logic with Zustand
    console.log("Logout");
  };

  return (
    <div className="min-h-screen bg-[#1f1f1f]">
      <Header userName={userName} userRole={userRole} onLogout={handleLogout} />
      <main className="pb-16">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};

export default StaffLayout;
