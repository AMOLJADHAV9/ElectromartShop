import Layout from "@/components/Layout";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { ShoppingCart, Heart, Star, Truck, Shield, RotateCcw } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating?: number;
  reviews?: number;
  description?: string;
  inStock?: boolean;
  offer?: number;
  tax?: number;
  shippingCharges?: number;
  specifications?: Record<string, string>;
  policies?: string[];
}

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        const productDoc = await getDoc(doc(db, "products", id));
        if (productDoc.exists()) {
          const productData = productDoc.data();
          setProduct({
            id: productDoc.id,
            name: productData.name,
            price: productData.price,
            image: productData.image || "https://images.pexels.com/photos/3568521/pexels-photo-3568521.jpeg",
            category: productData.category,
            rating: productData.rating || 4.5,
            reviews: productData.sales || 0,
            description: productData.description || "",
            inStock: (productData.stock || 0) > 0,
            offer: productData.offer || 0,
            tax: productData.tax || 0,
            shippingCharges: productData.shippingCharges || 0,
            specifications: productData.specifications || undefined,
            policies: productData.policies || undefined,
          });
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-gray-200 rounded-xl h-96"></div>
                  <div>
                    <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6 mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-4/6 mb-8"></div>
                    <div className="h-12 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="h-12 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-16 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <div className="bg-white rounded-xl shadow-lg p-12">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🔍</span>
              </div>
              <h1 className="text-4xl font-bold text-charcoal mb-4">
                Product Not Found
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                The product you're looking for doesn't exist or may have been removed.
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
              {/* Product Image */}
              <div className="flex flex-col">
                <div className="bg-gray-100 rounded-xl overflow-hidden aspect-square flex items-center justify-center">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain p-4"
                  />
                </div>
                
                {/* Thumbnails (if multiple images) */}
                <div className="flex gap-3 mt-4">
                  <div className="bg-gray-100 rounded-lg overflow-hidden w-16 h-16 flex items-center justify-center">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="bg-gray-100 rounded-lg overflow-hidden w-16 h-16 flex items-center justify-center">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="bg-gray-100 rounded-lg overflow-hidden w-16 h-16 flex items-center justify-center">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
              
              {/* Product Details */}
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-sm text-primary font-semibold uppercase tracking-wider">
                      {product.category}
                    </span>
                    <h1 className="text-3xl font-bold text-charcoal mt-1 mb-3">
                      {product.name}
                    </h1>
                  </div>
                  
                  {/* Wishlist Button */}
                  <button
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    <Heart
                      className={`w-6 h-6 transition-colors ${
                        isWishlisted ? "fill-neon-orange text-neon-orange" : "text-gray-600"
                      }`}
                    />
                  </button>
                </div>
                
                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.round(product.rating || 0)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-gray-600">({product.reviews} reviews)</span>
                </div>
                
                {/* Price */}
                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-3xl font-bold text-primary">₹{product.price}</span>
                  {product.originalPrice && (
                    <>
                      <span className="text-xl text-gray-500 line-through">₹{product.originalPrice}</span>
                      {discount > 0 && (
                        <span className="bg-neon-orange text-white text-sm font-bold px-2 py-1 rounded">
                          {discount}% off
                        </span>
                      )}
                    </>
                  )}
                </div>
                
                {/* Description */}
                <p className="text-gray-600 mb-6">
                  {product.description}
                </p>
                
                {/* Stock Status */}
                <div className="mb-6">
                  {product.inStock ? (
                    <span className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      In Stock
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      Out of Stock
                    </span>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <button
                    onClick={() => addToCart({
                      productId: product.id,
                      name: product.name,
                      price: product.price,
                      quantity: 1,
                      image: product.image,
                    })}
                    disabled={!product.inStock}
                    className={`flex-1 py-3 px-6 rounded-lg font-bold flex items-center justify-center gap-3 transition-all duration-300 ${
                      product.inStock
                        ? "bg-primary text-white hover:bg-primary-dark hover:shadow-lg active:scale-95"
                        : "bg-gray-300 text-gray-600 cursor-not-allowed"
                    }`}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </button>
                  
                  <button
                    disabled={!product.inStock}
                    className={`flex-1 py-3 px-6 rounded-lg font-bold flex items-center justify-center gap-3 transition-all duration-300 ${
                      product.inStock
                        ? "bg-neon-orange text-white hover:bg-orange-600 hover:shadow-lg active:scale-95"
                        : "bg-gray-300 text-gray-600 cursor-not-allowed"
                    }`}
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
            
            {/* Product Specifications and Policies */}
            <div className="border-t border-border p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Specifications */}
                <div>
                  <h2 className="text-2xl font-bold text-charcoal mb-6">Specifications</h2>
                  <div className="bg-gray-50 rounded-xl p-6">
                    {product.specifications && Object.keys(product.specifications).length > 0 ? (
                      <dl className="space-y-4">
                        {Object.entries(product.specifications).map(([key, value]) => (
                          <div key={key} className="flex justify-between pb-2 border-b border-gray-200 last:border-0 last:pb-0">
                            <dt className="font-medium text-gray-600">{key}</dt>
                            <dd className="text-charcoal">{value}</dd>
                          </div>
                        ))}
                      </dl>
                    ) : (
                      <p className="text-gray-500">No specifications available for this product.</p>
                    )}
                  </div>
                </div>
                
                {/* Policies */}
                <div>
                  <h2 className="text-2xl font-bold text-charcoal mb-6">Policies</h2>
                  <div className="bg-gray-50 rounded-xl p-6">
                    {product.policies && product.policies.length > 0 ? (
                      <ul className="space-y-3">
                        {product.policies.map((policy, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-primary text-sm font-bold">✓</span>
                            </div>
                            <span className="text-charcoal">{policy}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500">No policies available for this product.</p>
                    )}
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