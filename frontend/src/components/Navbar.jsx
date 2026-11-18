import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

function Navbar() {
    const { user, logout } = useAuth();
    const { cartCount } = useCart();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleExplore = () => {
        if (window.location.pathname !== '/') {
            navigate('/#explore');
        } else {
            document.getElementById('explore')?.scrollIntoView({
                behavior: 'smooth'
            });
        }
    };

    return (
        <nav className="navbar">

            <Link to="/" className="navbar-logo">
                <span className="logo-icon">✿</span>
                <span>Artisan's Corner</span>
            </Link>

            <div className="navbar-links">
                <Link to="/">Home</Link>

                <button
                    type="button"
                    onClick={handleExplore}
                    className="nav-explore-button"
                >
                    Explore
                </button>

                {user && (
                    <Link to="/my-orders">My Orders</Link>
                )}
            </div>

            <div className="navbar-actions">

                <Link to="/cart" className="nav-cart">
                    🛒 Cart
                    <span className="cart-count">
                        {cartCount}
                    </span>
                </Link>

                {user ? (
                    <>
                        {user.roles?.includes('seller') ||
                        user.roles?.includes('admin') ? (
                            <Link
                                to="/vendor-dashboard"
                                className="nav-dashboard"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <Link
                                to="/become-seller"
                                className="nav-seller"
                            >
                                Become a Seller
                            </Link>
                        )}

                        <button
                            className="nav-logout"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="nav-login">
                            Login
                        </Link>

                        <Link to="/register" className="nav-register">
                            Get Started
                        </Link>
                    </>
                )}

            </div>
        </nav>
    );
}

export default Navbar;