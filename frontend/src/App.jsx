import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import BecomeSeller from './pages/BecomeSeller';
import VendorDashboard from './pages/VendorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Cart from './pages/cart';
import Checkout from './pages/Checkout';
import MyOrders from './pages/MyOrders';
import ProductReviews from './pages/ProductReviews';
import ProductDetails from './pages/ProductDetails';

import { useAuth } from './context/AuthContext';

import './App.css';

// Protected Route
function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) return <h2>Loading...</h2>;

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

// Admin-only Route
function AdminRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) return <h2>Loading...</h2>;

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!user.roles?.includes('admin')) {
        return <Navigate to="/" replace />;
    }

    return children;
}

function App() {
    return (
        <BrowserRouter>
            <Navbar />

            <Routes>
                {/* Home */}
                <Route path="/" element={<Home />} />

                {/* Authentication */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Seller Onboarding */}
                <Route
                    path="/become-seller"
                    element={
                        <ProtectedRoute>
                            <BecomeSeller />
                        </ProtectedRoute>
                    }
                />

                {/* Vendor Dashboard */}
                <Route
                    path="/vendor-dashboard"
                    element={
                        <ProtectedRoute>
                            <VendorDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Admin Dashboard */}
                <Route
                    path="/admin-dashboard"
                    element={
                        <AdminRoute>
                            <AdminDashboard />
                        </AdminRoute>
                    }
                />

                {/* Shopping Cart */}
                <Route path="/cart" element={<Cart />} />

                {/* Checkout */}
                <Route
                    path="/checkout"
                    element={
                        <ProtectedRoute>
                            <Checkout />
                        </ProtectedRoute>
                    }
                />

                {/* My Orders */}
                <Route
                    path="/my-orders"
                    element={
                        <ProtectedRoute>
                            <MyOrders />
                        </ProtectedRoute>
                    }
                />

                {/* Product Details */}
                <Route
                    path="/products/:id"
                    element={<ProductDetails />}
                />

                {/* Product Reviews */}
                <Route
                    path="/products/:productId/reviews"
                    element={<ProductReviews />}
                />
            </Routes>

            <Footer />
        </BrowserRouter>
    );
}

export default App;