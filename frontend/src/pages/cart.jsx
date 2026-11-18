import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

function Cart() {
    const {
        cartItems,
        cartTotal,
        removeFromCart,
        updateQuantity
    } = useCart();

    const navigate = useNavigate();

    const handleCheckout = () => {
        navigate('/checkout');
    };

    return (
        <div className="cart-page">

            <div className="cart-heading">
                <p>YOUR SHOPPING BAG</p>
                <h1>My Cart 🛒</h1>
            </div>

            {cartItems.length === 0 ? (

                <div className="empty-cart">
                    <span>🛍️</span>
                    <h2>Your cart is empty!</h2>
                    <p>Discover something beautiful and handmade.</p>

                    <Link to="/" className="continue-shopping">
                        Continue Shopping
                    </Link>
                </div>

            ) : (

                <div className="cart-layout">

                    <div className="cart-items">

                        {cartItems.map(item => (

                            <div className="cart-item" key={item._id}>

                                <div className="cart-item-image">

                                    {item.images?.[0] ? (
                                        <img
                                            src={item.images[0]}
                                            alt={item.productName}
                                        />
                                    ) : (
                                        <span>✿</span>
                                    )}

                                </div>

                                <div className="cart-item-details">

                                    <h3>{item.productName}</h3>

                                    <p>{item.category}</p>

                                    <h4>
                                        ₹{Number(item.price).toLocaleString('en-IN')}
                                    </h4>

                                    <div className="quantity-controls">

                                        <button
                                            onClick={() =>
                                                updateQuantity(
                                                    item._id,
                                                    item.quantity - 1
                                                )
                                            }
                                            disabled={item.quantity <= 1}
                                        >
                                            −
                                        </button>

                                        <span>{item.quantity}</span>

                                        <button
                                            onClick={() =>
                                                updateQuantity(
                                                    item._id,
                                                    item.quantity + 1
                                                )
                                            }
                                            disabled={
                                                item.quantity >= item.stock
                                            }
                                        >
                                            +
                                        </button>

                                    </div>

                                    <button
                                        className="remove-cart-item"
                                        onClick={() =>
                                            removeFromCart(item._id)
                                        }
                                    >
                                        Remove
                                    </button>

                                </div>

                                <div className="cart-item-subtotal">
                                    ₹{(
                                        Number(item.price) * item.quantity
                                    ).toLocaleString('en-IN')}
                                </div>

                            </div>

                        ))}

                    </div>

                    <div className="cart-summary">

                        <h2>Order Summary</h2>

                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>
                                ₹{Number(cartTotal).toLocaleString('en-IN')}
                            </span>
                        </div>

                        <div className="summary-row">
                            <span>Shipping</span>
                            <span>Calculated at checkout</span>
                        </div>

                        <hr />

                        <div className="summary-total">
                            <span>Total</span>
                            <span>
                                ₹{Number(cartTotal).toLocaleString('en-IN')}
                            </span>
                        </div>

                        <button
                            className="checkout-button"
                            onClick={handleCheckout}
                        >
                            Proceed to Checkout
                        </button>

                        <Link to="/" className="continue-shopping-link">
                            Continue Shopping
                        </Link>

                    </div>

                </div>

            )}

        </div>
    );
}

export default Cart;