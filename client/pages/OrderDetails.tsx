import Layout from "@/components/Layout";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db, auth } from "@/lib/firebase";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { 
  Package, 
  Truck, 
  Home, 
  CheckCircle, 
  Clock, 
  XCircle,
  Download,
  User,
  MapPin,
  CreditCard,
  Calendar
} from "lucide-react";
import { generateInvoice } from "@/lib/invoice";

// Define TypeScript interfaces
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

interface StatusTimeline {
  status: string;
  timestamp: any;
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
  statusTimeline: StatusTimeline[];
  createdAt: any;
}

// Order status options
const ORDER_STATUSES = [
  "ORDER_PLACED",
  "CONFIRMED",
  "PACKED",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED"
];

// Status display names and icons
const STATUS_CONFIG: Record<string, { displayName: string; icon: React.ElementType; color: string }> = {
  "ORDER_PLACED": { 
    displayName: "Order Placed", 
    icon: Package, 
    color: "bg-blue-500" 
  },
  "CONFIRMED": { 
    displayName: "Confirmed", 
    icon: CheckCircle, 
    color: "bg-green-500" 
  },
  "PACKED": { 
    displayName: "Packed", 
    icon: Package, 
    color: "bg-yellow-500" 
  },
  "SHIPPED": { 
    displayName: "Shipped", 
    icon: Truck, 
    color: "bg-purple-500" 
  },
  "OUT_FOR_DELIVERY": { 
    displayName: "Out for Delivery", 
    icon: Home, 
    color: "bg-indigo-500" 
  },
  "DELIVERED": { 
    displayName: "Delivered", 
    icon: CheckCircle, 
    color: "bg-green-500" 
  }
};

export default function OrderDetails() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Fetch order details
  useEffect(() => {
    if (!orderId) {
      setError("Order ID is missing");
      setLoading(false);
      return;
    }

    // Check if user is admin (simplified check)
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        // In a real app, you would check if the user is an admin
        // For now, we'll just check if the user exists
        setIsAdmin(!!user);
      }
    });

    // Listen for real-time updates to the order
    const orderRef = doc(db, "orders", orderId);
    const unsubscribe = onSnapshot(
      orderRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setOrder({
            orderId: docSnap.id,
            ...docSnap.data()
          } as Order);
        } else {
          setError("Order not found");
        }
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching order:", err);
        setError("Failed to load order details");
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
      unsubscribeAuth();
    };
  }, [orderId]);

  // Format date
  const formatDate = (date: any) => {
    if (!date) return "N/A";
    
    if (date.toDate) {
      return date.toDate().toLocaleDateString() + " " + date.toDate().toLocaleTimeString();
    }
    
    return new Date(date).toLocaleDateString() + " " + new Date(date).toLocaleTimeString();
  };

  // Get current status index
  const getCurrentStatusIndex = () => {
    if (!order) return -1;
    return ORDER_STATUSES.indexOf(order.orderStatus);
  };

  // Update order status (admin only)
  const updateOrderStatus = async (newStatus: string) => {
    if (!order || !isAdmin) return;
    
    try {
      const orderRef = doc(db, "orders", order.orderId);
      const newTimelineEntry = {
        status: newStatus,
        timestamp: new Date()
      };
      
      await updateDoc(orderRef, {
        orderStatus: newStatus,
        statusTimeline: [...order.statusTimeline, newTimelineEntry]
      });
      
      // Update local state
      setOrder({
        ...order,
        orderStatus: newStatus,
        statusTimeline: [...order.statusTimeline, newTimelineEntry]
      });
    } catch (err) {
      console.error("Error updating order status:", err);
      alert("Failed to update order status");
    }
  };

  // Download invoice
  const downloadInvoice = () => {
    if (order) {
      generateInvoice(order);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-900 py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="bg-gray-800 rounded-xl shadow-lg p-8">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-700 rounded w-1/3 mb-6"></div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="h-64 bg-gray-700 rounded"></div>
                    <div className="h-64 bg-gray-700 rounded"></div>
                  </div>
                  <div className="h-96 bg-gray-700 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !order) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-900 py-16 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <div className="bg-gray-800 rounded-xl shadow-lg p-12">
              <div className="w-20 h-20 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-10 h-10 text-red-400" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">
                {error || "Order Not Found"}
              </h1>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                {error || "The order you're looking for doesn't exist or may have been removed."}
              </p>
              <a
                href="/orders"
                className="inline-flex items-center gap-2 bg-accent text-black font-bold py-3 px-8 rounded-lg hover:bg-yellow-300 transition-all duration-300 hover:shadow-lg active:scale-95"
              >
                View All Orders
              </a>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const currentStatusIndex = getCurrentStatusIndex();

  return (
    <Layout>
      <div className="min-h-screen bg-gray-900 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Order Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white">Order Details</h1>
              <p className="text-gray-300 mt-2">
                Order ID: {order.orderId} • Placed on {formatDate(order.createdAt)}
              </p>
            </div>
            <button
              onClick={downloadInvoice}
              className="mt-4 md:mt-0 flex items-center gap-2 bg-accent text-black font-bold py-2 px-4 rounded-lg hover:bg-yellow-300 transition-all"
            >
              <Download className="w-4 h-4" />
              Download Invoice
            </button>
          </div>

          {/* Order Status Tracker */}
          <div className="bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-6">Order Status</h2>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between relative">
              {/* Progress line */}
              <div className="absolute left-4 md:left-1/2 top-6 md:top-1/2 transform md:-translate-x-1/2 md:-translate-y-1/2 w-1 md:w-full h-1 md:h-0.5 bg-gray-700 z-0"></div>
              
              {/* Status steps */}
              <div className="flex flex-col md:flex-row w-full relative z-10">
                {ORDER_STATUSES.map((status, index) => {
                  const statusConfig = STATUS_CONFIG[status];
                  const Icon = statusConfig.icon;
                  const isCompleted = index <= currentStatusIndex;
                  const isCurrent = index === currentStatusIndex;
                  
                  return (
                    <div 
                      key={status} 
                      className="flex flex-col items-center flex-1 mb-8 md:mb-0"
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                        isCompleted 
                          ? `${statusConfig.color} text-white` 
                          : "bg-gray-700 text-gray-400"
                      }`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className={`text-sm font-medium text-center px-2 ${
                        isCurrent ? "text-accent font-bold" : isCompleted ? "text-white" : "text-gray-400"
                      }`}>
                        {statusConfig.displayName}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Items */}
            <div className="lg:col-span-2">
              <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <div className="p-6 border-b border-gray-700">
                  <h2 className="text-xl font-bold text-white">Order Items</h2>
                </div>
                <div className="divide-y divide-gray-700">
                  {order.products.map((product) => (
                    <div key={product.productId} className="p-6 flex items-center">
                      <div className="w-20 h-20 flex-shrink-0 bg-gray-700 rounded-lg overflow-hidden">
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="font-bold text-white">{product.name}</h3>
                        <p className="text-gray-300 text-sm mt-1">
                          Quantity: {product.quantity}
                        </p>
                      </div>
                      <div className="font-bold text-white">
                        ₹{product.price * product.quantity}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-6 border-t border-gray-700 bg-gray-700/50">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white">Total Amount</span>
                    <span className="font-bold text-xl text-accent">
                      ₹{order.totalAmount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-gray-800 rounded-xl shadow-lg p-6 mt-8">
                <h2 className="text-xl font-bold text-white mb-4">Delivery Address</h2>
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                  <div className="ml-3">
                    <p className="font-bold text-white">{order.deliveryAddress.name}</p>
                    <p className="text-gray-300 mt-1">{order.deliveryAddress.address}</p>
                    <p className="text-gray-300">
                      {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}
                    </p>
                    <p className="text-gray-300 mt-1">Phone: {order.deliveryAddress.phone}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <div className="bg-gray-800 rounded-xl shadow-lg p-6 sticky top-8">
                <h2 className="text-xl font-bold text-white mb-4">Order Summary</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-accent" />
                    <div className="ml-3">
                      <p className="text-sm text-gray-300">Order Date</p>
                      <p className="font-medium text-white">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <CreditCard className="w-5 h-5 text-accent" />
                    <div className="ml-3">
                      <p className="text-sm text-gray-300">Payment ID</p>
                      <p className="font-medium text-white">{order.paymentId}</p>
                      <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-semibold ${
                        order.paymentStatus === "PAID" 
                          ? "bg-green-900/30 text-green-400" 
                          : "bg-yellow-900/30 text-yellow-400"
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <User className="w-5 h-5 text-accent" />
                    <div className="ml-3">
                      <p className="text-sm text-gray-300">Customer</p>
                      <p className="font-medium text-white">{order.deliveryAddress.name}</p>
                    </div>
                  </div>
                </div>

                {/* Admin Controls */}
                {isAdmin && (
                  <div className="mt-8 pt-6 border-t border-gray-700">
                    <h3 className="font-bold text-white mb-3">Update Order Status</h3>
                    <div className="space-y-2">
                      {ORDER_STATUSES.map((status) => {
                        const statusConfig = STATUS_CONFIG[status];
                        const Icon = statusConfig.icon;
                        const isCurrent = status === order.orderStatus;
                        
                        return (
                          <button
                            key={status}
                            onClick={() => updateOrderStatus(status)}
                            disabled={isCurrent}
                            className={`w-full flex items-center gap-2 p-3 rounded-lg text-left transition-all ${
                              isCurrent
                                ? "bg-accent text-black"
                                : "bg-gray-700 hover:bg-gray-600 text-white"
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            <span>{statusConfig.displayName}</span>
                            {isCurrent && (
                              <CheckCircle className="w-4 h-4 ml-auto" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Status Timeline */}
                <div className="mt-8 pt-6 border-t border-gray-700">
                  <h3 className="font-bold text-white mb-3">Status Timeline</h3>
                  <div className="space-y-4">
                    {order.statusTimeline.map((timeline, index) => {
                      const statusConfig = STATUS_CONFIG[timeline.status];
                      const Icon = statusConfig?.icon || Clock;
                      
                      return (
                        <div key={index} className="flex items-start">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            statusConfig?.color || "bg-gray-700"
                          } text-white`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="ml-3">
                            <p className="font-medium text-white">
                              {statusConfig?.displayName || timeline.status}
                            </p>
                            <p className="text-sm text-gray-300">
                              {formatDate(timeline.timestamp)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}