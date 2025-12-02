import { useState, useEffect } from 'react';
import { productService, categoryService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import ProductModal from '../components/ProductModal';
import './Products.css';

const Products = () => {
    const { isAdmin } = useAuth();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

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

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.articulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !selectedCategory || selectedCategory === 'all';
        return matchesSearch && matchesCategory;
    });

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="products-page">
            <div className="container">
                <div className="products-header">
                    <h1>Catálogo de Productos</h1>
                    {isAdmin ? (
                        <p className="text-muted">Vista de catálogo - Los administradores no pueden realizar pedidos</p>
                    ) : (
                        <p className="text-muted">Selecciona los productos que necesitas para tu pedido</p>
                    )}
                </div>

                <div className="products-filters">
                    <div className="search-box">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="🔍 Buscar productos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="category-filter">
                        <select
                            className="form-control"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            <option value="all">Todas las categorías</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="products-count">
                    <p>{filteredProducts.length} productos encontrados</p>
                </div>

                <div className="products-grid">
                    {filteredProducts.map(product => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            onClick={isAdmin ? null : setSelectedProduct}
                        />
                    ))}
                </div>

                {filteredProducts.length === 0 && (
                    <div className="no-results">
                        <div className="no-results-icon">🔍</div>
                        <h3>No se encontraron productos</h3>
                        <p>Intenta con otros términos de búsqueda</p>
                    </div>
                )}
            </div>

            {selectedProduct && !isAdmin && (
                <ProductModal
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                />
            )}
        </div>
    );
};

export default Products;
