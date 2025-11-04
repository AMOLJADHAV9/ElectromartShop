import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { loadRazorpay, createRazorpayOrder, processPayment } from "@/lib/razorpay";

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
}

type CartAction =
  | { type: "ADD_TO_CART"; payload: Omit<CartItem, "id"> }
  | { type: "REMOVE_FROM_CART"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { productId: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "LOAD_CART"; payload: CartItem[] };

interface CartContextType extends CartState {
  addToCart: (item: Omit<CartItem, "id">) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  checkout: (deliveryAddress: any, customerInfo: any) => Promise<any>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "LOAD_CART":
      return { ...state, items: action.payload };
    
    case "ADD_TO_CART": {
      const existingItem = state.items.find(
        (item) => item.productId === action.payload.productId
      );
      
      let updatedItems;
      if (existingItem) {
        updatedItems = state.items.map((item) =>
          item.productId === action.payload.productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        updatedItems = [
          ...state.items,
          { ...action.payload, id: Date.now().toString() },
        ];
      }
      
      return {
        ...state,
        items: updatedItems,
        totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
        totalAmount: updatedItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        ),
      };
    }
    
    case "REMOVE_FROM_CART": {
      const updatedItems = state.items.filter(
        (item) => item.productId !== action.payload
      );
      
      return {
        ...state,
        items: updatedItems,
        totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
        totalAmount: updatedItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        ),
      };
    }
    
    case "UPDATE_QUANTITY": {
      const updatedItems = state.items.map((item) =>
        item.productId === action.payload.productId
          ? { ...item, quantity: Math.max(0, action.payload.quantity) }
          : item
      ).filter(item => item.quantity > 0);
      
      return {
        ...state,
        items: updatedItems,
        totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
        totalAmount: updatedItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        ),
      };
    }
    
    case "CLEAR_CART":
      return {
        ...state,
        items: [],
        totalItems: 0,
        totalAmount: 0,
      };
    
    default:
      return state;
  }
};

const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalAmount: 0,
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const addToCart = (item: Omit<CartItem, "id">) => {
    dispatch({ type: "ADD_TO_CART", payload: item });
  };

  const removeFromCart = (productId: string) => {
    dispatch({ type: "REMOVE_FROM_CART", payload: productId });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { productId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  const checkout = async (deliveryAddress: any, customerInfo: any) => {
    if (state.items.length === 0) return;
    
    try {
      // Load Razorpay SDK
      const isRazorpayLoaded = await loadRazorpay();
      if (!isRazorpayLoaded) {
        throw new Error("Failed to load Razorpay SDK");
      }
      
      // Calculate total amount (including tax)
      const totalAmount = state.totalAmount;
      const taxAmount = Math.round(totalAmount * 0.18);
      const finalAmount = totalAmount + taxAmount;
      
      // Create Razorpay order
      const razorpayOrder = await createRazorpayOrder(finalAmount);
      
      // Process payment
      const paymentResponse = await processPayment(razorpayOrder, {
        name: "ElectroMart",
        description: `Order for ${state.totalItems} items`,
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        customerContact: customerInfo.phone,
      });
      
      // If payment is successful, create order in Firestore
      if (paymentResponse) {
        // Create order in Firestore with the new structure
        const order = {
          userId: "current-user-id", // This should be replaced with actual user ID from auth context
          products: state.items.map(item => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image || ""
          })),
          totalAmount: finalAmount,
          paymentId: (paymentResponse as any).razorpay_payment_id,
          paymentStatus: "PAID",
          deliveryAddress: deliveryAddress,
          orderStatus: "ORDER_PLACED",
          statusTimeline: [
            { 
              status: "ORDER_PLACED", 
              timestamp: new Date() 
            }
          ],
          createdAt: serverTimestamp(),
        };
        
        await addDoc(collection(db, "orders"), order);
        
        // Clear cart after successful checkout
        dispatch({ type: "CLEAR_CART" });
        
        return paymentResponse;
      }
    } catch (error) {
      console.error("Error during checkout:", error);
      throw error;
    }
  };

  return (
    <CartContext.Provider
      value={{
        ...state,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        checkout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};