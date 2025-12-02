import { useState, useEffect } from 'react';
import { categoryService, sucursalService } from '../services/api';
import './UserFormModal.css';

const UserFormModal = ({ user, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        nombre: '',
        tipo: '3',
        sucursalId: '',
        viewAllCategories: false,
        allowedCategories: []
    });
    const [categories, setCategories] = useState([]);
    const [sucursales, setSucursales] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadData();
        if (user) {
            setFormData({
                username: user.username || '',
                password: '',
                nombre: user.nombre || '',
                tipo: user.tipo?.toString() || '3',
                sucursalId: user.sucursalId?.toString() || '',
                viewAllCategories: user.viewAllCategories || false,
                allowedCategories: user.allowedCategories || []
            });
        }
    }, [user]);

    const loadData = async () => {
        try {
            const [catRes, sucRes] = await Promise.all([
                categoryService.getAll(),
                sucursalService.getAll()
            ]);
            setCategories(catRes.data);
            setSucursales(sucRes.data);
        } catch (error) {
            console.error('Error loading data:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleCategoryToggle = (categoryId) => {
        setFormData(prev => {
            const allowed = prev.allowedCategories.includes(categoryId)
                ? prev.allowedCategories.filter(id => id !== categoryId)
                : [...prev.allowedCategories, categoryId];
            return { ...prev, allowedCategories: allowed };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const userData = {
                ...formData,
                tipo: parseInt(formData.tipo),
                sucursalId: formData.sucursalId ? parseInt(formData.sucursalId) : null
            };

            // Don't send empty password for updates
            if (user && !userData.password) {
                delete userData.password;
            }

            await onSave(userData);
            onClose();
        } catch (error) {
            console.error('Error saving user:', error);
            alert(error.response?.data?.message || 'Error al guardar usuario');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{user ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Usuario *</label>
                                <input
                                    type="text"
                                    name="username"
                                    className="form-control"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    Contraseña {user ? '(dejar vacío para no cambiar)' : '*'}
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    className="form-control"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required={!user}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Nombre Completo *</label>
                            <input
                                type="text"
                                name="nombre"
                                className="form-control"
                                value={formData.nombre}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Tipo de Usuario *</label>
                                <select
                                    name="tipo"
                                    className="form-control"
                                    value={formData.tipo}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="1">Administrador</option>
                                    <option value="2">Usuario Limitado</option>
                                    <option value="3">Usuario Completo</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Sucursal</label>
                                <select
                                    name="sucursalId"
                                    className="form-control"
                                    value={formData.sucursalId}
                                    onChange={handleChange}
                                >
                                    <option value="">Sin sucursal</option>
                                    {sucursales.map(suc => (
                                        <option key={suc.id} value={suc.id}>{suc.nombre}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="viewAllCategories"
                                    checked={formData.viewAllCategories}
                                    onChange={handleChange}
                                />
                                <span>Ver todas las categorías</span>
                            </label>
                        </div>

                        {!formData.viewAllCategories && (
                            <div className="form-group">
                                <label className="form-label">Categorías Permitidas</label>
                                <div className="categories-grid">
                                    {categories.map(cat => (
                                        <label key={cat.id} className="category-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={formData.allowedCategories.includes(cat.id)}
                                                onChange={() => handleCategoryToggle(cat.id)}
                                            />
                                            <span>{cat.nombre}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
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

export default UserFormModal;
