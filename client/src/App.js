import React from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Import des providers
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Import des composants
import Header from './components/common/Header';
import Footer from './components/common/Footer';

// Import des pages - Vérifiez que tous ces fichiers existent
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import VerifyOTP from './components/auth/VerifyOTP';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import Checkout from './pages/Checkout';
import OrderHistory from './pages/OrderHistory';
import OrderConfirmation from './pages/OrderConfirmation';
import ProtectedRoute from './components/ProtectedRoute';
import TrackOrder from './pages/TrackOrder';
import UserOrders from './pages/UserOrders';
import ChangePassword from './pages/ChangePassword';
import ProfileSettings from './pages/ProfileSettings';
import OrderSuccess from './pages/OrderSuccess';


// Import conditionnel pour Profile seulement s'il manque
let Profile;

try {
  Profile = require('./pages/Profile').default;
} catch {
  Profile = () => (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h2>Page Profil en cours de développement</h2>
    </div>
  );
}

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Toaster position="top-right" reverseOrder={false} />
      <AuthProvider>
        <CartProvider>
          <Router>
            <Header />
            <Routes>
              {/* Routes publiques */}
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/verify-otp" element={<VerifyOTP />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/order-success/:orderNumber" element={<OrderSuccess />} />

              {/* Suivi des commande */}
              <Route path="/track" element={<TrackOrder />} />
              {/* Optionnel : accès direct via numéro de commande */}
              <Route path="/track/:orderNumber" element={<TrackOrder />} />
              
              {/* Confirmation de commande */}
              <Route path="/order/:orderId" element={<OrderConfirmation />} />

              {/* Routes protégées */}
              <Route path='/my-orders' element={
                <ProtectedRoute>
                  <UserOrders/>
                </ProtectedRoute>
                
              } />
              <Route path="/checkout" element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              } />
              <Route path="/orders" element={
                <ProtectedRoute>
                  <OrderHistory />
                </ProtectedRoute>
              } />
             
             
              {/* Profile */}

              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/profile/settings" element={
                <ProtectedRoute>
                  <ProfileSettings />
                </ProtectedRoute>
              } />
              <Route path="/profile/change-password" element={
                <ProtectedRoute>
                  <ChangePassword />
                </ProtectedRoute>
              } />
            </Routes>
            <Footer />
          </Router>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;