import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  CardElement,
  Elements,
  useElements,
  useStripe
} from '@stripe/react-stripe-js';

import { loadStripe } from '@stripe/stripe-js';

import { useCart } from '../context/CartContext';
import API from '../services/api';

// Demo mode is the default.
// Stripe is enabled only when VITE_PAYMENT_MODE=stripe.
const PAYMENT_MODE = (
  import.meta.env.VITE_PAYMENT_MODE || 'demo'
).toLowerCase();

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

const stripePromise = publishableKey
  ? loadStripe(publishableKey)
  : Promise.resolve(null);


function CheckoutForm() {
  const { cartItems, cartTotal, clearCart } = useCart();

  const navigate = useNavigate();

  const stripe = useStripe();
  const elements = useElements();

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

      // =========================
      // DEMO PAYMENT MODE
      // =========================
      if (PAYMENT_MODE !== 'stripe') {

        // Step 1: Create demo order
        const demoOrderResponse = await API.post(
          '/orders/demo',
          {
            items: orderItems,
            shippingAddress: formData
          }
        );

        const order = demoOrderResponse.data.order;

        if (!order?._id) {
          throw new Error(
            'Demo order was not created successfully.'
          );
        }

        // Step 2: Simulate demo payment
        await API.post(
          `/orders/${order._id}/simulate-payment`
        );

        // Step 3: Clear cart after success
        clearCart();

        alert(
          'Demo order successful! No real payment was collected.'
        );

        navigate('/my-orders');

        return;
      }


      // =========================
      // STRIPE PAYMENT MODE
      // =========================

      if (!stripe || !elements) {
        throw new Error(
          'Stripe is not ready. Check your Stripe publishable key.'
        );
      }

      const cardElement = elements.getElement(CardElement);

      if (!cardElement) {
        throw new Error('Card input is not available.');
      }

      // Step 1: Create PaymentIntent
      const paymentIntentResponse = await API.post(
        '/payments/create-payment-intent',
        {
          items: orderItems
        }
      );

      const {
        clientSecret,
        paymentIntentId
      } = paymentIntentResponse.data;

      if (!clientSecret || !paymentIntentId) {
        throw new Error(
          'Payment information was not returned by the server.'
        );
      }

      // Step 2: Confirm Stripe payment
      const paymentResult = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: formData.fullName,
              phone: formData.phone
            }
          }
        }
      );

      if (paymentResult.error) {
        throw new Error(
          paymentResult.error.message ||
          'Payment failed. Please try again.'
        );
      }

      if (
        paymentResult.paymentIntent?.status !== 'succeeded'
      ) {
        throw new Error(
          'Payment has not completed successfully.'
        );
      }

      // Step 3: Create order after payment succeeds
      const orderResponse = await API.post('/orders', {
        items: orderItems,
        shippingAddress: formData,
        paymentIntentId
      });

      const stripeOrder = orderResponse.data.order;

      if (!stripeOrder?._id) {
        throw new Error(
          'Payment succeeded, but order confirmation was not returned.'
        );
      }

      // Step 4: Clear cart
      clearCart();

      alert('Payment successful! Your order is confirmed.');

      navigate('/my-orders');

    } catch (error) {
      setError(
        error.response?.data?.message ||
        error.message ||
        'Unable to complete checkout. Please try again.'
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

      <p>Complete your shipping details and payment.</p>

      <div className="checkout-container">

        <form
          className="checkout-form"
          onSubmit={handleSubmit}
        >
          <h2>Shipping Address</h2>

          {error && (
            <p className="checkout-error">{error}</p>
          )}

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


          {/* PAYMENT SECTION */}

          {PAYMENT_MODE === 'stripe' ? (
            <>
              <h2>Payment Details</h2>

              <div className="stripe-card-input">
                <CardElement
                  options={{
                    hidePostalCode: true,
                    style: {
                      base: {
                        fontSize: '16px',
                        color: '#32325d',
                        fontFamily: 'Arial, sans-serif',
                        '::placeholder': {
                          color: '#aab7c4'
                        }
                      },
                      invalid: {
                        color: '#dc2626'
                      }
                    }
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading || !stripe || !elements}
              >
                {loading
                  ? 'Processing Payment...'
                  : `Pay ₹${Number(cartTotal).toFixed(2)}`}
              </button>

              <p className="payment-note">
                Your card details are securely handled by Stripe.
              </p>
            </>
          ) : (
            <>
              <h2>Demo Payment</h2>

              <div className="payment-note">
                Demo mode is enabled. No real money will be
                collected.
              </div>

              <button
                type="submit"
                disabled={loading}
              >
                {loading
                  ? 'Processing Demo Order...'
                  : `Complete Demo Order ₹${Number(cartTotal).toFixed(2)}`}
              </button>
            </>
          )}

        </form>


        {/* ORDER SUMMARY */}

        <div className="checkout-summary">
          <h2>Order Summary</h2>

          {cartItems.map((item) => (
            <div
              className="checkout-item"
              key={item._id}
            >
              <span>
                {item.productName} × {item.quantity}
              </span>

              <span>
                ₹{(
                  item.price * item.quantity
                ).toFixed(2)}
              </span>
            </div>
          ))}

          <hr />

          <div className="checkout-total">
            <strong>Total Amount</strong>

            <strong>
              ₹{Number(cartTotal).toFixed(2)}
            </strong>
          </div>
        </div>

      </div>
    </div>
  );
}


function Checkout() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
}

export default Checkout;