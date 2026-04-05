import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { GoogleOAuthProvider } from '@react-oauth/google';

// ===============================
// CONTEXTES
// ===============================
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// ===============================
// COMPOSANTS GLOBAUX
// ===============================
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import ScrollToTop from './components/common/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

// ===============================
// PAGES PUBLIQUES
// ===============================
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import VerifyOTP from './components/auth/VerifyOTP';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import OrderSuccess from './pages/OrderSuccess';
import TrackOrder from './pages/TrackOrder';
import OrderConfirmation from './pages/OrderConfirmation';


// ===============================
// PAGES PROTÉGÉES (Connecté)
// ===============================
import Checkout from './components/checkout/index';
import OrderHistory from './pages/OrderHistory';
import UserOrders from './pages/UserOrders';
import ProfileSettings from './pages/ProfileSettings';
import ChangePassword from './pages/ChangePassword';
import OrderDetail from './pages/OrderDetail';

// Import sécurisé de Profile (remplace le try/catch require)
import ProfilePage from './pages/Profile'; 
const Profile = ProfilePage || (() => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <h2 className="text-xl font-bold text-gray-500">Page Profil en cours de développement</h2>
  </div>
));

// ===============================
// CONFIGURATION MUI
// ===============================
// Déclaré à l'extérieur pour éviter les re-rendus inutiles
const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
});

const GOOGLE_CLIENT_ID = "784347486312-9g7rbg9jv6evsh847tmgck5qaj57t0vf.apps.googleusercontent.com";

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Toaster position="top-right" reverseOrder={false} />
          
          <Router>
            <CartProvider> 
                <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
                  <ScrollToTop />
                  <Header />
                  
                  <main className="flex-grow">
                    <Routes>
                      
                      {/* =============================== */}
                      {/* 🟢 ROUTES PUBLIQUES (Toujours accessibles) */}
                      {/* =============================== */}
                      <Route path="/" element={<Home />} />
                      <Route path="/shop" element={<Shop />} />
                      <Route path="/product/:id" element={<ProductDetail />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/order-success/:orderNumber" element={<OrderSuccess />} />
                      <Route path="/track-order" element={<TrackOrder />} />
                      <Route path="/track/:orderNumber" element={<TrackOrder />} />
                      <Route path="/order-confirmation" element={<OrderConfirmation />} />

                      {/* =============================== */}
                      {/* 🔐 ROUTES D'AUTHENTIFICATION (Uniquement si DECONNECTÉ) */}
                      {/* =============================== */}
                      <Route element={<PublicRoute />}>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/verify-otp" element={<VerifyOTP />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                      </Route>

                      {/* =============================== */}
                      {/* 🔒 ROUTES PROTÉGÉES (Uniquement si CONNECTÉ) */}
                      {/* =============================== */}
                      <Route element={<ProtectedRoute />}>
                        {/* Commandes */}
                        <Route path="/orders" element={<OrderHistory />} />
                        <Route path="/my-orders" element={<UserOrders />} />
                        <Route path="/order-detail/:id" element={<OrderDetail />} />

                        {/* Profil utilisateur */}
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/profile/settings" element={<ProfileSettings />} />
                        <Route path="/profile/change-password" element={<ChangePassword />} />
                      </Route>

                    </Routes>
                  </main>

                  <Footer />
                </div>

              </CartProvider>
          </Router>
        </ThemeProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;