import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

function Home() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const { addToCart } = useCart();
    const { user } = useAuth();

    // FETCH PUBLIC PRODUCTS
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await API.get('/products');
                setProducts(response.data.products || []);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    'Unable to load products.'
                );
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // ADD PRODUCT TO CART
    const handleAddToCart = (product) => {
        addToCart(product);

        setMessage(`${product.productName} added to cart!`);

        setTimeout(() => {
            setMessage('');
        }, 2500);
    };

    return (
        <div className="home-page">

            {/* HERO SECTION */}

            <section className="hero-section">
                <div className="hero-content">

                    <p className="hero-tag">
                        MADE BY HAND, MADE WITH HEART
                    </p>

                    <h1>
                        Every Creation
                        <br />
                        Has a Story.
                    </h1>

                    <p className="hero-description">
                        Discover unique handmade treasures created
                        with love, creativity and passion by talented artisans.
                    </p>

                    <a href="#explore" className="hero-button">
                        Explore Collection
                    </a>

                </div>

                <div className="hero-decoration">
                    ✿
                </div>
            </section>

            {/* CATEGORIES */}

            <section className="categories-section">

                <div className="section-heading">
                    <p>EXPLORE OUR WORLD</p>
                    <h2>Shop by Category</h2>
                </div>

                <div className="categories-grid">

                    <div className="category-card">
                        <span>💍</span>
                        <h3>Handmade Jewellery</h3>
                    </div>

                    <div className="category-card">
                        <span>🏺</span>
                        <h3>Home Decor</h3>
                    </div>

                    <div className="category-card">
                        <span>🎨</span>
                        <h3>Art & Paintings</h3>
                    </div>

                    <div className="category-card">
                        <span>🎁</span>
                        <h3>Handmade Gifts</h3>
                    </div>

                </div>

            </section>

            {/* FEATURED PRODUCTS */}

            <section className="featured-section" id="explore">

                <div className="section-heading">
                    <p>HANDPICKED FOR YOU</p>
                    <h2>Discover Handmade Treasures</h2>
                </div>

                {message && (
                    <div className="cart-success-message">
                        {message}
                    </div>
                )}

                {loading ? (

                    <div className="dashboard-message">
                        Loading beautiful creations...
                    </div>

                ) : error ? (

                    <div className="dashboard-error">
                        {error}
                    </div>

                ) : products.length === 0 ? (

                    <div className="dashboard-empty">
                        <span>✿</span>
                        <h3>No products available yet.</h3>
                        <p>
                            Check back soon for beautiful handmade creations!
                        </p>
                    </div>

                ) : (

                    <div className="products-grid">

                        {products.map((product) => (

                            <article
                                className="product-card"
                                key={product._id}
                            >

                                <div className="product-image">

                                    {product.images?.[0] ? (

                                        <img
                                            src={product.images[0]}
                                            alt={product.productName}
                                        />

                                    ) : (

                                        <div className="product-no-image">
                                            ✿
                                        </div>

                                    )}

                                </div>

                                <div className="product-info">

                                    <p className="product-category">
                                        {product.category}
                                    </p>

                                    <h3>
                                        {product.productName}
                                    </h3>

                                    <p className="product-description">
                                        {product.description}
                                    </p>

                                    <div className="product-bottom">

                                        <span className="product-price">
                                            ₹{Number(product.price).toLocaleString('en-IN')}
                                        </span>

                                        <span className="product-stock">
                                            {product.stock} available
                                        </span>

                                    </div>

                                    {product.store?.storeName && (
                                        <p className="product-store">
                                            By {product.store.storeName}
                                        </p>
                                    )}

                                    <button
                                        type="button"
                                        className="add-to-cart-button"
                                        onClick={() => handleAddToCart(product)}
                                        disabled={product.stock < 1}
                                    >
                                        {product.stock < 1
                                            ? 'Out of Stock'
                                            : 'Add to Cart 🛒'}
                                    </button>

                                    {/* VIEW REVIEWS */}

                                    <Link
                                        to={`/products/${product._id}/reviews`}
                                        className="view-reviews-button"
                                    >
                                        ⭐ View Reviews
                                    </Link>

                                </div>

                            </article>

                        ))}

                    </div>

                )}

            </section>

            {/* SELLER SECTION */}

            <section className="seller-section">

                <div>
                    <p className="seller-tag">
                        SHARE YOUR CREATIVITY
                    </p>

                    <h2>
                        Turn Your Passion Into Your Own Store.
                    </h2>

                    <p>
                        Join our community of talented artisans
                        and share your creations with the world.
                    </p>
                </div>

                <Link to="/register" className="seller-button">
                    Start Selling
                </Link>

            </section>

        </div>
    );
}

export default Home;