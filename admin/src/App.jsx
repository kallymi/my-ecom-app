import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";

import AdminLayout from "./components/layout/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Products from "./pages/admin/Products";
import ProductForm from "./pages/admin/ProductForm";
import EditProduct from "./pages/admin/EditProduct";
import Categories from "./pages/admin/Categories";
import CategoryForm from "./pages/admin/CategoryForm";
import EditUser from "./pages/admin/EditUser";
import ProductDetails from "./pages/admin/ProductDetails";
import Orders from "./pages/admin/Orders";
import Users from "./pages/admin/Users";
import Login from "./pages/auth/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import TrashPage from "./pages/admin/TrashPage";
import AdminReturnManagement from "./pages/admin/ReturnManagement";


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Auth */}
          <Route path="/login" element={<Login />} />

          {/* Admin */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="products/new" element={<ProductForm />} />
            <Route path="products/:id" element={<ProductDetails />} />
            <Route path="products/:id/edit" element={<EditProduct />} />
            <Route path="orders" element={<Orders />} />
            <Route path="returns" element={<AdminReturnManagement />} />
            <Route path="users" element={<Users />} />
            <Route path="users/edit/:id" element={<EditUser />} />
            <Route path="categories" element={<Categories />} />
            <Route path="categories/new" element={<CategoryForm />} />
            <Route path="categories/:id/edit" element={<CategoryForm />} />
            <Route path="trash" element={<TrashPage />} />
          </Route>

        </Routes>

      </Router>
    </AuthProvider>
  );
}

export default App;
