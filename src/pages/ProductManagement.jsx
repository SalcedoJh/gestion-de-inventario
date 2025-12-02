import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { productService, categoryService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import ProductFormModal from '../components/ProductFormModal';
import './ProductManagement.css';

const ProductManagement = () => {
    const { isAdmin } = useAuth();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (isAdmin) {
            loadData();
        }
    }, [isAdmin]);

    const loadData = async () => {
        try {
            const [productsRes, categoriesRes] = await Promise.all([
                productService.getAll(),
                categoryService.getAll()
            ]);
            setProducts(productsRes.data);
            setCategories(categoriesRes.data);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setSelectedProduct(null);
        setShowModal(true);
    };

    const handleEdit = (product) => {
        setSelectedProduct(product);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Estás seguro de eliminar este producto?')) return;

        try {
            await productService.delete(id);
            await loadData();
        } catch (error) {
            alert('Error al eliminar el producto');
        }
    };

    const handleSave = async () => {
        setShowModal(false);
        await loadData();
    };

    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    const filteredProducts = products.filter(p =>
        p.articulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="product-management-page">
            <div className="container">
                <div className="page-header">
                    <h1>Gestión de Productos</h1>
                    <button className="btn btn-primary" onClick={handleAdd}>
                        <FiPlus /> Agregar Producto
                    </button>
                </div>

                <div className="search-section">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="🔍 Buscar productos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <p className="text-muted">{filteredProducts.length} productos encontrados</p>
                </div>

                <div className="products-table-container">
                    <table className="products-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Imagen</th>
                                <th>Artículo</th>
                                <th>Descripción</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map(product => (
                                <tr key={product.id}>
                                    <td>{product.id}</td>
                                    <td>
                                        <img
                                            src={product.imagen}
                                            alt={product.articulo}
                                            className="product-thumbnail"
                                            onError={(e) => e.target.src = 'https://via.placeholder.com/50'}
                                        />
                                    </td>
                                    <td>
                                        <strong>{product.articulo}</strong>
                                    </td>
                                    <td className="description-cell">{product.descripcion}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="btn btn-sm btn-outline"
                                                onClick={() => handleEdit(product)}
                                                title="Editar"
                                            >
                                                <FiEdit2 />
                                            </button>
                                            <button
                                                className="btn btn-sm btn-danger"
                                                onClick={() => handleDelete(product.id)}
                                                title="Eliminar"
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <ProductFormModal
                    product={selectedProduct}
                    categories={categories}
                    onClose={() => setShowModal(false)}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

export default ProductManagement;
