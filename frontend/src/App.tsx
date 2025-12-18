// frontend/src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PaymentVNPayScreen from "./pages/PaymentUser/PaymentVNPayScreen";

import RequireAuth from "@/components/auth/RequireAuth";
import LoginPage from "@/pages/auth/LoginPage";

// Guest Pages
import GuestOrderPage from "./pages/guest";
import MyOrderPage from "./pages/guest/my-order";

// Staff Pages
import StaffDashboard from "./pages/staff/StaffDashboard";
import StaffTableDetail from "./pages/staff/StaffTableDetail";
import POSPage from "./pages/pos";
import TablesPage from "./pages/staff/TablesPage";
import OrdersPage from "./pages/staff/OrdersPage";

// Staff Layout
import StaffLayout from "./components/staff/shared/StaffLayout";

// Admin Page
import AdminPage from "@/pages/Admin/Admin";

// Feedback Pages
import ReviewPage from "./pages/Feedback/ReviewPage";
import GuestDisplayPage from "./pages/Feedback/GuestDisplayPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/staff" replace />} />

          {/* Public routes */}
          <Route path="/auth/login" element={<LoginPage />} />

          {/* Guest Routes - NO LAYOUT */}
          <Route path="/order" element={<GuestOrderPage />} />
          <Route path="/order/:tableId" element={<GuestOrderPage />} />
          <Route path="/my-order" element={<MyOrderPage />} />
          <Route path="/my-order/:tableId" element={<MyOrderPage />} />

          {/* Feedback Routes - NO LAYOUT */}
          <Route path="/guest-display" element={<GuestDisplayPage />} />
          <Route path="/review" element={<ReviewPage />} />

          {/* Protected: Staff + Admin */}
          <Route element={<RequireAuth allowedRoles={["staff", "admin"]} />}>
            <Route path="/staff" element={<StaffLayout />}>
              <Route index element={<StaffDashboard />} />
              <Route path="tables" element={<TablesPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="pos" element={<POSPage />} />
              <Route path="table/:tableId" element={<StaffTableDetail />} />
              <Route path="payment/vnpay" element={<PaymentVNPayScreen />} />
            </Route>
          </Route>

          {/* Protected: Admin only */}
          <Route element={<RequireAuth allowedRoles={["admin"]} />}>
            <Route path="/admin" element={<AdminPage />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/staff" replace />} />
        </Routes>
      </BrowserRouter>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </QueryClientProvider>
  );
}

export default App;
