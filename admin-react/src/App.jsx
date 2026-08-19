import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ToastProvider } from './hooks/useToast';
import AdminLayout from './components/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Designs from './pages/Designs';
import Categories from './pages/Categories';
import CategoryGallery from './pages/CategoryGallery';
import Orders from './pages/Orders';
import Testimonials from './pages/Testimonials';
import Pricing from './pages/Pricing';
import Settings from './pages/Settings';
import Users from './pages/Users';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/admin/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/admin/login" element={
              <PublicRoute><Login /></PublicRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute><AdminLayout /></ProtectedRoute>
            }>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="designs" element={<Designs />} />
              <Route path="categories" element={<Categories />} />
              <Route path="category-gallery/:categoryId" element={<CategoryGallery />} />
              <Route path="orders" element={<Orders />} />
              <Route path="users" element={<Users />} />
              <Route path="testimonials" element={<Testimonials />} />
              <Route path="pricing" element={<Pricing />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
