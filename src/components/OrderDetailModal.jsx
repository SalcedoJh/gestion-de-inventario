import { exportOrderToPDF } from '../utils/pdfExport';
import { FiX, FiDownload } from 'react-icons/fi';
import './OrderDetailModal.css';

const OrderDetailModal = ({ order, onClose }) => {
    if (!order) return null;

    const handleDownloadPDF = () => {
        exportOrderToPDF(order, order.sucursal, order.user);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal order-detail-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div>
                        <h2>Pedido #{order.id}</h2>
                        <p className="order-date">
                            {new Date(order.fecha).toLocaleDateString('es-PE', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </p>
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        <FiX />
                    </button>
                </div>

                <div className="modal-body">
                    <div className="order-info-grid">
                        <div className="info-card">
                            <span className="info-label">Estado</span>
                            <span className={`badge badge-${order.estado === 'pendiente' ? 'warning' : 'success'}`}>
                                {order.estado}
                            </span>
                        </div>

                        {order.sucursal && (
                            <div className="info-card">
                                <span className="info-label">Sucursal</span>
                                <div>
                                    <strong>{order.sucursal.nombre}</strong>
                                    <p className="text-muted">{order.sucursal.direccion}</p>
                                    <p className="text-muted">{order.sucursal.telefono}</p>
                                </div>
                            </div>
                        )}

                        {order.user && (
                            <div className="info-card">
                                <span className="info-label">Usuario</span>
                                <strong>{order.user.nombre}</strong>
                            </div>
                        )}
                    </div>

                    <div className="products-section">
                        <h3>Productos</h3>
                        <div className="products-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Producto</th>
                                        <th>Detalles</th>
                                        <th>Cantidad</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.items.map((item, index) => (
                                        <tr key={index}>
                                            <td>
                                                <strong>{item.nombre}</strong>
                                            </td>
                                            <td>
                                                <div className="item-details-cell">
                                                    {item.tamano && <span className="detail-badge">{item.tamano}</span>}
                                                    {item.conTapa !== undefined && (
                                                        <span className="detail-badge">{item.conTapa ? 'Con tapa' : 'Sin tapa'}</span>
                                                    )}
                                                    {item.tipoTapa && <span className="detail-badge">Tapa: {item.tipoTapa}</span>}
                                                    {item.tipoFiltro && <span className="detail-badge">Filtro: {item.tipoFiltro}</span>}
                                                </div>
                                            </td>
                                            <td className="text-center">
                                                <span className="quantity-badge">{item.cantidad}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn btn-outline" onClick={onClose}>
                        Cerrar
                    </button>
                    <button className="btn btn-primary" onClick={handleDownloadPDF}>
                        <FiDownload /> Descargar PDF
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailModal;
