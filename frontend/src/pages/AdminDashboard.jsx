import { useEffect, useState } from 'react';
import API from '../services/api';

function AdminDashboard() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await API.get('/products');
                const data = response.data.products || response.data;
                setProducts(Array.isArray(data) ? data : []);
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

    const totalStock = products.reduce(
        (total, product) => total + (product.stock || 0), 0
    );

    const inventoryValue = products.reduce(
        (total, product) =>
            total + (product.price || 0) * (product.stock || 0), 0
    );

    return (
        <div className="admin-dashboard">

            <div className="admin-header">
                <span>ADMINISTRATION</span>
                <h1>Admin Dashboard</h1>
                <p>Welcome to Artisan's Corner administration!</p>
            </div>

            {loading ? (
                <p>Loading marketplace...</p>
            ) : error ? (
                <p>{error}</p>
            ) : (
                <>
                    <h2>Marketplace Overview</h2>

                    <div className="admin-stats">

                        <div className="admin-stat-card">
                            <h3>Total Products</h3>
                            <h2>{products.length}</h2>
                        </div>

                        <div className="admin-stat-card">
                            <h3>Total Stock</h3>
                            <h2>{totalStock}</h2>
                        </div>

                        <div className="admin-stat-card">
                            <h3>Inventory Value</h3>
                            <h2>
                                ₹{inventoryValue.toLocaleString('en-IN')}
                            </h2>
                        </div>

                    </div>

                    <div className="admin-products-section">
                        <h2>All Marketplace Products</h2>

                        {products.length === 0 ? (
                            <p>No products available.</p>
                        ) : (
                            <div className="admin-product-grid">

                                {products.map((product) => (
                                    <div
                                        key={product._id}
                                        className="admin-product-card"
                                    >
                                        <img
                                            src={
                                                product.images?.[0] ||
                                                'https://placehold.co/300x230?text=Handmade+Product'
                                            }
                                            alt={product.productName}
                                        />

                                        <div className="admin-product-info">
                                            <h3>{product.productName}</h3>

                                            <p>{product.category}</p>

                                            <p className="admin-product-price">
                                                ₹{product.price}
                                            </p>

                                            <span className="admin-product-stock">
                                                Stock: {product.stock}
                                            </span>
                                        </div>
                                    </div>
                                ))}

                            </div>
                        )}
                    </div>
                </>
            )}

        </div>
    );
}

export default AdminDashboard;