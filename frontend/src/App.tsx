import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PaymentUserScreen from './pages/PaymentUser/PaymentUserScreen';
import PaymentVNPayScreen from './pages/PaymentUser/PaymentVNPayScreen';

// Guest Pages
import GuestOrderPage from "./pages/guest";
import MyOrderPage from "./pages/guest/my-order";

// Staff Pages
import StaffDashboard from './pages/staff/StaffDashboard';
import StaffTableDetail from './pages/staff/StaffTableDetail';
import POSPage from './pages/pos';
import TablesPage from './pages/staff/TablesPage';
import OrdersPage from './pages/staff/OrdersPage';

// Staff Layout
import StaffLayout from './components/staff/shared/StaffLayout';

// Admin Page
import AdminPage from "@/pages/Admin/Admin";

// Review Page
import ReviewPage from './pages/Feedback/ReviewPage';
import GuestDisplayPage from './pages/Feedback/GuestDisplayPage';

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

          {/* Guest Routes - NO LAYOUT */}
          <Route path="/order" element={<GuestOrderPage />} />
          <Route path="/order/:tableId" element={<GuestOrderPage />} />
          <Route path="/my-order" element={<MyOrderPage />} />
          <Route path="/my-order/:tableId" element={<MyOrderPage />} />

          {/* Staff Routes - WITH STAFF LAYOUT */}
          <Route path="/staff" element={<StaffLayout />}>
            <Route index element={<StaffDashboard />} />
            <Route path="tables" element={<TablesPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="pos" element={<POSPage />} />
            <Route path="table/:tableId" element={<StaffTableDetail />} />
          </Route>

          {/* Payment Routes - NO LAYOUT */}
          <Route
            path="/staff/payment/order/:orderId"
            element={<PaymentUserScreen />}
          />
          <Route path="/payment/vnpay-demo" element={<PaymentVNPayScreen />} />
          <Route path="/payment-demo" element={<PaymentUserScreen />} />

          {/* Feedback Routes - NO LAYOUT */}
          <Route path="/guest-display" element={<GuestDisplayPage />} />
          <Route path="/review" element={<ReviewPage />} />
          {/* Admin Routes - NO LAYOUT */}
          <Route path="/admin" element={<AdminPage />} />
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
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </QueryClientProvider>
  );
}

export default App;
