import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    // Load cart from localStorage
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }
    }, []);

    // Save cart to localStorage
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (item) => {
        setCart(prev => {
            const existingIndex = prev.findIndex(
                i => i.productId === item.productId &&
                    i.tamano === item.tamano &&
                    i.conTapa === item.conTapa &&
                    i.tipoTapa === item.tipoTapa &&
                    i.tipoFiltro === item.tipoFiltro
            );

            if (existingIndex >= 0) {
                const newCart = [...prev];
                newCart[existingIndex].cantidad += item.cantidad;
                return newCart;
            }

            return [...prev, item];
        });
        setIsOpen(true);
    };

    const removeFromCart = (index) => {
        setCart(prev => prev.filter((_, i) => i !== index));
    };

    const updateQuantity = (index, cantidad) => {
        setCart(prev => {
            const newCart = [...prev];
            newCart[index].cantidad = cantidad;
            return newCart;
        });
    };

    const clearCart = () => {
        setCart([]);
    };

    const toggleCart = () => {
        setIsOpen(prev => !prev);
    };

    const value = {
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isOpen,
        toggleCart,
        itemCount: cart.reduce((sum, item) => sum + item.cantidad, 0)
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
};
