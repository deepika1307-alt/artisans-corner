import { useEffect, useState } from 'react';
import API from '../services/api';
import { Link } from 'react-router-dom';

function MyOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [payingOrder, setPayingOrder] = useState(null);
    const [paymentMessage, setPaymentMessage] = useState('');

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await API.get('/orders/my-orders');

            setOrders(response.data.orders || []);

        } catch (error) {
            console.error('My Orders Error:', error);

            setError(
                error.response?.data?.message ||
                'Unable to fetch your orders.'
            );

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // ========================================
    // SIMULATED PAYMENT
    // DEMO PURPOSES ONLY
    // ========================================

    const handlePayment = async (orderId) => {
        const confirmed = window.confirm(
            'This is a simulated demo payment. No real money will be charged. Continue?'
        );

        if (!confirmed) return;

        try {
            setPayingOrder(orderId);
            setPaymentMessage('');
            setError('');

            const response = await API.post(
                `/orders/${orderId}/simulate-payment`
            );

            setPaymentMessage(
                response.data.message || 'Demo payment successful!'
            );

            await fetchOrders();

        } catch (error) {
            setError(
                error.response?.data?.message ||
                'Demo payment failed.'
            );

        } finally {
            setPayingOrder(null);
        }
    };

    if (loading) {
        return (
            <div className="orders-loading">
                Loading your orders...
            </div>
        );
    }

    if (error && orders.length === 0) {
        return (
            <div className="orders-error">
                <h2>Oops!</h2>
                <p>{error}</p>
                <button onClick={fetchOrders}>
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="my-orders-page">

            <div className="orders-heading">
                <p>YOUR PURCHASES</p>
                <h1>My Orders 📦</h1>
                <span>Keep track of your handmade treasures.</span>
            </div>

            {paymentMessage && (
                <div className="payment-success-message">
                    ✓ {paymentMessage}
                </div>
            )}

            {error && (
                <div className="payment-error-message">
                    {error}
                </div>
            )}

            {orders.length === 0 ? (

                <div className="no-orders">
                    <span>🛍️</span>
                    <h2>No orders yet!</h2>
                    <p>
                        Your beautiful handmade purchases will appear here.
                    </p>

                    <Link to="/" className="continue-shopping">
                        Explore Products
                    </Link>
                </div>

            ) : (

                <div className="orders-list">

                    {orders.map((order) => (

                        <div className="order-card" key={order._id}>

                            <div className="order-card-header">

                                <div>
                                    <h3>
                                        Order #{order._id.slice(-6).toUpperCase()}
                                    </h3>

                                    <p>
                                        Ordered on:{' '}
                                        {new Date(
                                            order.createdAt
                                        ).toLocaleDateString('en-IN')}
                                    </p>
                                </div>

                                <span className={`order-status ${order.orderStatus}`}>
                                    {order.orderStatus}
                                </span>

                            </div>

                            <div className="order-products">

                                {order.items.map((item, index) => {

                                    const productName =
                                        item.product?.productName ||
                                        item.productName ||
                                        'Product';

                                    return (
                                        <div
                                            className="ordered-product"
                                            key={item._id || index}
                                        >

                                            <div>
                                                <h4>{productName}</h4>
                                                <p>Quantity: {item.quantity}</p>
                                            </div>

                                            <strong>
                                                ₹{(
                                                    item.price * item.quantity
                                                ).toLocaleString('en-IN')}
                                            </strong>

                                        </div>
                                    );
                                })}

                            </div>

                            <div className="order-card-footer">

                                <div>
                                    <p>Payment Status</p>

                                    <strong className={`payment-status ${order.paymentStatus}`}>
                                        {order.paymentStatus}
                                    </strong>

                                </div>

                                <div>
                                    <p>Total Amount</p>
                                    <h3>
                                        ₹{Number(
                                            order.totalAmount
                                        ).toLocaleString('en-IN')}
                                    </h3>
                                </div>

                            </div>

                            {order.paymentStatus === 'pending' && (
                                <button
                                    className="pay-now-button"
                                    onClick={() => handlePayment(order._id)}
                                    disabled={payingOrder === order._id}
                                >
                                    {payingOrder === order._id
                                        ? 'Processing...'
                                        : 'Pay Now (Demo)'}
                                </button>
                            )}

                            {order.paymentStatus === 'paid' && (
                                <div className="payment-completed">
                                    ✓ Payment Completed
                                </div>
                            )}

                        </div>

                    ))}

                </div>

            )}

        </div>
    );
}

export default MyOrders;