import { useState } from 'react';
import { useCart } from '../context/CartContext';
import './ProductModal.css';

const ProductModal = ({ product, onClose }) => {
    const { addToCart } = useCart();
    const [formData, setFormData] = useState({
        tamano: '',
        conTapa: true,
        tipoTapa: '',
        tipoFiltro: '',
        cantidad: 1
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const cartItem = {
            productId: product.id,
            nombre: product.articulo,
            ...formData,
            cantidad: parseInt(formData.cantidad)
        };

        addToCart(cartItem);
        onClose();
    };

    if (!product) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{product.articulo}</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    <div className="product-modal-image">
                        <img src={product.imagen} alt={product.articulo} />
                    </div>

                    <p className="product-modal-description">{product.descripcion}</p>

                    <form onSubmit={handleSubmit} className="product-form">
                        <div className="form-group">
                            <label className="form-label">Tamaño / Capacidad</label>
                            <select
                                name="tamano"
                                className="form-control"
                                value={formData.tamano}
                                onChange={handleChange}
                            >
                                <option value="">Seleccione un tamaño</option>
                                <option value="10ml">10ml</option>
                                <option value="30ml">30ml</option>
                                <option value="50ml">50ml</option>
                                <option value="60ml">60ml</option>
                                <option value="100ml">100ml</option>
                                <option value="120ml">120ml</option>
                                <option value="250ml">250ml</option>
                                <option value="500ml">500ml</option>
                                <option value="1L">1 Litro</option>
                                <option value="30g">30g</option>
                                <option value="60g">60g</option>
                                <option value="120g">120g</option>
                                <option value="250g">250g</option>
                                <option value="500g">500g</option>
                                <option value="1kg">1kg</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="conTapa"
                                    checked={formData.conTapa}
                                    onChange={handleChange}
                                />
                                <span>Con tapa</span>
                            </label>
                        </div>

                        {formData.conTapa && (
                            <div className="form-group">
                                <label className="form-label">Tipo de Tapa</label>
                                <select
                                    name="tipoTapa"
                                    className="form-control"
                                    value={formData.tipoTapa}
                                    onChange={handleChange}
                                >
                                    <option value="">Seleccione tipo de tapa</option>
                                    <option value="Atomizador">Atomizador</option>
                                    <option value="Dispensador">Dispensador</option>
                                    <option value="Gotero">Gotero</option>
                                    <option value="Rosca">Rosca</option>
                                    <option value="Presión">Presión</option>
                                </select>
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label">Tipo de Filtro (opcional)</label>
                            <select
                                name="tipoFiltro"
                                className="form-control"
                                value={formData.tipoFiltro}
                                onChange={handleChange}
                            >
                                <option value="">Sin filtro</option>
                                <option value="Filtro básico">Filtro básico</option>
                                <option value="Filtro fino">Filtro fino</option>
                                <option value="Filtro especial">Filtro especial</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Cantidad</label>
                            <input
                                type="number"
                                name="cantidad"
                                className="form-control"
                                value={formData.cantidad}
                                onChange={handleChange}
                                min="1"
                                required
                            />
                        </div>

                        <div className="modal-footer">
                            <button type="button" className="btn btn-outline" onClick={onClose}>
                                Cancelar
                            </button>
                            <button type="submit" className="btn btn-primary">
                                Agregar al Pedido
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProductModal;
