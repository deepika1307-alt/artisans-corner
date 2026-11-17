import {
    createContext,
    useContext,
    useState,
    useEffect
} from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {

    const [cartItems, setCartItems] = useState(() => {
        try {
            const savedCart = localStorage.getItem('cartItems');
            return savedCart ? JSON.parse(savedCart) : [];
        } catch (error) {
            console.error('Cart loading error:', error);
            return [];
        }
    });

    // SAVE CART TO LOCAL STORAGE
    useEffect(() => {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
        console.log('UPDATED CART:', cartItems);
    }, [cartItems]);

    // ADD PRODUCT TO CART
    const addToCart = (product) => {
        console.log('ADDING PRODUCT:', product.productName);

        setCartItems((previousItems) => {
            const existingItem = previousItems.find(
                item => item._id === product._id
            );

            if (existingItem) {
                if (existingItem.quantity >= product.stock) {
                    return previousItems;
                }

                return previousItems.map(item =>
                    item._id === product._id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }

            if (product.stock < 1) {
                return previousItems;
            }

            return [
                ...previousItems,
                { ...product, quantity: 1 }
            ];
        });
    };

    // REMOVE PRODUCT
    const removeFromCart = (productId) => {
        setCartItems(previousItems =>
            previousItems.filter(item => item._id !== productId)
        );
    };

    // UPDATE QUANTITY
    const updateQuantity = (productId, quantity) => {
        setCartItems(previousItems =>
            previousItems.map(item => {
                if (item._id === productId) {
                    const newQuantity = Math.max(
                        1,
                        Math.min(Number(quantity), item.stock)
                    );

                    return { ...item, quantity: newQuantity };
                }

                return item;
            })
        );
    };

    // CLEAR CART
    const clearCart = () => {
        setCartItems([]);
    };

    // CART COUNT
    const cartCount = cartItems.reduce(
        (total, item) => total + item.quantity,
        0
    );

    // CART TOTAL
    const cartTotal = cartItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );

    return (
        <CartContext.Provider value={{
            cartItems,
            cartCount,
            cartTotal,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);

    if (!context) {
        throw new Error('useCart must be used inside CartProvider');
    }

    return context;
};