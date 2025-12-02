import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { orderService, productService, analyticsService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { exportToExcel } from '../utils/excelExport';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const { isAdmin } = useAuth();
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isAdmin) {
            loadData();
        }
    }, [isAdmin, selectedMonth, selectedYear]);

    const loadData = async () => {
        try {
            const [ordersRes, productsRes, analyticsRes] = await Promise.all([
                orderService.getAll(),
                productService.getAll(),
                analyticsService.get(selectedMonth, selectedYear)
            ]);
            setOrders(ordersRes.data);
            setProducts(productsRes.data);
            setAnalytics(analyticsRes.data);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        exportToExcel(orders, products);
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

    const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

    return (
        <div className="admin-dashboard">
            <div className="container">
                <div className="dashboard-header">
                    <h1>Panel de Administración</h1>
                    <button className="btn btn-success" onClick={handleExport}>
                        📊 Exportar a Excel
                    </button>
                </div>

                <div className="analytics-filters">
                    <div className="filter-group">
                        <label className="form-label">Mes:</label>
                        <select
                            className="form-control"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                        >
                            {months.map((month, index) => (
                                <option key={index} value={index + 1}>{month}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label className="form-label">Año:</label>
                        <select
                            className="form-control"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        >
                            {years.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">📦</div>
                        <div className="stat-content">
                            <h3>{analytics?.totalOrders || 0}</h3>
                            <p>Pedidos del mes</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">📈</div>
                        <div className="stat-content">
                            <h3>{orders.length}</h3>
                            <p>Total de pedidos</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">🏆</div>
                        <div className="stat-content">
                            <h3>{analytics?.topProducts?.length || 0}</h3>
                            <p>Productos más pedidos</p>
                        </div>
                    </div>
                </div>

                <div className="dashboard-section">
                    <h2>Productos Más Pedidos ({months[selectedMonth - 1]} {selectedYear})</h2>
                    {analytics?.topProducts && analytics.topProducts.length > 0 ? (
                        <div className="top-products">
                            {analytics.topProducts.map((item, index) => (
                                <div key={index} className="product-rank">
                                    <div className="rank-number">#{index + 1}</div>
                                    <div className="rank-info">
                                        <strong>{item.nombre}</strong>
                                        <span className="rank-quantity">{item.cantidad} unidades</span>
                                    </div>
                                    <div className="rank-bar">
                                        <div
                                            className="rank-fill"
                                            style={{
                                                width: `${(item.cantidad / analytics.topProducts[0].cantidad) * 100}%`
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="no-data">
                            <p>No hay datos para el período seleccionado</p>
                        </div>
                    )}
                </div>

                <div className="dashboard-section">
                    <h2>Últimos Pedidos</h2>
                    <div className="recent-orders">
                        {orders.slice(0, 10).map(order => (
                            <div key={order.id} className="recent-order">
                                <div className="order-info">
                                    <strong>Pedido #{order.id}</strong>
                                    <span className="order-date">
                                        {new Date(order.fecha).toLocaleDateString('es-PE')}
                                    </span>
                                </div>
                                <div className="order-summary">
                                    {order.items.length} productos - {order.items.reduce((sum, item) => sum + item.cantidad, 0)} unidades
                                </div>
                                <span className={`badge badge-${order.estado === 'pendiente' ? 'warning' : 'success'}`}>
                                    {order.estado}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
