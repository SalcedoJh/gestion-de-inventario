import { useState, useEffect } from 'react';
import { orderService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import OrderDetailModal from '../components/OrderDetailModal';
import './OrderHistory.css';

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const { isAdmin } = useAuth();

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            const res = await orderService.getAll();
            setOrders(res.data);
        } catch (error) {
            console.error('Error loading orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (orderId) => {
        try {
            const res = await orderService.getOne(orderId);
            setSelectedOrder(res.data);
        } catch (error) {
            console.error('Error loading order details:', error);
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await orderService.updateStatus(orderId, newStatus);
            // Reload orders to reflect the change
            await loadOrders();
            alert(`Estado del pedido #${orderId} actualizado a "${newStatus}"`);
            // TODO: Implement notification to the corresponding branch
        } catch (error) {
            console.error('Error updating order status:', error);
            alert('Error al actualizar el estado del pedido');
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="order-history-page">
            <div className="container">
                <div className="page-header">
                    <h1>{isAdmin ? 'Todos los Pedidos' : 'Mis Pedidos'}</h1>
                    <p className="text-muted">
                        {orders.length} {orders.length === 1 ? 'pedido registrado' : 'pedidos registrados'}
                    </p>
                </div>

                {orders.length === 0 ? (
                    <div className="no-orders">
                        <div className="no-orders-icon">📦</div>
                        <h3>No hay pedidos registrados</h3>
                        <p>Los pedidos que realices aparecerán aquí</p>
                    </div>
                ) : (
                    <div className="orders-table-container">
                        <table className="orders-table">
                            <thead>
                                <tr>
                                    <th>Número</th>
                                    <th>Fecha</th>
                                    {isAdmin && <th>Sucursal</th>}
                                    <th>Productos</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => (
                                    <tr key={order.id} className="order-row">
                                        <td data-label="Número">
                                            <strong>#{order.id}</strong>
                                        </td>
                                        <td data-label="Fecha">
                                            {new Date(order.fecha).toLocaleDateString('es-PE', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </td>
                                        {isAdmin && (
                                            <td data-label="Sucursal">{order.sucursal?.nombre || '-'}</td>
                                        )}
                                        <td data-label="Productos">
                                            {order.items.length} {order.items.length === 1 ? 'producto' : 'productos'}
                                        </td>
                                        <td data-label="Estado">
                                            {isAdmin ? (
                                                <select
                                                    className="form-control form-control-sm"
                                                    value={order.estado}
                                                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                    style={{ minWidth: '120px' }}
                                                >
                                                    <option value="pendiente">Pendiente</option>
                                                    <option value="completado">Completado</option>
                                                    <option value="cancelado">Cancelado</option>
                                                </select>
                                            ) : (
                                                <span className={`badge badge-${order.estado === 'pendiente' ? 'warning' : 'success'}`}>
                                                    {order.estado}
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-sm btn-primary"
                                                onClick={() => handleViewDetails(order.id)}
                                            >
                                                Ver Detalles
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {selectedOrder && (
                <OrderDetailModal
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                />
            )}
        </div>
    );
};

export default OrderHistory;
