import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Product {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface DeliveryAddress {
  name: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  state: string;
}

interface Order {
  orderId: string;
  userId: string;
  products: Product[];
  totalAmount: number;
  paymentId: string;
  paymentStatus: string;
  deliveryAddress: DeliveryAddress;
  orderStatus: string;
  statusTimeline: any[];
  createdAt: any;
  // For backward compatibility with existing orders
  id?: string;
  items?: any[];
  totalDiscount?: number;
  totalTax?: number;
  shippingCharges?: number;
  finalAmount?: number;
  date?: string;
  customer?: {
    name: string;
    email: string;
    phone: string;
  };
}

export const generateInvoice = (order: Order) => {
  const doc = new jsPDF();
  
  // Set font and size
  doc.setFont('helvetica');
  
  // Add company header
  doc.setFontSize(22);
  doc.setTextColor(0, 0, 0);
  doc.text('ElectroMart', 20, 20);
  
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text('Your Electronics Store', 20, 30);
  doc.text('123 Electronic Street, Tech City', 20, 37);
  doc.text('Email: info@electromart.com | Phone: +91 9876543210', 20, 44);
  
  // Add invoice title
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text('INVOICE', 150, 20);
  
  // Add invoice details
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Invoice #: ${(order.orderId || order.id || '').substring(0, 8)}`, 150, 30);
  doc.text(`Date: ${order.date || (order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : new Date().toLocaleDateString())}`, 150, 37);
  doc.text(`Order ID: ${(order.orderId || order.id || '').substring(0, 10)}`, 150, 44);
  doc.text(`Payment ID: ${(order.paymentId || '').substring(0, 10)}`, 150, 51);
  
  // Add customer details
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('Bill To:', 20, 65);
  
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  const customerName = order.deliveryAddress?.name || order.customer?.name || 'N/A';
  const customerEmail = order.customer?.email || 'N/A';
  const customerPhone = order.deliveryAddress?.phone || order.customer?.phone || 'N/A';
  
  doc.text(customerName, 20, 72);
  doc.text(customerEmail, 20, 79);
  doc.text(customerPhone, 20, 86);
  
  // Add items table
  const tableData = (order.products || order.items || []).map((item: any) => [
    item.name,
    `₹${typeof item.price === 'number' ? item.price.toFixed(2) : '0.00'}`,
    item.quantity || 0,
    `₹${typeof item.price === 'number' && typeof item.quantity === 'number' 
      ? (item.price * item.quantity).toFixed(2) 
      : '0.00'}`
  ]);
  
  autoTable(doc, {
    head: [['Item', 'Price', 'Quantity', 'Total']],
    body: tableData,
    startY: 95,
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [51, 153, 204],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    theme: 'grid',
  });
  
  // Add totals section
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  // Calculate amounts
  const totalAmount = order.totalAmount || order.finalAmount || 0;
  const taxAmount = Math.round(totalAmount * 0.18);
  const discount = order.totalDiscount || 0;
  const shipping = order.shippingCharges || 0;
  
  // Subtotal
  doc.setFontSize(10);
  doc.text('Subtotal:', 150, finalY);
  doc.text(`₹${typeof totalAmount === 'number' ? (totalAmount - taxAmount).toFixed(2) : '0.00'}`, 180, finalY);
  
  // Discount
  if (discount > 0) {
    doc.text('Discount:', 150, finalY + 7);
    doc.text(`-₹${typeof discount === 'number' ? discount.toFixed(2) : '0.00'}`, 180, finalY + 7);
  }
  
  // Tax
  doc.text('Tax:', 150, finalY + (discount > 0 ? 14 : 7));
  doc.text(`₹${typeof taxAmount === 'number' ? taxAmount.toFixed(2) : '0.00'}`, 180, finalY + (discount > 0 ? 14 : 7));
  
  // Shipping
  doc.text('Shipping:', 150, finalY + (discount > 0 ? 21 : 14));
  doc.text(
    `₹${typeof shipping === 'number' ? shipping.toFixed(2) : '0.00'}`, 
    180, 
    finalY + (discount > 0 ? 21 : 14)
  );
  
  // Final Total
  doc.setFont(undefined, 'bold');
  doc.setFontSize(12);
  doc.text('Total:', 150, finalY + (discount > 0 ? 28 : 21));
  doc.text(
    `₹${typeof totalAmount === 'number' ? totalAmount.toFixed(2) : '0.00'}`, 
    180, 
    finalY + (discount > 0 ? 28 : 21)
  );
  
  // Add footer
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Thank you for your business!', 20, finalY + 50);
  doc.text('If you have any questions about this invoice, please contact us.', 20, finalY + 57);
  
  // Save the PDF
  doc.save(`invoice-${(order.orderId || order.id || '').substring(0, 8)}.pdf`);
};