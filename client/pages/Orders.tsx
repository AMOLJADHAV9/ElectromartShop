import Layout from "@/components/Layout";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { Download, Eye } from "lucide-react";
import { generateInvoice } from "@/lib/invoice";
import { Link } from "react-router-dom";

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
  id: string;
  orderId?: string;
  userId: string;
  products: Product[];
  totalAmount: number;
  paymentId: string;
  paymentStatus: string;
  deliveryAddress: DeliveryAddress;
  orderStatus: string;
  statusTimeline: any[];
  createdAt: any;
  // For backward compatibility
  items?: any[];
  totalItems?: number;
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

interface Payment {
  id: string;
  orderId: string;
  paymentId: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: any;
  customer?: {
    name: string;
    email: string;
  };
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch orders from Firestore
  useEffect(() => {
    const ordersQuery = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsubscribeOrders = onSnapshot(ordersQuery, (querySnapshot) => {
      const ordersData: Order[] = [];
      querySnapshot.forEach((doc) => {
        const orderData = doc.data();
        ordersData.push({
          id: doc.id,
          orderId: doc.id,
          userId: orderData.userId || '',
          products: Array.isArray(orderData.products) ? orderData.products : 
                   (Array.isArray(orderData.items) ? orderData.items : []),
          totalAmount: typeof orderData.totalAmount === 'number' ? orderData.totalAmount : 
                      (typeof orderData.finalAmount === 'number' ? orderData.finalAmount : 0),
          paymentId: orderData.paymentId || '',
          paymentStatus: orderData.paymentStatus || 'pending',
          deliveryAddress: orderData.deliveryAddress || {
            name: orderData.customer?.name || 'N/A',
            phone: orderData.customer?.phone || 'N/A',
            address: '',
            city: '',
            pincode: '',
            state: ''
          },
          orderStatus: orderData.orderStatus || 'pending',
          statusTimeline: Array.isArray(orderData.statusTimeline) ? orderData.statusTimeline : [],
          createdAt: orderData.createdAt,
          items: orderData.items,
          totalItems: typeof orderData.totalItems === 'number' ? orderData.totalItems : 0,
          totalDiscount: typeof orderData.totalDiscount === 'number' ? orderData.totalDiscount : 0,
          totalTax: typeof orderData.totalTax === 'number' ? orderData.totalTax : 0,
          shippingCharges: typeof orderData.shippingCharges === 'number' ? orderData.shippingCharges : 0,
          finalAmount: typeof orderData.finalAmount === 'number' ? orderData.finalAmount : 0,
          date: orderData.date || new Date().toISOString().split('T')[0],
          customer: orderData.customer,
        } as Order);
      });
      setOrders(ordersData);
    });

    const paymentsQuery = query(collection(db, "payments"), orderBy("createdAt", "desc"));
    const unsubscribePayments = onSnapshot(paymentsQuery, (querySnapshot) => {
      const paymentsData: Payment[] = [];
      querySnapshot.forEach((doc) => {
        const paymentData = doc.data();
        paymentsData.push({
          id: doc.id,
          orderId: paymentData.orderId || '',
          paymentId: paymentData.paymentId || '',
          amount: typeof paymentData.amount === 'number' ? paymentData.amount : 0,
          currency: paymentData.currency || 'INR',
          status: paymentData.status || 'pending',
          createdAt: paymentData.createdAt,
          customer: paymentData.customer,
        } as Payment);
      });
      setPayments(paymentsData);
      setLoading(false);
    });

    // Cleanup subscriptions
    return () => {
      unsubscribeOrders();
      unsubscribePayments();
    };
  }, []);

  const formatDate = (date: any) => {
    if (!date) return "N/A";
    
    if (date.toDate) {
      return date.toDate().toLocaleDateString();
    }
    
    return new Date(date).toLocaleDateString();
  };

  const downloadInvoice = (order: any) => {
    generateInvoice(order);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-900 py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="bg-gray-800 rounded-xl shadow-lg p-8">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-700 rounded w-1/3 mb-6"></div>
                <div className="space-y-4">
                  <div className="h-16 bg-gray-700 rounded"></div>
                  <div className="h-16 bg-gray-700 rounded"></div>
                  <div className="h-16 bg-gray-700 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-900 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Order & Payment History</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order History */}
            <div>
              <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <div className="p-6 border-b border-gray-700">
                  <h2 className="text-2xl font-bold text-white">Order History</h2>
                </div>
                
                {orders.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-gray-400">No orders found</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-700">
                    {orders.map((order) => (
                      <div key={order.id} className="p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-white">Order #{(order.orderId || order.id).substring(0, 8)}</h3>
                            <p className="text-sm text-gray-400 mt-1">
                              {formatDate(order.createdAt)} • {(order.totalItems || order.products?.length || 0)} items
                            </p>
                            <p className="text-accent font-semibold mt-2">
                              ₹{typeof order.totalAmount === 'number' ? order.totalAmount.toFixed(2) : '0.00'}
                            </p>
                            <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-semibold ${
                              order.orderStatus === "DELIVERED" || order.paymentStatus === "completed" 
                                ? "bg-green-900/30 text-green-400" 
                                : "bg-yellow-900/30 text-yellow-400"
                            }`}>
                              {order.orderStatus || order.paymentStatus}
                            </span>
                          </div>
                          
                          <div className="flex gap-2">
                            <button 
                              onClick={() => downloadInvoice(order)}
                              className="p-2 text-accent hover:text-yellow-300"
                              title="Download Invoice"
                            >
                              <Download className="w-5 h-5" />
                            </button>
                            <Link 
                              to={`/orders/${order.id}`}
                              className="p-2 text-accent hover:text-yellow-300"
                              title="View Details"
                            >
                              <Eye className="w-5 h-5" />
                            </Link>
                          </div>
                        </div>
                        
                        {(order.products.length > 0 || (order.items && order.items.length > 0)) && (
                          <div className="mt-4 space-y-2">
                            {(order.products || order.items || []).slice(0, 2).map((item: any, index: number) => (
                              <div key={index} className="flex items-center text-sm text-gray-300">
                                <span className="font-medium">{item.quantity || 0}x</span>
                                <span className="ml-2 truncate">{item.name || 'Unknown Item'}</span>
                                {item.price !== undefined && (
                                  <span className="ml-2">
                                    ₹{typeof item.price === 'number' ? item.price.toFixed(2) : '0.00'}
                                  </span>
                                )}
                              </div>
                            ))}
                            {(order.products.length > 2 || (order.items && order.items.length > 2)) && (
                              <p className="text-xs text-gray-400">
                                + {Math.max(order.products.length, order.items?.length || 0) - 2} more items
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Payment History */}
            <div>
              <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <div className="p-6 border-b border-gray-700">
                  <h2 className="text-2xl font-bold text-white">Payment History</h2>
                </div>
                
                {payments.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-gray-400">No payments found</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-700">
                    {payments.map((payment) => (
                      <div key={payment.id} className="p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-white">
                              Payment #{payment.paymentId?.substring(0, 8) || payment.id.substring(0, 8)}
                            </h3>
                            <p className="text-sm text-gray-400 mt-1">
                              {formatDate(payment.createdAt)}
                            </p>
                            <p className="text-accent font-semibold mt-2">
                              ₹{typeof payment.amount === 'number' ? payment.amount.toFixed(2) : '0.00'}
                            </p>
                            <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-semibold ${
                              payment.status === "completed" 
                                ? "bg-green-900/30 text-green-400" 
                                : "bg-yellow-900/30 text-yellow-400"
                            }`}>
                              {payment.status}
                            </span>
                          </div>
                        </div>
                        
                        {payment.customer && (
                          <p className="text-sm text-gray-300 mt-2">
                            {payment.customer.name} • {payment.customer.email}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}