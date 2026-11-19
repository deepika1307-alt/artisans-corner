import {
    createContext,
    useContext,
    useState,
    useEffect
} from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {

    // LOAD CART FROM LOCAL STORAGE
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
        try {
            localStorage.setItem('cartItems', JSON.stringify(cartItems));
        } catch (error) {
            console.error('Cart saving error:', error);
        }
    }, [cartItems]);

    // ADD PRODUCT TO CART
    const addToCart = (product) => {
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

    // REMOVE PRODUCT FROM CART
    const removeFromCart = (productId) => {
        setCartItems(previousItems =>
            previousItems.filter(item => item._id !== productId)
        );
    };

    // UPDATE PRODUCT QUANTITY
    const updateQuantity = (productId, quantity) => {
        setCartItems(previousItems =>
            previousItems.map(item => {

                if (item._id === productId) {

                    const newQuantity = Math.max(
                        1,
                        Math.min(
                            Number(quantity),
                            Number(item.stock)
                        )
                    );

                    return {
                        ...item,
                        quantity: newQuantity
                    };
                }

                return item;
            })
        );
    };

    // CLEAR CART
    const clearCart = () => {
        setCartItems([]);
    };

    // TOTAL NUMBER OF PRODUCTS
    const cartCount = cartItems.reduce(
        (total, item) => total + Number(item.quantity),
        0
    );

    // TOTAL CART PRICE
    const cartTotal = Number(
        cartItems.reduce(
            (total, item) =>
                total + Number(item.price) * Number(item.quantity),
            0
        ).toFixed(2)
    );

    return (
        <CartContext.Provider
            value={{
                cartItems,
                cartCount,
                cartTotal,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {

    const context = useContext(CartContext);

    if (!context) {
        throw new Error(
            'useCart must be used inside CartProvider'
        );
    }

    return context;
};