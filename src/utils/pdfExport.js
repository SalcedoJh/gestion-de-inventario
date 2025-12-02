import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const exportOrderToPDF = (order, sucursal, user) => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.setTextColor(99, 102, 241);
    doc.text('AVANLAB', 14, 20);

    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(`Pedido #${order.id}`, 14, 30);

    // Order info
    doc.setFontSize(10);
    doc.text(`Fecha: ${new Date(order.fecha).toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })}`, 14, 40);

    doc.text(`Estado: ${order.estado.toUpperCase()}`, 14, 46);

    if (sucursal) {
        doc.text(`Sucursal: ${sucursal.nombre}`, 14, 52);
        doc.text(`Dirección: ${sucursal.direccion}`, 14, 58);
        doc.text(`Teléfono: ${sucursal.telefono}`, 14, 64);
    }

    if (user) {
        doc.text(`Usuario: ${user.nombre}`, 14, 70);
    }

    // Products table
    const tableData = order.items.map(item => [
        item.nombre,
        item.tamano || '-',
        item.conTapa ? 'Sí' : 'No',
        item.tipoTapa || '-',
        item.cantidad
    ]);

    doc.autoTable({
        startY: 80,
        head: [['Producto', 'Tamaño', 'Con Tapa', 'Tipo Tapa', 'Cant.']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [99, 102, 241] },
        styles: { fontSize: 9 },
        columnStyles: {
            4: { halign: 'center' }
        }
    });

    // Footer note
    const finalY = doc.lastAutoTable.finalY + 10;

    // Footer
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(128, 128, 128);
    doc.text('Gracias por su pedido - AVANLAB', 14, doc.internal.pageSize.height - 10);

    // Save
    doc.save(`Pedido_${order.id}_${new Date().toISOString().split('T')[0]}.pdf`);
};
