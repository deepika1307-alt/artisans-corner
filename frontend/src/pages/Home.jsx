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
    const [selectedCategory, setSelectedCategory] = useState('All');

    const { addToCart } = useCart();
    const { user } = useAuth();

    // CATEGORY DETAILS
    const categories = [
        {
            name: 'Handmade Jewellery',
            value: 'Jewellery',
            icon: '💍'
        },
        {
            name: 'Home Decor',
            value: 'Home Decor',
            icon: '🏺'
        },
        {
            name: 'Art & Paintings',
            value: 'Art',
            icon: '🎨'
        },
        {
            name: 'Handmade Gifts',
            value: 'Gifts',
            icon: '🎁'
        }
    ];

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

    // FILTER PRODUCTS BY CATEGORY
    const filteredProducts = selectedCategory === 'All'
        ? products
        : products.filter(
            product =>
                product.category?.toLowerCase() ===
                selectedCategory.toLowerCase()
        );

    // HANDLE CATEGORY CLICK
    const handleCategoryClick = (category) => {
        setSelectedCategory(category);

        document.getElementById('explore')?.scrollIntoView({
            behavior: 'smooth'
        });
    };

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

                    {categories.map((category) => (

                        <button
                            type="button"
                            key={category.value}
                            className={`category-card ${
                                selectedCategory === category.value
                                    ? 'active'
                                    : ''
                            }`}
                            onClick={() =>
                                handleCategoryClick(category.value)
                            }
                        >

                            <span>{category.icon}</span>

                            <h3>{category.name}</h3>

                        </button>

                    ))}

                </div>

            </section>

            {/* FEATURED PRODUCTS */}

            <section className="featured-section" id="explore">

                <div className="section-heading">

                    <p>HANDPICKED FOR YOU</p>

                    <h2>
                        {selectedCategory === 'All'
                            ? 'Discover Handmade Treasures'
                            : categories.find(
                                category =>
                                    category.value === selectedCategory
                            )?.name || 'Discover Handmade Treasures'
                        }
                    </h2>

                    {/* ALL PRODUCTS BUTTON */}

                    {selectedCategory !== 'All' && (
                        <button
                            type="button"
                            className="all-products-button"
                            onClick={() => setSelectedCategory('All')}
                        >
                            ← View All Products
                        </button>
                    )}

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

                ) : filteredProducts.length === 0 ? (

                    <div className="dashboard-empty">

                        <span>✿</span>

                        <h3>
                            {selectedCategory === 'All'
                                ? 'No products available yet.'
                                : 'No products found in this category.'
                            }
                        </h3>

                        <p>
                            {selectedCategory === 'All'
                                ? 'Check back soon for beautiful handmade creations!'
                                : 'Explore other categories to discover beautiful creations.'
                            }
                        </p>

                        {selectedCategory !== 'All' && (
                            <button
                                type="button"
                                className="all-products-button"
                                onClick={() => setSelectedCategory('All')}
                            >
                                Explore All Products
                            </button>
                        )}

                    </div>

                ) : (

                    <div className="products-grid">

                        {filteredProducts.map((product) => (

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

                <Link
                    to={user ? '/become-seller' : '/register'}
                    className="seller-button"
                >
                    Start Selling
                </Link>

            </section>

        </div>
    );
}

export default Home;