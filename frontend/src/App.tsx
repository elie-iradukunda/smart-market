import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import PricingPage from './pages/PricingPage'
import OrderPage from './pages/OrderPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import PrivacyPage from './pages/PrivacyPage'
import TermsPage from './pages/TermsPage'
import SecurityPage from './pages/SecurityPage'
import Layout from './components/layout/Layout'
import EcommerceLayout from './components/layout/EcommerceLayout'
import LegacyBusinessApp from './LegacyBusinessApp'

// E-commerce pages
import ProductsPage from './pages/Shop/ProductsPage'
import CartPage from './pages/Shop/CartPage'
import ShopLoginPage from './pages/Shop/ShopLoginPage'
import ShopRegisterPage from './pages/Shop/ShopRegisterPage'
import CheckoutPage from './pages/Shop/CheckoutPage'
import OrderTrackingPage from './pages/Shop/OrderTrackingPage'
import MyOrdersPage from './pages/Shop/MyOrdersPage'

// Contexts
import { CartProvider } from './contexts/CartContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <>{children}</> : <Navigate to="/shop/login" replace />
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* E-commerce Routes */}
            <Route path="/" element={<EcommerceLayout><HomePage /></EcommerceLayout>} />
            <Route path="/products" element={<EcommerceLayout><ProductsPage /></EcommerceLayout>} />
            <Route path="/cart" element={<EcommerceLayout><CartPage /></EcommerceLayout>} />
            <Route path="/shop/login" element={<ShopLoginPage />} />
            <Route path="/shop/register" element={<ShopRegisterPage />} />
            <Route
              path="/checkout"
              element={
                <EcommerceLayout>
                  <ProtectedRoute>
                    <CheckoutPage />
                  </ProtectedRoute>
                </EcommerceLayout>
              }
            />
            <Route path="/order-tracking" element={<EcommerceLayout><OrderTrackingPage /></EcommerceLayout>} />
            <Route
              path="/orders"
              element={
                <EcommerceLayout>
                  <ProtectedRoute>
                    <MyOrdersPage />
                  </ProtectedRoute>
                </EcommerceLayout>
              }
            />

            {/* Legacy Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/pricing" element={<Layout><PricingPage /></Layout>} />
            <Route path="/order" element={<Layout><OrderPage /></Layout>} />
            <Route path="/about" element={<Layout><AboutPage /></Layout>} />
            <Route path="/contact" element={<Layout><ContactPage /></Layout>} />
            <Route path="/privacy" element={<Layout><PrivacyPage /></Layout>} />
            <Route path="/terms" element={<Layout><TermsPage /></Layout>} />
            <Route path="/security" element={<Layout><SecurityPage /></Layout>} />
            <Route path="/*" element={<LegacyBusinessApp />} />
          </Routes>
          <ToastContainer />
        </CartProvider>
      </AuthProvider>
    </Router>
  )
}

export default App


