import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import API from '../services/api';

function Checkout() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (cartItems.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    try {
      setLoading(true);

      const orderItems = cartItems.map((item) => ({
        productId: item._id,
        quantity: item.quantity
      }));

      // Step 1: Create order
      const orderResponse = await API.post('/orders', {
        items: orderItems,
        shippingAddress: formData
      });

      const order = orderResponse.data.order || orderResponse.data;

      if (!order._id) {
        throw new Error('Order was created, but its ID was not returned.');
      }

      // Step 2: Simulate payment only during local development
      if (import.meta.env.DEV) {
        await API.post(`/orders/${order._id}/simulate-payment`);

        alert('Demo payment successful! Your order is confirmed.');
      } else {
        // Production: No real payment integration is configured.
        // Keep the order pending instead of marking it as paid.

        alert(
          'Your order has been placed successfully! ' +
          'Payment is currently pending. No money has been collected.'
        );
      }

      // Step 3: Clear cart after successful order creation
      clearCart();

      // Step 4: Navigate to order history
      navigate('/my-orders');

    } catch (error) {
      setError(
        error.response?.data?.message ||
        error.message ||
        'Unable to complete your order. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="checkout-empty">
        <h2>Your cart is empty!</h2>
        <button onClick={() => navigate('/')}>
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>
      <p>Complete your shipping details to place your order.</p>

      <div className="checkout-container">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <h2>Shipping Address</h2>

          {error && <p className="checkout-error">{error}</p>}

          <label>Full Name</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Enter your full name"
            required
          />

          <label>Phone Number</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter your phone number"
            pattern="[0-9]{10}"
            maxLength="10"
            required
          />

          <label>Address</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="House number, street, area"
            required
          />

          <label>City</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="Enter your city"
            required
          />

          <label>State</label>
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleChange}
            placeholder="Enter your state"
            required
          />

          <label>PIN Code</label>
          <input
            type="text"
            name="pincode"
            value={formData.pincode}
            onChange={handleChange}
            placeholder="Enter your PIN code"
            pattern="[0-9]{6}"
            maxLength="6"
            required
          />

          <button type="submit" disabled={loading}>
            {loading
              ? 'Processing...'
              : import.meta.env.DEV
                ? 'Place Order & Pay (Demo)'
                : 'Place Order'}
          </button>
        </form>

        <div className="checkout-summary">
          <h2>Order Summary</h2>

          {cartItems.map((item) => (
            <div className="checkout-item" key={item._id}>
              <span>
                {item.productName} × {item.quantity}
              </span>

              <span>
                ₹{item.price * item.quantity}
              </span>
            </div>
          ))}

          <hr />

          <div className="checkout-total">
            <strong>Total Amount</strong>
            <strong>₹{cartTotal}</strong>
          </div>

          <p className="payment-note">
            {import.meta.env.DEV
              ? 'Demo payment only. No real money will be charged.'
              : 'Payment integration is not available in this demo. Orders will remain pending.'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Checkout;