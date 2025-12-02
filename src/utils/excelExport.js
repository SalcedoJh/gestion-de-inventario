import * as XLSX from 'xlsx';

export const exportToExcel = (orders, products) => {
    // Prepare data for Excel
    const data = orders.map(order => {
        const orderItems = order.items.map(item => {
            const product = products.find(p => p.id === item.productId);
            return {
                'ID Pedido': order.id,
                'Fecha': new Date(order.fecha).toLocaleDateString('es-PE'),
                'Usuario': order.userId,
                'Producto': product?.articulo || 'Desconocido',
                'Cantidad': item.cantidad,
                'Tamaño': item.tamano || 'N/A',
                'Con Tapa': item.conTapa ? 'Sí' : 'No',
                'Tipo Tapa': item.tipoTapa || 'N/A',
                'Tipo Filtro': item.tipoFiltro || 'N/A',
                'Estado': order.estado
            };
        });
        return orderItems;
    }).flat();

    // Create workbook
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Pedidos');

    // Generate file name with current date
    const fileName = `pedidos_${new Date().toISOString().split('T')[0]}.xlsx`;

    // Download file
    XLSX.writeFile(wb, fileName);
};
