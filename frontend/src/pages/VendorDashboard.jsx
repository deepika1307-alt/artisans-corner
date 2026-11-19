import { useEffect, useState } from 'react';
import API from '../services/api';

function VendorDashboard() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [analytics, setAnalytics] = useState({
        totalOrders: 0,
        totalSales: 0,
        totalCommission: 0,
        totalEarnings: 0,
        salesHistory: []
    });

    const [analyticsLoading, setAnalyticsLoading] = useState(true);

    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const [formData, setFormData] = useState({
        productName: '',
        description: '',
        price: '',
        category: '',
        stock: ''
    });

    const [image, setImage] = useState(null);

    // FETCH PRODUCTS
    const fetchProducts = async () => {
        try {
            setLoading(true);

            const response = await API.get('/products/my-products');

            setProducts(response.data.products || []);
            setError('');
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Unable to load products.'
            );
        } finally {
            setLoading(false);
        }
    };

    // FETCH VENDOR ANALYTICS
    const fetchAnalytics = async () => {
        try {
            setAnalyticsLoading(true);

            const response = await API.get('/analytics/vendor');

            setAnalytics(response.data.analytics || {
                totalOrders: 0,
                totalSales: 0,
                totalCommission: 0,
                totalEarnings: 0,
                salesHistory: []
            });
        } catch (err) {
            console.error('Analytics Error:', err);

            setError(
                err.response?.data?.message ||
                'Unable to load sales analytics.'
            );
        } finally {
            setAnalyticsLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchAnalytics();
    }, []);

    // HANDLE INPUT CHANGES
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // HANDLE IMAGE SELECTION
    const handleImageChange = (e) => {
        const selectedImage = e.target.files[0];

        if (!selectedImage) return;

        if (!selectedImage.type.startsWith('image/')) {
            setError('Please select a valid image.');
            e.target.value = '';
            return;
        }

        if (selectedImage.size > 5 * 1024 * 1024) {
            setError('Image size must be less than 5 MB.');
            e.target.value = '';
            return;
        }

        setImage(selectedImage);
        setError('');
    };

    // RESET FORM
    const resetForm = () => {
        setFormData({
            productName: '',
            description: '',
            price: '',
            category: '',
            stock: ''
        });

        setImage(null);
        setEditingProduct(null);
        setShowForm(false);

        const fileInput = document.getElementById('product-image');

        if (fileInput) {
            fileInput.value = '';
        }
    };

    // ADD OR UPDATE PRODUCT
    const handleSubmit = async (e) => {
        e.preventDefault();

        setError('');
        setSuccess('');

        try {
            setSaving(true);

            let imageUrl = null;

            // UPLOAD NEW IMAGE
            if (image) {
                const imageData = new FormData();

                imageData.append('image', image);

                const uploadResponse = await API.post(
                    '/images/upload',
                    imageData
                );

                imageUrl = uploadResponse.data.imageUrl;
            }

            // PREPARE PRODUCT DATA
            const productData = {
                productName: formData.productName.trim(),
                description: formData.description.trim(),
                price: Number(formData.price),
                category: formData.category,
                stock: Number(formData.stock)
            };

            // PRESERVE EXISTING IMAGE
            if (editingProduct) {
                const existingProduct = products.find(
                    product => product._id === editingProduct
                );

                productData.images = imageUrl
                    ? [imageUrl]
                    : existingProduct?.images || [];
            } else {
                if (!imageUrl) {
                    setError('Please select a product image.');
                    return;
                }

                productData.images = [imageUrl];
            }

            // CREATE OR UPDATE
            if (editingProduct) {
                await API.put(
                    `/products/${editingProduct}`,
                    productData
                );

                setSuccess('Product updated successfully!');
            } else {
                await API.post(
                    '/products/create',
                    productData
                );

                setSuccess('Product added successfully!');
            }

            resetForm();

            await fetchProducts();

        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Unable to save product.'
            );
        } finally {
            setSaving(false);
        }
    };

    // OPEN EDIT FORM
    const handleEdit = (product) => {
        setEditingProduct(product._id);

        setFormData({
            productName: product.productName,
            description: product.description,
            price: product.price,
            category: product.category,
            stock: product.stock
        });

        setImage(null);
        setError('');
        setSuccess('');
        setShowForm(true);

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    // DELETE PRODUCT
    const handleDelete = async (productId) => {
        const confirmed = window.confirm(
            'Are you sure you want to delete this product?'
        );

        if (!confirmed) return;

        try {
            setError('');
            setSuccess('');

            await API.delete(`/products/${productId}`);

            setSuccess('Product deleted successfully!');

            await fetchProducts();

        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Unable to delete product.'
            );
        }
    };

    // REFRESH DASHBOARD
    const refreshDashboard = () => {
        fetchProducts();
        fetchAnalytics();
    };

    // DASHBOARD STATISTICS
    const totalProducts = products.length;

    const totalStock = products.reduce(
        (total, product) =>
            total + Number(product.stock || 0),
        0
    );

    const totalValue = products.reduce(
        (total, product) =>
            total +
            Number(product.price || 0) *
            Number(product.stock || 0),
        0
    );

    const formatCurrency = (amount) =>
        `₹${Number(amount || 0).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;

    return (
        <div className="dashboard-page">

            {/* HEADER */}

            <div className="dashboard-header">
                <div>
                    <p className="dashboard-label">
                        SELLER WORKSPACE
                    </p>

                    <h1>Vendor Dashboard</h1>

                    <p>
                        Manage your handmade creations in one place.
                    </p>
                </div>

                <span className="dashboard-flower">✿</span>
            </div>

            {/* INVENTORY STATISTICS */}

            <section className="dashboard-stats">

                <div className="stat-card">
                    <span>Total Products</span>
                    <h2>{totalProducts}</h2>
                    <p>Products in your store</p>
                </div>

                <div className="stat-card">
                    <span>Total Stock</span>
                    <h2>{totalStock}</h2>
                    <p>Available units</p>
                </div>

                <div className="stat-card">
                    <span>Inventory Value</span>
                    <h2>{formatCurrency(totalValue)}</h2>
                    <p>Price × available stock</p>
                </div>

            </section>

            {/* SALES ANALYTICS */}

            <section className="dashboard-products">

                <div className="dashboard-section-heading">
                    <div>
                        <h2>Sales Analytics</h2>
                        <p>Your sales and earnings overview.</p>
                    </div>

                    <button
                        className="refresh-button"
                        onClick={refreshDashboard}
                    >
                        ↻ Refresh Analytics
                    </button>
                </div>

                {analyticsLoading ? (
                    <div className="dashboard-message">
                        Loading sales analytics...
                    </div>
                ) : (
                    <>
                        <div className="dashboard-stats">

                            <div className="stat-card">
                                <span>Total Paid Orders</span>
                                <h2>{analytics.totalOrders}</h2>
                                <p>Orders containing your products</p>
                            </div>

                            <div className="stat-card">
                                <span>Total Sales</span>
                                <h2>
                                    {formatCurrency(analytics.totalSales)}
                                </h2>
                                <p>Gross sales amount</p>
                            </div>

                            <div className="stat-card">
                                <span>Platform Commission</span>
                                <h2>
                                    {formatCurrency(analytics.totalCommission)}
                                </h2>
                                <p>5% marketplace commission</p>
                            </div>

                            <div className="stat-card">
                                <span>Your Earnings</span>
                                <h2>
                                    {formatCurrency(analytics.totalEarnings)}
                                </h2>
                                <p>95% vendor share</p>
                            </div>

                        </div>

                        <div className="dashboard-section-heading">
                            <div>
                                <h2>Sales History</h2>
                                <p>Details of your paid orders.</p>
                            </div>
                        </div>

                        {analytics.salesHistory.length === 0 ? (
                            <div className="dashboard-empty">
                                <span>✿</span>
                                <h3>No sales yet!</h3>
                                <p>
                                    Your paid order history will appear here.
                                </p>
                            </div>
                        ) : (
                            <div className="dashboard-table-wrapper">

                                <table className="product-table">
                                    <thead>
                                        <tr>
                                            <th>Order ID</th>
                                            <th>Date</th>
                                            <th>Sales</th>
                                            <th>Commission</th>
                                            <th>Earnings</th>
                                            <th>Payout Status</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {analytics.salesHistory.map((sale) => (
                                            <tr key={sale.orderId}>
                                                <td>
                                                    {sale.orderId.slice(-6).toUpperCase()}
                                                </td>

                                                <td>
                                                    {new Date(sale.date).toLocaleDateString('en-IN')}
                                                </td>

                                                <td>
                                                    {formatCurrency(sale.subtotal)}
                                                </td>

                                                <td>
                                                    {formatCurrency(sale.commission)}
                                                </td>

                                                <td>
                                                    {formatCurrency(sale.earnings)}
                                                </td>

                                                <td>
                                                    {sale.payoutStatus}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                            </div>
                        )}
                    </>
                )}

            </section>

            {/* PRODUCT MANAGEMENT */}

            <section className="dashboard-products">

                <div className="dashboard-section-heading">

                    <div>
                        <h2>Your Products</h2>
                        <p>
                            Manage your handmade products.
                        </p>
                    </div>

                    <div className="dashboard-actions">

                        <button
                            className="refresh-button"
                            onClick={fetchProducts}
                        >
                            ↻ Refresh
                        </button>

                        <button
                            className="add-product-button"
                            onClick={() => {
                                if (showForm) {
                                    resetForm();
                                } else {
                                    setShowForm(true);
                                    setError('');
                                    setSuccess('');
                                }
                            }}
                        >
                            + Add Product
                        </button>

                    </div>

                </div>

                {/* MESSAGES */}

                {success && (
                    <div className="dashboard-success">
                        {success}
                    </div>
                )}

                {error && (
                    <div className="dashboard-error">
                        {error}
                    </div>
                )}

                {/* PRODUCT FORM */}

                {showForm && (

                    <form
                        className="product-form"
                        onSubmit={handleSubmit}
                    >

                        <h3>
                            {editingProduct
                                ? 'Edit Product'
                                : 'Add a New Product'
                            }
                        </h3>

                        <div className="form-group">
                            <label>Product Name</label>

                            <input
                                type="text"
                                name="productName"
                                placeholder="Enter product name"
                                value={formData.productName}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Description</label>

                            <textarea
                                name="description"
                                placeholder="Describe your handmade product..."
                                value={formData.description}
                                onChange={handleChange}
                                rows="4"
                                required
                            />
                        </div>

                        <div className="form-row">

                            <div className="form-group">
                                <label>Price (₹)</label>

                                <input
                                    type="number"
                                    name="price"
                                    min="0"
                                    step="0.01"
                                    placeholder="599"
                                    value={formData.price}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Stock</label>

                                <input
                                    type="number"
                                    name="stock"
                                    min="0"
                                    step="1"
                                    placeholder="10"
                                    value={formData.stock}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                        </div>

                        <div className="form-group">
                            <label>Category</label>

                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                            >
                                <option value="">
                                    Select a category
                                </option>

                                <option value="Jewellery">
                                    Handmade Jewellery
                                </option>

                                <option value="Home Decor">
                                    Home Decor
                                </option>

                                <option value="Art">
                                    Art & Paintings
                                </option>

                                <option value="Clothing">
                                    Handmade Clothing
                                </option>

                                <option value="Gifts">
                                    Handmade Gifts
                                </option>

                                <option value="Other">
                                    Other
                                </option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>
                                {editingProduct
                                    ? 'Replace Product Image (Optional)'
                                    : 'Product Image'
                                }
                            </label>

                            <input
                                type="file"
                                id="product-image"
                                accept="image/*"
                                onChange={handleImageChange}
                                required={!editingProduct}
                            />

                            {image && (
                                <p className="selected-image">
                                    Selected: {image.name}
                                </p>
                            )}
                        </div>

                        <div className="product-form-actions">

                            <button
                                type="button"
                                className="cancel-button"
                                onClick={resetForm}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="save-product-button"
                                disabled={saving}
                            >
                                {saving
                                    ? 'Saving Changes...'
                                    : editingProduct
                                        ? 'Update Product'
                                        : 'Save Product'
                                }
                            </button>

                        </div>

                    </form>

                )}

                {/* PRODUCT LIST */}

                {loading ? (

                    <div className="dashboard-message">
                        Loading your products...
                    </div>

                ) : products.length === 0 ? (

                    <div className="dashboard-empty">
                        <span>✿</span>

                        <h3>
                            Your store is waiting for its first creation!
                        </h3>

                        <p>
                            Add your first handmade product.
                        </p>
                    </div>

                ) : (

                    <div className="dashboard-table-wrapper">

                        <table className="product-table">

                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>

                                {products.map((product) => (

                                    <tr key={product._id}>

                                        <td className="product-name-cell">

                                            {product.images?.[0] && (
                                                <img
                                                    src={product.images[0]}
                                                    alt={product.productName}
                                                />
                                            )}

                                            <span>
                                                {product.productName}
                                            </span>

                                        </td>

                                        <td>{product.category}</td>

                                        <td>
                                            {formatCurrency(product.price)}
                                        </td>

                                        <td>{product.stock}</td>

                                        <td>
                                            <div className="product-action-buttons">

                                                <button
                                                    className="edit-product-button"
                                                    onClick={() => handleEdit(product)}
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    className="delete-product-button"
                                                    onClick={() => handleDelete(product._id)}
                                                >
                                                    Delete
                                                </button>

                                            </div>
                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                )}

            </section>

        </div>
    );
}

export default VendorDashboard;