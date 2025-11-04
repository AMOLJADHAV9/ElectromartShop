import Layout from "@/components/Layout";
import { ArrowRight, ShoppingCart, Plus, Minus, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";

export default function Cart() {
  const { items, totalItems, totalAmount, removeFromCart, updateQuantity, checkout } = useCart();
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    pincode: "",
    state: ""
  });

  const handleCheckout = async () => {
    try {
      const customerInfo = {
        name: deliveryAddress.name,
        email: deliveryAddress.email,
        phone: deliveryAddress.phone
      };
      
      await checkout(deliveryAddress, customerInfo);
      alert("Order placed successfully!");
      setShowCheckoutForm(false);
    } catch (error) {
      console.error("Checkout failed:", error);
      alert("Failed to place order. Please try again.");
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDeliveryAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (items.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-900 py-16 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <div className="bg-gray-800 rounded-xl shadow-lg p-12">
              <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingCart className="w-10 h-10 text-accent" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">
                Your Cart is Empty
              </h1>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Looks like you haven't added any items to your cart yet.
              </p>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-accent text-black font-bold py-3 px-8 rounded-lg hover:bg-yellow-300 transition-all duration-300 hover:shadow-lg active:scale-95"
              >
                Continue Shopping
                <ArrowRight className="w-5 h-5" />
              </Link>
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
          <h1 className="text-3xl font-bold text-white mb-8">Shopping Cart</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center p-6 border-b border-gray-700 last:border-b-0">
                    {/* Product Image */}
                    <div className="w-24 h-24 flex-shrink-0 bg-gray-700 rounded-lg overflow-hidden">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Product Info */}
                    <div className="flex-1 ml-4">
                      <h3 className="font-bold text-white">{item.name}</h3>
                      <p className="text-accent font-semibold mt-1">₹{item.price}</p>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center mt-3">
                        <button 
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center border border-gray-600 rounded-l-lg hover:bg-gray-700 text-white"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-12 h-8 flex items-center justify-center border-t border-b border-gray-600 text-white">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center border border-gray-600 rounded-r-lg hover:bg-gray-700 text-white"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        
                        <button 
                          onClick={() => removeFromCart(item.productId)}
                          className="ml-4 text-red-400 hover:text-red-300"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Total Price */}
                    <div className="font-bold text-white">
                      ₹{item.price * item.quantity}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800 rounded-xl shadow-lg p-6 sticky top-8">
                <h2 className="text-xl font-bold text-white mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Subtotal ({totalItems} items)</span>
                    <span className="font-semibold text-white">₹{totalAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Shipping</span>
                    <span className="font-semibold text-white">Free</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Tax</span>
                    <span className="font-semibold text-white">₹{Math.round(totalAmount * 0.18)}</span>
                  </div>
                  <div className="border-t border-gray-700 pt-3 flex justify-between text-lg font-bold">
                    <span className="text-white">Total</span>
                    <span className="text-accent">₹{totalAmount + Math.round(totalAmount * 0.18)}</span>
                  </div>
                </div>
                
                {!showCheckoutForm ? (
                  <button
                    onClick={() => setShowCheckoutForm(true)}
                    className="w-full bg-accent text-black font-bold py-3 rounded-lg hover:bg-yellow-300 transition-all duration-300 hover:shadow-lg active:scale-95"
                  >
                    Proceed to Checkout
                  </button>
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white">Delivery Address</h3>
                    <div className="space-y-3">
                      <input
                        type="text"
                        name="name"
                        placeholder="Full Name"
                        value={deliveryAddress.name}
                        onChange={handleAddressChange}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-accent text-white placeholder-gray-400"
                      />
                      <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={deliveryAddress.email}
                        onChange={handleAddressChange}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-accent text-white placeholder-gray-400"
                      />
                      <input
                        type="text"
                        name="phone"
                        placeholder="Phone Number"
                        value={deliveryAddress.phone}
                        onChange={handleAddressChange}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-accent text-white placeholder-gray-400"
                      />
                      <input
                        type="text"
                        name="address"
                        placeholder="Address"
                        value={deliveryAddress.address}
                        onChange={handleAddressChange}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-accent text-white placeholder-gray-400"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          name="city"
                          placeholder="City"
                          value={deliveryAddress.city}
                          onChange={handleAddressChange}
                          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-accent text-white placeholder-gray-400"
                        />
                        <input
                          type="text"
                          name="pincode"
                          placeholder="Pincode"
                          value={deliveryAddress.pincode}
                          onChange={handleAddressChange}
                          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-accent text-white placeholder-gray-400"
                        />
                      </div>
                      <input
                        type="text"
                        name="state"
                        placeholder="State"
                        value={deliveryAddress.state}
                        onChange={handleAddressChange}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-accent text-white placeholder-gray-400"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={handleCheckout}
                        className="flex-1 bg-accent text-black font-bold py-3 rounded-lg hover:bg-yellow-300 transition-all duration-300 hover:shadow-lg active:scale-95"
                      >
                        Place Order
                      </button>
                      <button
                        onClick={() => setShowCheckoutForm(false)}
                        className="flex-1 bg-gray-700 text-white font-bold py-3 rounded-lg hover:bg-gray-600 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                
                <Link
                  to="/products"
                  className="block text-center mt-4 text-accent hover:text-yellow-300 font-semibold"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}