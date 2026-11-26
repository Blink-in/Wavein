import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import GuestRoute from "./GuestRoute";
import PublicLayout from "../layouts/PublicLayout";
import MerchantLayout from "../layouts/MerchantLayout";
import HomePage from "../pages/public/HomePage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ProductsPage from "../pages/merchant/ProductsPage";
import OrdersPage from "../pages/merchant/OrdersPage";
import CustomersPage from "../pages/merchant/CustomersPage";

import MerchantDashboard from "../pages/merchant/MerchantDashboard";
import StoreSetupPage from "../pages/merchant/StoreSetupPage";

const AdminPage = () => (
  <div className="min-h-screen bg-[#F5FAFE] p-8">
    <h1 className="text-3xl font-bold text-[#15334A]">
      Platform Administration
    </h1>
  </div>
);

const NotFoundPage = () => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-[#F5FAFE]">
    <h1 className="text-5xl font-bold text-sky-500">404</h1>

    <p className="mt-3 text-slate-500">
      Page not found.
    </p>

    <Link
      to="/"
      className="mt-5 font-semibold text-sky-600"
    >
      Return home
    </Link>
  </div>
);

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
        </Route>

        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedRoute requiredRole="user" />}>
  <Route path="/dashboard" element={<MerchantLayout />}>
    <Route index element={<MerchantDashboard />} />
    <Route path="store-setup" element={<StoreSetupPage />} />
    <Route path="products" element={<ProductsPage />} />
    <Route path="orders" element={<OrdersPage />} />
    <Route path="customers" element={<CustomersPage />} />
  </Route>
</Route>

        <Route element={<ProtectedRoute requiredRole="platformAdmin" />}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
