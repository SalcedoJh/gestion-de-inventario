import { useCart } from '../context/CartContext';
import { orderService, productService } from '../services/api';
import { useState, useEffect } from 'react';
import './Cart.css';

const Cart = () => {
    const { cart, removeFromCart, updateQuantity, clearCart, isOpen, toggleCart } = useCart();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [products, setProducts] = useState([]);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const res = await productService.getAll();
            setProducts(res.data);
        } catch (error) {
            console.error('Error loading products:', error);
        }
    };



    const handleSubmitOrder = async () => {
        if (cart.length === 0) return;

        setLoading(true);
        try {
            await orderService.create({ items: cart });
            setSuccess(true);
            setTimeout(() => {
                clearCart();
                setSuccess(false);
                toggleCart();
            }, 2000);
        } catch (error) {
            alert('Error al enviar el pedido');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="cart-overlay" onClick={toggleCart}></div>
            <div className="cart-sidebar">
                <div className="cart-header">
                    <h3>Mi Pedido</h3>
                    <button className="close-btn" onClick={toggleCart}>×</button>
                </div>

                <div className="cart-body">
                    {success ? (
                        <div className="success-message">
                            <div className="success-icon">✓</div>
                            <h4>¡Pedido enviado!</h4>
                            <p>Tu pedido ha sido registrado exitosamente</p>
                        </div>
                    ) : cart.length === 0 ? (
                        <div className="empty-cart">
                            <div className="empty-icon">🛒</div>
                            <p>Tu carrito está vacío</p>
                        </div>
                    ) : (
                        <div className="cart-items">
                            {cart.map((item, index) => (
                                <div key={index} className="cart-item">
                                    <div className="cart-item-info">
                                        <h4>{item.nombre}</h4>
                                        <div className="cart-item-details">
                                            {item.tamano && <span>Tamaño: {item.tamano}</span>}
                                            {item.conTapa !== undefined && (
                                                <span>{item.conTapa ? 'Con tapa' : 'Sin tapa'}</span>
                                            )}
                                            {item.tipoTapa && <span>Tapa: {item.tipoTapa}</span>}
                                            {item.tipoFiltro && <span>Filtro: {item.tipoFiltro}</span>}
                                        </div>
                                    </div>

                                    <div className="cart-item-actions">
                                        <div className="quantity-control">
                                            <button
                                                onClick={() => updateQuantity(index, Math.max(1, item.cantidad - 1))}
                                            >
                                                -
                                            </button>
                                            <input
                                                type="number"
                                                value={item.cantidad}
                                                onChange={(e) => updateQuantity(index, parseInt(e.target.value) || 1)}
                                                min="1"
                                            />
                                            <button onClick={() => updateQuantity(index, item.cantidad + 1)}>
                                                +
                                            </button>
                                        </div>
                                        <button
                                            className="remove-btn"
                                            onClick={() => removeFromCart(index)}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {cart.length > 0 && !success && (
                    <div className="cart-footer">
                        <div className="cart-summary">
                            <div className="summary-row">
                                <span>Total de productos:</span>
                                <strong>{cart.reduce((sum, item) => sum + item.cantidad, 0)}</strong>
                            </div>
                        </div>
                        <button
                            className="btn btn-primary btn-lg"
                            onClick={handleSubmitOrder}
                            disabled={loading}
                        >
                            {loading ? 'Enviando...' : 'Enviar Pedido'}
                        </button>
                        <button className="btn btn-outline" onClick={clearCart}>
                            Vaciar Carrito
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default Cart;
