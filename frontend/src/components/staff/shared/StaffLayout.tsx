import React from "react";
import { Outlet, useNavigate } from "react-router-dom";

import Header from "./Header";
import BottomNav from "./BottomNav";

import { useWebSocket } from "@/hooks/useWebSocket";
import { clearAuth, getAuth } from "@/hooks/useAuth";

const StaffLayout: React.FC = () => {
  const navigate = useNavigate();

  // nếu staff screens đang cần realtime thì giữ, không cần thì xoá dòng này cũng ok
  useWebSocket();

  const auth = getAuth();
  const userName = auth?.name ?? "TEST USER";
  const userRole = auth?.role === "admin" ? "Admin" : "Staff";

  const handleLogout = () => {
    clearAuth();
    navigate("/auth/login", { replace: true });
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
