import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import ProductManager from "./pages/admin/ProductManager";
import CategoryManager from "./pages/admin/CategoryManager";
import UserManager from "./pages/admin/UserManager";
import Home from "./pages/Home";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/cart/Cart";
import OrderHistory from "./pages/order/OrderHistory";
// import VnpayReturn from "./pages/order/VnpayReturn";
// import Checkout from "./pages/order/Checkout";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        {/* ========== PUBLIC ROUTE ========== */}
        <Route path="/" element={<Home></Home>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* ========== ADMIN ROUTE ========== */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<ProductManager />} />
          <Route path="categories" element={<CategoryManager />} />
          <Route path="users" element={<UserManager />} />
        </Route>

        {/* ========== USER ROUTE ========== */}
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<OrderHistory />} />
          {/* <Route path="/checkout" element={<Checkout />} /> */}
          {/* <Route path="/payment/vnpay_return" element={<VnpayReturn />} /> */}

        {/* ========== 404 PAGE ========== */}
        <Route
          path="*"
          element={
            <div className="text-center mt-5">
              <h2>404 - Page Not Found</h2>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
