import Layout from "@/components/Layout";
import {
  BarChart3,
  Package,
  Users,
  ShoppingBag,
  Plus,
  Edit2,
  Trash2,
  Eye,
  TrendingUp,
  DollarSign,
  Grid,
} from "lucide-react";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, getDocs } from "firebase/firestore";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  rating: number;
  sales: number;
  image?: string;
  offer?: {
    isActive: boolean;
    discountPercentage: number;
    endDate: string;
    description: string;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  joinDate: string;
  totalOrders: number;
  totalSpent: number;
}

interface Order {
  id: string;
  customer: string;
  date: string;
  amount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "ORDER_PLACED" | "CONFIRMED" | "PACKED" | "SHIPPED" | "OUT_FOR_DELIVERY" | "DELIVERED";
  items: number;
  orderId?: string;
  userId?: string;
  products?: any[];
  paymentId?: string;
  paymentStatus?: string;
  deliveryAddress?: any;
  statusTimeline?: any[];
  createdAt?: any;
}

// Removed mock products - will fetch from Firestore
// Removed mock users - will fetch from Firebase Auth
// Removed mock orders - will fetch from Firestore

// Generate sales data for the last 6 months
const generateSalesData = () => {
  const data = [];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentMonth = new Date().getMonth();
  
  // Generate data for the last 6 months
  for (let i = 5; i >= 0; i--) {
    const monthIndex = (currentMonth - i + 12) % 12;
    const month = months[monthIndex];
    
    // Generate realistic sales and revenue data
    const sales = Math.floor(Math.random() * 1000) + 500; // 500-1500 sales
    const revenue = sales * (Math.floor(Math.random() * 500) + 100); // Revenue based on sales
    
    data.push({ month, sales, revenue });
  }
  
  return data;
};

const salesData = generateSalesData();

export default function Admin() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "products" | "offers" | "users" | "orders">("dashboard");
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]); // Changed from mockUsers to state
  const [orders, setOrders] = useState<Order[]>([]); // Changed from mockOrders to state
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
    image: "",
    offer: {
      isActive: false,
      discountPercentage: 0,
      endDate: "",
      description: "",
    },
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [realOrders, setRealOrders] = useState<any[]>([]);
  const [realRevenue, setRealRevenue] = useState(0);

  // Calculate total revenue based on real orders
  const totalRevenue = realRevenue > 0 ? realRevenue : orders.reduce((acc, order) => acc + (order.amount || 0), 0);
  
  // Calculate total orders based on fetched orders
  const totalOrders = orders.length;
  
  // Total products count
  const totalProducts = products.length;
  
  // Total users count
  const totalUsers = users.length;
  
  // Calculate category distribution based on real products
  const calculateCategoryData = () => {
    const categoryCount: Record<string, number> = {};
    
    products.forEach(product => {
      if (product.category) {
        categoryCount[product.category] = (categoryCount[product.category] || 0) + 1;
      }
    });
    
    const totalProducts = products.length;
    const colors = ["#007BFF", "#FF9900", "#00FF7F", "#9D4EDD", "#FF6B6B", "#4ECDC4"];
    
    return Object.entries(categoryCount).map(([name, count], index) => ({
      name,
      value: Math.round((count / totalProducts) * 100),
      color: colors[index % colors.length]
    }));
  };
  
  const categoryData = calculateCategoryData();
  
  // Calculate monthly sales data based on actual orders
  const calculateMonthlySalesData = () => {
    // If we have real orders, use them; otherwise use simulated data
    if (realOrders.length > 0) {
      // Group orders by month
      const monthlyStats: Record<string, { sales: number; revenue: number }> = {};
      
      realOrders.forEach(order => {
        // Create a date from Firestore timestamp or use current date
        const orderDate = order.createdAt ? 
          new Date(order.createdAt.seconds * 1000) : 
          new Date();
          
        const monthKey = `${orderDate.getFullYear()}-${orderDate.getMonth()}`;
        
        if (!monthlyStats[monthKey]) {
          monthlyStats[monthKey] = { sales: 0, revenue: 0 };
        }
        
        monthlyStats[monthKey].sales += 1;
        monthlyStats[monthKey].revenue += order.totalAmount || 0;
      });
      
      // Convert to array format for charts
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const result = [];
      
      // Get last 6 months
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
        const monthName = months[date.getMonth()];
        
        const stats = monthlyStats[monthKey] || { sales: 0, revenue: 0 };
        
        result.push({
          month: monthName,
          sales: stats.sales,
          revenue: stats.revenue
        });
      }
      
      return result;
    } else {
      // Use simulated data if no real orders
      const monthlyData = [...salesData];
      
      // Adjust the current month's data based on recent product sales
      if (monthlyData.length > 0) {
        const currentMonthIndex = monthlyData.length - 1;
        const currentMonthData = monthlyData[currentMonthIndex];
        
        // Add some variation based on actual product sales
        const additionalSales = Math.min(totalOrders, 1000); // Cap additional sales
        const additionalRevenue = Math.min(totalRevenue, 500000); // Cap additional revenue
        
        monthlyData[currentMonthIndex] = {
          ...currentMonthData,
          sales: currentMonthData.sales + additionalSales,
          revenue: currentMonthData.revenue + additionalRevenue
        };
      }
      
      return monthlyData;
    }
  };
  
  const monthlySalesData = calculateMonthlySalesData();

  const navItems: { id: "dashboard" | "products" | "offers" | "users" | "orders"; label: string; icon: any }[] = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "products", label: "Products", icon: Package },
    { id: "offers", label: "Offer Management", icon: TrendingUp },
    { id: "users", label: "Users", icon: Users },
    { id: "orders", label: "Orders", icon: ShoppingBag },
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // For preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to Cloudinary
      uploadImageToCloudinary(file);
    }
  };

  const uploadImageToCloudinary = async (file: File) => {
    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append("file", file);
    cloudinaryFormData.append("upload_preset", "Electromart");

    try {
      const response = await fetch(
        "https://api.cloudinary.com/v1_1/dsqgbqinh/image/upload",
        {
          method: "POST",
          body: cloudinaryFormData,
        }
      );

      const data = await response.json();
      if (data.secure_url) {
        setFormData({ ...formData, image: data.secure_url });
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  const handleAddProduct = async () => {
    if (formData.name && formData.category && formData.price && formData.stock) {
      const productData = {
        name: formData.name,
        category: formData.category,
        price: parseInt(formData.price),
        stock: parseInt(formData.stock),
        rating: 4.5,
        sales: 0,
        image: formData.image,
        offer: formData.offer?.isActive ? {
          isActive: formData.offer.isActive,
          discountPercentage: formData.offer.discountPercentage,
          endDate: formData.offer.endDate,
          description: formData.offer.description
        } : null
      };

      try {
        if (editingProduct) {
          // Update existing product
          const productRef = doc(db, "products", editingProduct.id);
          await updateDoc(productRef, productData);
          setEditingProduct(null);
        } else {
          // Add new product
          await addDoc(collection(db, "products"), productData);
        }

        // Reset form
        setFormData({ name: "", category: "", price: "", stock: "", image: "", offer: { isActive: false, discountPercentage: 0, endDate: "", description: "" } });
        setImagePreview(null);
        setShowProductForm(false);
      } catch (error) {
        console.error("Error saving product: ", error);
      }
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      stock: product.stock.toString(),
      image: product.image || "",
      offer: product.offer || { isActive: false, discountPercentage: 0, endDate: "", description: "" }
    });
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, "products", id));
      setProducts(products.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Error deleting product: ", error);
    }
  };

  // Fetch products from Firestore
  useEffect(() => {
    const productsQuery = query(collection(db, "products"), orderBy("name"));
    const unsubscribe = onSnapshot(productsQuery, (querySnapshot) => {
      const productsData: Product[] = [];
      querySnapshot.forEach((doc) => {
        const productData = doc.data();
        productsData.push({
          id: doc.id,
          name: productData.name,
          category: productData.category,
          price: productData.price,
          stock: productData.stock,
          rating: productData.rating || 4.5,
          sales: productData.sales || Math.floor(Math.random() * 100), // Generate random sales if not set
          image: productData.image || "",
          offer: productData.offer || undefined
        } as Product);
      });
      setProducts(productsData);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Simulate increasing sales over time
  useEffect(() => {
    const interval = setInterval(() => {
      setProducts(prevProducts => 
        prevProducts.map(product => ({
          ...product,
          sales: product.sales + Math.floor(Math.random() * 5) // Randomly increase sales
        }))
      );
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Fetch real orders and calculate revenue
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const ordersQuery = query(collection(db, "orders"));
        const ordersSnapshot = await getDocs(ordersQuery);
        const ordersData: any[] = [];
        let totalRev = 0;
        
        ordersSnapshot.forEach((doc) => {
          const orderData = doc.data();
          ordersData.push({
            id: doc.id,
            ...orderData,
          });
          totalRev += orderData.totalAmount || 0;
        });
        
        setRealOrders(ordersData);
        setRealRevenue(totalRev);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, []);

  // Fetch real users from Firestore
  useEffect(() => {
    // Fetch users from the 'users' collection in Firestore
    const usersQuery = query(collection(db, "users"), orderBy("joinDate", "desc"));
    const unsubscribe = onSnapshot(usersQuery, (querySnapshot) => {
      const usersData: User[] = [];
      
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        usersData.push({
          id: doc.id,
          name: userData.name || 'N/A',
          email: userData.email || 'N/A',
          joinDate: userData.joinDate || new Date().toISOString().split('T')[0],
          totalOrders: userData.totalOrders || 0,
          totalSpent: userData.totalSpent || 0,
        });
      });
      
      setUsers(usersData);
    }, (error) => {
      console.error("Error fetching users:", error);
      // Fallback to empty array
      setUsers([]);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Fetch orders for the orders tab with real-time updates
  useEffect(() => {
    const ordersQuery = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(ordersQuery, (querySnapshot) => {
      const ordersData: Order[] = [];
      
      querySnapshot.forEach((doc) => {
        const orderData = doc.data();
        // Extract customer name from deliveryAddress or customer field
        let customerName = 'N/A';
        if (orderData.deliveryAddress && orderData.deliveryAddress.name) {
          customerName = orderData.deliveryAddress.name;
        } else if (orderData.customer) {
          if (typeof orderData.customer === 'object' && orderData.customer.name) {
            customerName = orderData.customer.name;
          } else if (typeof orderData.customer === 'string') {
            customerName = orderData.customer;
          }
        }
        
        // Extract items count and details
        let itemsCount = 0;
        let itemsDetails = [];
        if (Array.isArray(orderData.products)) {
          itemsCount = orderData.products.length;
          itemsDetails = orderData.products.slice(0, 3); // Show first 3 items
        } else if (Array.isArray(orderData.items)) {
          itemsCount = orderData.items.length;
          itemsDetails = orderData.items.slice(0, 3); // Show first 3 items
        }
        
        ordersData.push({
          id: doc.id,
          orderId: doc.id,
          customer: customerName,
          date: orderData.createdAt ? 
            new Date(orderData.createdAt.seconds * 1000).toLocaleDateString() : 
            'N/A',
          amount: orderData.totalAmount || 0,
          status: orderData.orderStatus || orderData.status || 'pending',
          items: itemsCount,
          products: itemsDetails,
          userId: orderData.userId,
          paymentId: orderData.paymentId,
          paymentStatus: orderData.paymentStatus,
          deliveryAddress: orderData.deliveryAddress,
          statusTimeline: orderData.statusTimeline,
          createdAt: orderData.createdAt,
        });
      });
      
      setOrders(ordersData);
    }, (error) => {
      console.error("Error fetching orders for tab:", error);
      // Fallback to empty array
      setOrders([]);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Fetch products with offers for the offers tab
  const [offerProducts, setOfferProducts] = useState<Product[]>([]);

  useEffect(() => {
    const productsQuery = query(collection(db, "products"));
    const unsubscribe = onSnapshot(productsQuery, (querySnapshot) => {
      const productsData: Product[] = [];
      querySnapshot.forEach((doc) => {
        const productData = doc.data();
        productsData.push({
          id: doc.id,
          name: productData.name,
          category: productData.category,
          price: productData.price,
          stock: productData.stock,
          rating: productData.rating || 4.5,
          sales: productData.sales || 0,
          image: productData.image || "",
          offer: productData.offer || undefined
        } as Product);
      });
      setOfferProducts(productsData);
    });

    return () => unsubscribe();
  }, []);

  // Toggle offer status for a product
  const toggleOfferStatus = async (productId: string, currentOffer: any) => {
    try {
      const productRef = doc(db, "products", productId);
      const newOfferStatus = !currentOffer?.isActive;
      
      await updateDoc(productRef, {
        "offer.isActive": newOfferStatus
      });
      
      alert(`Offer ${newOfferStatus ? 'activated' : 'deactivated'} successfully!`);
    } catch (error) {
      console.error("Error updating offer status:", error);
      alert("Failed to update offer status");
    }
  };

  // Update offer details for a product
  const updateOfferDetails = async (productId: string, offerData: any) => {
    try {
      const productRef = doc(db, "products", productId);
      
      // Validate offer data
      if (offerData.discountPercentage < 1 || offerData.discountPercentage > 99) {
        alert("Discount percentage must be between 1 and 99");
        return;
      }
      
      if (!offerData.endDate) {
        alert("Please select an end date for the offer");
        return;
      }
      
      const endDate = new Date(offerData.endDate);
      const today = new Date();
      if (endDate < today) {
        alert("End date must be in the future");
        return;
      }
      
      await updateDoc(productRef, {
        offer: {
          ...offerData,
          isActive: offerData.isActive !== undefined ? offerData.isActive : true
        }
      });
      
      alert("Offer updated successfully!");
    } catch (error) {
      console.error("Error updating offer:", error);
      alert("Failed to update offer");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "shipped":
      case "SHIPPED":
        return "bg-blue-100 text-blue-800";
      case "processing":
      case "PACKED":
        return "bg-yellow-100 text-yellow-800";
      case "pending":
      case "ORDER_PLACED":
        return "bg-gray-100 text-gray-800";
      case "CONFIRMED":
        return "bg-purple-100 text-purple-800";
      case "OUT_FOR_DELIVERY":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-900">
        <div className="max-w-7xl mx-auto flex gap-6 p-4 sm:p-8">
          {/* Sidebar */}
          <div className="w-64 bg-gray-800 rounded-lg shadow-xl p-6 h-fit sticky top-20">
            <h3 className="text-xl font-bold text-white mb-6">Admin Panel</h3>

            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setShowProductForm(false);
                      setEditingProduct(null);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                      activeTab === item.id
                        ? "bg-primary text-white shadow-lg"
                        : "text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Dashboard Tab */}
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">
                    Dashboard
                  </h1>
                  <p className="text-gray-400">
                    Welcome to ElectroMart Admin Dashboard
                  </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-br from-primary to-primary-dark rounded-lg shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-primary-foreground/80 text-sm mb-1">
                          Total Revenue
                        </p>
                        <p className="text-3xl font-bold">
                          ₹{(totalRevenue / 100000).toFixed(2)}L
                        </p>
                      </div>
                      <DollarSign className="w-12 h-12 opacity-30" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-neon-orange to-orange-600 rounded-lg shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/80 text-sm mb-1">
                          Total Orders
                        </p>
                        <p className="text-3xl font-bold">{totalOrders}</p>
                      </div>
                      <ShoppingBag className="w-12 h-12 opacity-30" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-lg shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/80 text-sm mb-1">
                          Total Products
                        </p>
                        <p className="text-3xl font-bold">{totalProducts}</p>
                      </div>
                      <Grid className="w-12 h-12 opacity-30" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/80 text-sm mb-1">
                          Total Users
                        </p>
                        <p className="text-3xl font-bold">{totalUsers}</p>
                      </div>
                      <Users className="w-12 h-12 opacity-30" />
                    </div>
                  </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Sales Chart */}
                  <div className="bg-gray-800 rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-bold text-white mb-4">
                      Monthly Sales & Revenue
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={monthlySalesData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis stroke="#999" />
                        <YAxis stroke="#999" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#333",
                            border: "1px solid #555",
                            borderRadius: "8px",
                          }}
                        />
                        <Legend />
                        <Bar
                          dataKey="sales"
                          fill="#007BFF"
                          name="Orders"
                          radius={[8, 8, 0, 0]}
                        />
                        <Bar
                          dataKey="revenue"
                          fill="#FF9900"
                          name="Revenue"
                          radius={[8, 8, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Category Distribution */}
                  <div className="bg-gray-800 rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-bold text-white mb-4">
                      Product Category Distribution
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name} ${value}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Revenue Trend */}
                <div className="bg-gray-800 rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-bold text-white mb-4">
                    Revenue Trend
                  </h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlySalesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis stroke="#999" />
                      <YAxis stroke="#999" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#333",
                          border: "1px solid #555",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#FF9900"
                        strokeWidth={3}
                        dot={{ fill: "#FF9900", r: 5 }}
                        activeDot={{ r: 7 }}
                        name="Revenue (₹)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Products Tab */}
            {activeTab === "products" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-3xl font-bold text-white">
                    Products Management
                  </h1>
                  <button
                    onClick={() => {
                      setShowProductForm(!showProductForm);
                      setEditingProduct(null);
                      setFormData({
                        name: "",
                        category: "",
                        price: "",
                        stock: "",
                        image: "",
                        offer: { isActive: false, discountPercentage: 0, endDate: "", description: "" }
                      });
                    }}
                    className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-all"
                  >
                    <Plus className="w-5 h-5" />
                    Add Product
                  </button>
                </div>

                {/* Product Form */}
                {showProductForm && (
                  <div className="bg-gray-800 rounded-lg shadow-lg p-6">
                    <h3 className="text-xl font-bold text-white mb-4">
                      {editingProduct ? "Edit Product" : "Add New Product"}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-300 font-semibold mb-2">
                          Product Name
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          placeholder="Enter product name"
                          className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 font-semibold mb-2">
                          Category
                        </label>
                        <select
                          value={formData.category}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              category: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="">Select Category</option>
                          <option value="Arduino">Arduino</option>
                          <option value="Sensors">Sensors</option>
                          <option value="Modules">Modules</option>
                          <option value="Robotics">Robotics</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-300 font-semibold mb-2">
                          Price (₹)
                        </label>
                        <input
                          type="number"
                          value={formData.price}
                          onChange={(e) =>
                            setFormData({ ...formData, price: e.target.value })
                          }
                          placeholder="Enter price"
                          className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 font-semibold mb-2">
                          Stock
                        </label>
                        <input
                          type="number"
                          value={formData.stock}
                          onChange={(e) =>
                            setFormData({ ...formData, stock: e.target.value })
                          }
                          placeholder="Enter stock quantity"
                          className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-gray-300 font-semibold mb-2">
                          Product Image
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg outline-none focus:ring-2 focus:ring-primary"
                        />
                        {imagePreview && (
                          <div className="mt-3">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="w-32 h-32 object-cover rounded-lg"
                            />
                          </div>
                        )}
                      </div>
                      
                      {/* Offer Section */}
                      <div className="md:col-span-2 border-t border-gray-600 pt-4 mt-4">
                        <h3 className="text-lg font-bold text-white mb-4">Limited Time Offer</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="offerActive"
                              checked={formData.offer?.isActive || false}
                              onChange={(e) => 
                                setFormData({
                                  ...formData,
                                  offer: {
                                    ...formData.offer,
                                    isActive: e.target.checked
                                  }
                                })
                              }
                              className="w-4 h-4 text-primary bg-gray-700 border-gray-600 rounded focus:ring-primary"
                            />
                            <label htmlFor="offerActive" className="ml-2 text-gray-300">
                              Activate Limited Time Offer
                            </label>
                          </div>
                          
                          {formData.offer?.isActive && (
                            <>
                              <div>
                                <label className="block text-gray-300 font-semibold mb-2">
                                  Discount Percentage (%)
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  max="99"
                                  value={formData.offer?.discountPercentage || 0}
                                  onChange={(e) => 
                                    setFormData({
                                      ...formData,
                                      offer: {
                                        ...formData.offer,
                                        discountPercentage: parseInt(e.target.value) || 0
                                      }
                                    })
                                  }
                                  placeholder="Enter discount percentage"
                                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg outline-none focus:ring-2 focus:ring-primary"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-gray-300 font-semibold mb-2">
                                  Offer End Date
                                </label>
                                <input
                                  type="date"
                                  value={formData.offer?.endDate || ""}
                                  onChange={(e) => 
                                    setFormData({
                                      ...formData,
                                      offer: {
                                        ...formData.offer,
                                        endDate: e.target.value
                                      }
                                    })
                                  }
                                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg outline-none focus:ring-2 focus:ring-primary"
                                />
                              </div>
                              
                              <div className="md:col-span-2">
                                <label className="block text-gray-300 font-semibold mb-2">
                                  Offer Description
                                </label>
                                <input
                                  type="text"
                                  value={formData.offer?.description || ""}
                                  onChange={(e) => 
                                    setFormData({
                                      ...formData,
                                      offer: {
                                        ...formData.offer,
                                        description: e.target.value
                                      }
                                    })
                                  }
                                  placeholder="e.g., Special Festival Offer, Big Exhibition Event"
                                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg outline-none focus:ring-2 focus:ring-primary"
                                />
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={handleAddProduct}
                        className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-6 rounded-lg transition-all"
                      >
                        {editingProduct ? "Update Product" : "Add Product"}
                      </button>
                      {(activeTab as string) === "offers" && editingProduct && (
                        <button
                          onClick={() => {
                            if (editingProduct) {
                              updateOfferDetails(editingProduct.id, formData.offer);
                            }
                          }}
                          className="bg-neon-orange hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg transition-all"
                        >
                          Update Offer
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setShowProductForm(false);
                          setEditingProduct(null);
                          setFormData({
                            name: "",
                            category: "",
                            price: "",
                            stock: "",
                            image: "",
                            offer: { isActive: false, discountPercentage: 0, endDate: "", description: "" }
                          });
                        }}
                        className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Products Table */}
                <div className="bg-gray-800 rounded-lg shadow-lg overflow-x-auto">
                  <table className="w-full text-left text-gray-300">
                    <thead className="bg-gray-700 text-white">
                      <tr>
                        <th className="px-6 py-4 font-bold">Name</th>
                        <th className="px-6 py-4 font-bold">Category</th>
                        <th className="px-6 py-4 font-bold">Price</th>
                        <th className="px-6 py-4 font-bold">Stock</th>
                        <th className="px-6 py-4 font-bold">Rating</th>
                        <th className="px-6 py-4 font-bold">Sales</th>
                        <th className="px-6 py-4 font-bold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr
                          key={product.id}
                          className="border-t border-gray-700 hover:bg-gray-700 transition-colors"
                        >
                          <td className="px-6 py-4">{product.name}</td>
                          <td className="px-6 py-4">
                            <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm">
                              {product.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-semibold">
                            ₹{product.price}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                product.stock > 100
                                  ? "bg-green-500/20 text-green-300"
                                  : product.stock > 0
                                    ? "bg-yellow-500/20 text-yellow-300"
                                    : "bg-red-500/20 text-red-300"
                              }`}
                            >
                              {product.stock}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="flex items-center gap-1">
                              ⭐ {product.rating}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="flex items-center gap-1">
                              <TrendingUp className="w-4 h-4 text-neon-orange" />
                              {product.sales}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditProduct(product)}
                                className="bg-blue-500 hover:bg-blue-600 p-2 rounded-lg transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product.id)}
                                className="bg-red-500 hover:bg-red-600 p-2 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Offers Management Tab */}
            {activeTab === "offers" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-3xl font-bold text-white">
                    Offer Management
                  </h1>
                  <button
                    onClick={() => {
                      setShowProductForm(!showProductForm);
                      setEditingProduct(null);
                      setFormData({
                        name: "",
                        category: "",
                        price: "",
                        stock: "",
                        image: "",
                        offer: {
                          isActive: true,
                          discountPercentage: 20,
                          endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days from now
                          description: "Limited Time Special Offer"
                        }
                      });
                      setShowProductForm(true);
                    }}
                    className="bg-neon-orange hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-all"
                  >
                    <Plus className="w-5 h-5" />
                    Create New Offer
                  </button>
                </div>

                <div className="bg-gray-800 rounded-lg shadow-lg overflow-x-auto">
                  <table className="w-full text-left text-gray-300">
                    <thead className="bg-gray-700 text-white">
                      <tr>
                        <th className="px-6 py-4 font-bold">Product</th>
                        <th className="px-6 py-4 font-bold">Current Price</th>
                        <th className="px-6 py-4 font-bold">Offer Status</th>
                        <th className="px-6 py-4 font-bold">Discount</th>
                        <th className="px-6 py-4 font-bold">End Date</th>
                        <th className="px-6 py-4 font-bold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {offerProducts.map((product) => (
                        <tr
                          key={product.id}
                          className="border-t border-gray-700 hover:bg-gray-700 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {product.image && (
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="w-10 h-10 object-cover rounded"
                                />
                              )}
                              <div>
                                <div className="font-semibold">{product.name}</div>
                                <div className="text-sm text-gray-400">{product.category}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-semibold">₹{product.price}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                product.offer?.isActive
                                  ? "bg-green-500/20 text-green-300"
                                  : "bg-gray-500/20 text-gray-300"
                              }`}
                            >
                              {product.offer?.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {product.offer?.discountPercentage ? (
                              <span className="font-semibold text-neon-orange">
                                {product.offer.discountPercentage}%
                              </span>
                            ) : (
                              "N/A"
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {product.offer?.endDate ? (
                              <span
                                className={
                                  new Date(product.offer.endDate) < new Date()
                                    ? "text-red-400"
                                    : "text-gray-300"
                                }
                              >
                                {new Date(product.offer.endDate).toLocaleDateString()}
                              </span>
                            ) : (
                              "N/A"
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  const newStatus = !product.offer?.isActive;
                                  toggleOfferStatus(product.id, product.offer);
                                }}
                                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                  product.offer?.isActive
                                    ? "bg-red-500 hover:bg-red-600"
                                    : "bg-green-500 hover:bg-green-600"
                                } text-white`}
                              >
                                {product.offer?.isActive ? "Deactivate" : "Activate"}
                              </button>
                              <button
                                onClick={() => {
                                  // Set the current product as editing product and show form
                                  setEditingProduct(product);
                                  setFormData({
                                    name: product.name,
                                    category: product.category,
                                    price: product.price.toString(),
                                    stock: product.stock.toString(),
                                    image: product.image || "",
                                    offer: product.offer || {
                                      isActive: false,
                                      discountPercentage: 0,
                                      endDate: "",
                                      description: ""
                                    }
                                  });
                                  setShowProductForm(true);
                                }}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                              >
                                Edit Offer
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
              <div className="space-y-6">
                <h1 className="text-3xl font-bold text-white">
                  Users Management
                </h1>

                <div className="bg-gray-800 rounded-lg shadow-lg overflow-x-auto">
                  <table className="w-full text-left text-gray-300">
                    <thead className="bg-gray-700 text-white">
                      <tr>
                        <th className="px-6 py-4 font-bold">Name</th>
                        <th className="px-6 py-4 font-bold">Email</th>
                        <th className="px-6 py-4 font-bold">Join Date</th>
                        <th className="px-6 py-4 font-bold">Orders</th>
                        <th className="px-6 py-4 font-bold">Total Spent</th>
                        <th className="px-6 py-4 font-bold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr
                          key={user.id}
                          className="border-t border-gray-700 hover:bg-gray-700 transition-colors"
                        >
                          <td className="px-6 py-4 font-semibold">
                            {user.name}
                          </td>
                          <td className="px-6 py-4 text-sm">{user.email}</td>
                          <td className="px-6 py-4">{user.joinDate}</td>
                          <td className="px-6 py-4">
                            <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm">
                              {user.totalOrders}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-semibold">
                            ₹{user.totalSpent}
                          </td>
                          <td className="px-6 py-4">
                            <button className="bg-blue-500 hover:bg-blue-600 p-2 rounded-lg transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div className="space-y-6">
                <h1 className="text-3xl font-bold text-white">
                  Orders Management
                </h1>

                <div className="bg-gray-800 rounded-lg shadow-lg overflow-x-auto">
                  <table className="w-full text-left text-gray-300">
                    <thead className="bg-gray-700 text-white">
                      <tr>
                        <th className="px-6 py-4 font-bold">Order ID</th>
                        <th className="px-6 py-4 font-bold">Customer</th>
                        <th className="px-6 py-4 font-bold">Items</th>
                        <th className="px-6 py-4 font-bold">Date</th>
                        <th className="px-6 py-4 font-bold">Amount</th>
                        <th className="px-6 py-4 font-bold">Status</th>
                        <th className="px-6 py-4 font-bold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr
                          key={order.id}
                          className="border-t border-gray-700 hover:bg-gray-700 transition-colors"
                        >
                          <td className="px-6 py-4 font-semibold text-primary">
                            {order.id.substring(0, 8)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium">{String(order.customer)}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <span className="bg-gray-700 px-2 py-1 rounded-full text-xs">
                                {order.items} items
                              </span>
                              {order.products && order.products.length > 0 && (
                                <div className="text-xs text-gray-400 mt-1">
                                  {order.products.map((product: any, index: number) => (
                                    <div key={index}>
                                      {product.quantity}x {product.name}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {order.date}
                          </td>
                          <td className="px-6 py-4 font-semibold">
                            ₹{order.amount}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${getStatusColor(order.status)}`}
                            >
                              {order.status.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="bg-blue-500 hover:bg-blue-600 p-2 rounded-lg transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Order Details Modal */}
                {selectedOrder && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
                      <h2 className="text-2xl font-bold text-white mb-4">
                        Order Details
                      </h2>
                      <div className="space-y-3 text-gray-300">
                        <p>
                          <span className="font-semibold">Order ID:</span>{" "}
                          {selectedOrder.orderId || selectedOrder.id}
                        </p>
                        <p>
                          <span className="font-semibold">Customer:</span>{" "}
                          {String(selectedOrder.customer)}
                        </p>
                        <p>
                          <span className="font-semibold">Date:</span>{" "}
                          {selectedOrder.date}
                        </p>
                        <p>
                          <span className="font-semibold">Amount:</span> ₹
                          {selectedOrder.amount}
                        </p>
                        <p>
                          <span className="font-semibold">Items:</span>{" "}
                          {selectedOrder.items}
                        </p>
                        <p>
                          <span className="font-semibold">Status:</span>{" "}
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold capitalize ${getStatusColor(selectedOrder.status)}`}
                          >
                            {selectedOrder.status.replace(/_/g, ' ')}
                          </span>
                        </p>
                        
                        {/* Items List */}
                        {selectedOrder.products && selectedOrder.products.length > 0 && (
                          <div className="pt-4 border-t border-gray-700">
                            <h3 className="font-bold text-white mb-2">Items</h3>
                            <div className="space-y-2">
                              {selectedOrder.products.map((product: any, index: number) => (
                                <div key={index} className="flex justify-between text-sm">
                                  <span>{product.quantity}x {product.name}</span>
                                  <span>₹{product.price * product.quantity}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Status Update */}
                        <div className="pt-4 border-t border-gray-700">
                          <h3 className="font-bold text-white mb-2">Update Status</h3>
                          <div className="grid grid-cols-2 gap-2">
                            {["ORDER_PLACED", "CONFIRMED", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"].map((status) => (
                              <button
                                key={status}
                                onClick={async () => {
                                  try {
                                    // Update the order in Firestore
                                    const orderRef = doc(db, "orders", selectedOrder.id);
                                    const newTimelineEntry = {
                                      status: status,
                                      timestamp: new Date()
                                    };
                                    
                                    await updateDoc(orderRef, {
                                      orderStatus: status,
                                      statusTimeline: selectedOrder.statusTimeline 
                                        ? [...selectedOrder.statusTimeline, newTimelineEntry]
                                        : [newTimelineEntry]
                                    });
                                    
                                    // Update the local state
                                    const updatedOrder = { 
                                      ...selectedOrder, 
                                      status: status as Order['status'],
                                      statusTimeline: selectedOrder.statusTimeline 
                                        ? [...selectedOrder.statusTimeline, newTimelineEntry]
                                        : [newTimelineEntry]
                                    };
                                    setSelectedOrder(updatedOrder);
                                    
                                    // Update the orders list
                                    setOrders(orders.map(order => 
                                      order.id === selectedOrder.id ? updatedOrder : order
                                    ) as Order[]);
                                    
                                    alert(`Order status updated to ${status.replace(/_/g, ' ')}`);
                                  } catch (error) {
                                    console.error("Error updating order status:", error);
                                    alert("Failed to update order status");
                                  }
                                }}
                                className={`py-2 px-3 rounded text-sm font-medium transition-colors ${
                                  selectedOrder.status === status
                                    ? "bg-primary text-white"
                                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                }`}
                              >
                                {status.replace(/_/g, " ")}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedOrder(null)}
                        className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-2 rounded-lg mt-6 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
