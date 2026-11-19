import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useCart } from '../context/CartContext';

function ProductDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);

                const response = await API.get(`/products/${id}`);

                setProduct(
                    response.data.product || response.data
                );

                setError('');
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    'Unable to load product details.'
                );
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    const handleAddToCart = () => {
        addToCart(product);
        alert('Product added to cart!');
    };

    if (loading) {
        return (
            <div className="dashboard-message">
                Loading product...
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="dashboard-error">
                {error || 'Product not found.'}

                <button onClick={() => navigate('/')}>
                    Back to Home
                </button>
            </div>
        );
    }

    const image = product.images?.[0];

    return (
        <div className="product-details-page">

            <div className="product-details-container">

                {/* PRODUCT IMAGE */}

                <div className="product-details-image">
                    {image ? (
                        <img
                            src={image}
                            alt={product.productName}
                        />
                    ) : (
                        <p>No product image available.</p>
                    )}
                </div>

                {/* PRODUCT INFORMATION */}

                <div className="product-details-info">

                    <p className="product-category">
                        {product.category}
                    </p>

                    <h1>{product.productName}</h1>

                    <h2>
                        ₹{Number(product.price).toLocaleString('en-IN')}
                    </h2>

                    <p className="product-description">
                        {product.description}
                    </p>

                    <p>
                        <strong>Availability:</strong>{' '}
                        {product.stock > 0
                            ? `${product.stock} available`
                            : 'Out of stock'}
                    </p>

                    <p>
                        <strong>Store:</strong>{' '}
                        {product.store?.storeName || 'Artisan Store'}
                    </p>

                    {/* ADD TO CART */}

                    <button
                        onClick={handleAddToCart}
                        disabled={!product.stock}
                    >
                        {product.stock > 0
                            ? 'Add to Cart'
                            : 'Out of Stock'}
                    </button>

                </div>

            </div>

        </div>
    );
}

export default ProductDetails;