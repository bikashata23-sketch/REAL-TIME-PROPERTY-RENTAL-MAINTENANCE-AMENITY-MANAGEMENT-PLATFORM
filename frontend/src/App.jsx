import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import { dashboardPathForRole } from './utils/roleRoutes';

import Login from './pages/Login';
import Register from './pages/Register';
import TenantDashboard from './pages/TenantDashboard';
import TenantMaintenance from './pages/TenantMaintenance';
import Amenities from './pages/Amenities';
import BookingHistory from './pages/BookingHistory';
import AdminDashboard from './pages/AdminDashboard';
import Properties from './pages/Properties';
import AdminMaintenance from './pages/AdminMaintenance';
import AdminBookings from './pages/AdminBookings';
import OwnerDashboard from './pages/OwnerDashboard';

// Redirects "/" to the correct dashboard (or login, if signed out)
const RootRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={dashboardPathForRole(user.role)} replace />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<RootRedirect />} />

      {/* Tenant routes */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['tenant']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/tenant/dashboard" element={<TenantDashboard />} />
        <Route path="/tenant/maintenance" element={<TenantMaintenance />} />
        <Route path="/tenant/amenities" element={<Amenities />} />
        <Route path="/tenant/bookings" element={<BookingHistory />} />
      </Route>

      {/* Admin routes */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/properties" element={<Properties />} />
        <Route path="/admin/maintenance" element={<AdminMaintenance />} />
        <Route path="/admin/amenities" element={<Amenities />} />
        <Route path="/admin/bookings" element={<AdminBookings />} />
      </Route>

      {/* Owner routes — owners manage their own properties, review booking
          availability by date, and update maintenance status, mirroring the
          admin toolset but under their own dashboard and navigation. */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['owner']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/owner/dashboard" element={<OwnerDashboard />} />
        <Route path="/owner/properties" element={<Properties />} />
        <Route path="/owner/maintenance" element={<AdminMaintenance />} />
        <Route path="/owner/amenities" element={<Amenities />} />
        <Route path="/owner/bookings" element={<AdminBookings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Toaster position="top-right" />
          <AppRoutes />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
