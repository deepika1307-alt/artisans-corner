import { useEffect, useState } from 'react';
import API from '../services/api';

function AdminDashboard() {
    const [products, setProducts] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                setLoading(true);
                setError('');

                const [analyticsResponse, productsResponse] =
                    await Promise.all([
                        API.get('/analytics/admin'),
                        API.get('/products')
                    ]);

                setAnalytics(analyticsResponse.data.analytics);

                const data =
                    productsResponse.data.products ||
                    productsResponse.data;

                setProducts(Array.isArray(data) ? data : []);

            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    'Unable to load admin dashboard.'
                );
            } finally {
                setLoading(false);
            }
        };

        fetchAdminData();
    }, []);

    if (loading) {
        return (
            <div className="admin-dashboard">
                <p>Loading admin dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-dashboard">
                <h2>Unable to load dashboard</h2>
                <p>{error}</p>
            </div>
        );
    }

    const statCards = [
        { title: 'Total Users', value: analytics.totalUsers },
        { title: 'Total Vendors', value: analytics.totalVendors },
        { title: 'Total Stores', value: analytics.totalStores },
        { title: 'Total Products', value: analytics.totalProducts },
        { title: 'Total Stock', value: analytics.totalStock },
        { title: 'Total Orders', value: analytics.totalOrders },
        { title: 'Paid Orders', value: analytics.paidOrders },
        { title: 'Pending Orders', value: analytics.pendingOrders },
        { title: 'Failed Orders', value: analytics.failedOrders },
        {
            title: 'Total Sales',
            value: `₹${Number(analytics.totalSales).toLocaleString('en-IN')}`
        },
        {
            title: 'Platform Commission',
            value: `₹${Number(analytics.totalCommission).toLocaleString('en-IN')}`
        }
    ];

    return (
        <div className="admin-dashboard">

            <div className="admin-header">
                <span>ADMINISTRATION</span>
                <h1>Admin Dashboard</h1>
                <p>Welcome to Artisan's Corner administration!</p>
            </div>

            <section className="admin-overview">

                <h2>Marketplace Overview</h2>

                <div className="admin-stats">

                    {statCards.map((stat) => (
                        <div
                            className="admin-stat-card"
                            key={stat.title}
                        >
                            <h3>{stat.title}</h3>
                            <h2>{stat.value}</h2>
                        </div>
                    ))}

                </div>

            </section>

            <section className="admin-products-section">

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
                                        ₹{Number(product.price).toLocaleString('en-IN')}
                                    </p>

                                    <span className="admin-product-stock">
                                        Stock: {product.stock}
                                    </span>

                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </section>

        </div>
    );
}

export default AdminDashboard;