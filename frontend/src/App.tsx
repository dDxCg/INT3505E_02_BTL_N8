import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Guest Pages
import GuestOrderPage from './pages/guest';
import MyOrderPage from './pages/guest/my-order';

// Staff Pages
import StaffDashboard from './pages/StaffDashboard';
import StaffTableDetail from './pages/StaffTableDetail';
import POSPage from './pages/pos';

// Create a client for React Query
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

          {/* Guest Routes */}
          <Route path="/order" element={<GuestOrderPage />} />
          <Route path="/order/:tableId" element={<GuestOrderPage />} />
          <Route path="/my-order" element={<MyOrderPage />} />
          <Route path="/my-order/:tableId" element={<MyOrderPage />} />

          {/* Staff Routes */}
          <Route path="/staff" element={<StaffDashboard />} />
          <Route path="/staff/table/:tableId" element={<StaffTableDetail />} />
          <Route path="/staff/pos" element={<POSPage />} />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/staff" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
