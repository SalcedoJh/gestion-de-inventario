import { useState, useEffect } from 'react';
import { productService } from '../services/api';
import './ProductFormModal.css';

const ProductFormModal = ({ product, categories, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        articulo: '',
        descripcion: '',
        imagen: '',
        categoryId: '',
        tieneTapa: false,
        tiposTapa: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (product) {
            setFormData({
                articulo: product.articulo || '',
                descripcion: product.descripcion || '',
                imagen: product.imagen || '',
                categoryId: product.categoryId || '',
                tieneTapa: product.tieneTapa || false,
                tiposTapa: product.tiposTapa || ''
            });
        }
    }, [product]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (product) {
                // Update existing product
                await productService.update(product.id, formData);
                if (formData.categoryId) {
                    await productService.assignCategory(product.id, formData.categoryId);
                }
            } else {
                // Create new product
                const res = await productService.create(formData);
                if (formData.categoryId && res.data.product) {
                    await productService.assignCategory(res.data.product.id, formData.categoryId);
                }
            }
            onSave();
        } catch (error) {
            alert('Error al guardar el producto');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal product-form-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{product ? 'Editar Producto' : 'Nuevo Producto'}</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label className="form-label">Artículo *</label>
                            <input
                                type="text"
                                name="articulo"
                                className="form-control"
                                value={formData.articulo}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Descripción *</label>
                            <textarea
                                name="descripcion"
                                className="form-control"
                                value={formData.descripcion}
                                onChange={handleChange}
                                rows="3"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">URL de Imagen *</label>
                            <input
                                type="url"
                                name="imagen"
                                className="form-control"
                                value={formData.imagen}
                                onChange={handleChange}
                                placeholder="https://example.com/imagen.jpg"
                                required
                            />
                            {formData.imagen && (
                                <div className="image-preview">
                                    <img
                                        src={formData.imagen}
                                        alt="Preview"
                                        onError={(e) => e.target.src = 'https://via.placeholder.com/150'}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Categoría</label>
                            <select
                                name="categoryId"
                                className="form-control"
                                value={formData.categoryId}
                                onChange={handleChange}
                            >
                                <option value="">Sin categoría</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label checkbox-label">
                                <input
                                    type="checkbox"
                                    name="tieneTapa"
                                    checked={formData.tieneTapa}
                                    onChange={handleChange}
                                />
                                <span>¿Tiene tapa?</span>
                            </label>
                        </div>

                        {formData.tieneTapa && (
                            <div className="form-group">
                                <label className="form-label">Tipos de tapa</label>
                                <input
                                    type="text"
                                    name="tiposTapa"
                                    className="form-control"
                                    value={formData.tiposTapa}
                                    onChange={handleChange}
                                    placeholder="Ej: Tapa rosca, Tapa presión, etc."
                                />
                                <small className="form-text">Separa múltiples tipos con comas</small>
                            </div>
                        )}
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-outline" onClick={onClose}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductFormModal;
