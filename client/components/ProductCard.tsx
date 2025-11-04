import { ShoppingCart, Heart, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";

interface ProductCardProps {
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
  offer?: {
    isActive: boolean;
    discountPercentage: number;
    endDate: string;
    description: string;
  };
  discountedPrice?: number;
}

export default function ProductCard({
  id,
  name,
  price,
  originalPrice,
  image,
  category,
  rating = 4.5,
  reviews = 0,
  description,
  inStock = true,
  offer,
  discountedPrice,
}: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addToCart } = useCart();

  // Calculate discount based on offer or originalPrice
  const discount = offer?.isActive 
    ? offer.discountPercentage 
    : originalPrice
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;

  // Use discounted price if available
  const displayPrice = discountedPrice || price;
  const displayOriginalPrice = offer?.isActive ? price : originalPrice;

  return (
    <Link to={`/products/${id}`}>
      <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:shadow-lg transition-all duration-300 h-full flex flex-col group">
        {/* Product Image Container */}
        <div className="relative overflow-hidden bg-gray-700 aspect-square flex items-center justify-center">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />

          {/* Discount Badge */}
          {discount > 0 && (
            <div className="absolute top-3 right-3 bg-accent text-black text-sm font-bold px-2 py-1 rounded">
              -{discount}%
            </div>
          )}

          {/* Offer Badge */}
          {offer?.isActive && (
            <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              LIMITED OFFER
            </div>
          )}

          {/* Stock Status */}
          {!inStock && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
              <span className="text-white font-bold text-lg">Out of Stock</span>
            </div>
          )}

          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              setIsWishlisted(!isWishlisted);
            }}
            className="absolute top-3 left-3 p-2 bg-gray-800 rounded-full shadow-md hover:bg-gray-700 transition-colors"
          >
            <Heart
              className={`w-5 h-5 transition-colors ${
                isWishlisted ? "fill-accent text-accent" : "text-gray-300"
              }`}
            />
          </button>
        </div>

        {/* Product Info */}
        <div className="p-4 flex flex-col flex-1">
          {/* Category */}
          <span className="text-xs text-accent font-semibold uppercase tracking-wider mb-1">
            {category}
          </span>

          {/* Product Name */}
          <h3 className="font-bold text-white mb-2 line-clamp-2 group-hover:text-accent transition-colors">
            {name}
          </h3>

          {/* Offer Description */}
          {offer?.isActive && offer.description && (
            <p className="text-xs text-red-400 font-semibold mb-1">
              {offer.description}
            </p>
          )}

          {/* Description */}
          {description && (
            <p className="text-sm text-gray-300 mb-2 line-clamp-2">
              {description}
            </p>
          )}

          {/* Rating */}
          {reviews > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < Math.round(rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-500"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-400">({reviews})</span>
            </div>
          )}

          {/* Technical Specifications Preview */}
          <div className="mb-3">
            <div className="text-xs text-gray-400 flex justify-between">
              <span>Voltage: 5V</span>
              <span>Interface: Digital</span>
            </div>
            <div className="text-xs text-gray-400 flex justify-between">
              <span>Dimensions: 20x15mm</span>
              <span>Brand: Generic</span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-3 mt-auto">
            <span className="text-xl font-bold text-white">₹{displayPrice}</span>
            {displayOriginalPrice && displayPrice !== displayOriginalPrice && (
              <span className="text-sm text-gray-400 line-through">
                ₹{displayOriginalPrice}
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              addToCart({
                productId: id,
                name,
                price: displayPrice,
                quantity: 1,
                image,
              });
            }}
            disabled={!inStock}
            className={`w-full py-2 px-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
              inStock
                ? "bg-accent text-black hover:bg-yellow-300 hover:shadow-lg active:scale-95"
                : "bg-gray-700 text-gray-500 cursor-not-allowed"
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">Add to Cart</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>
    </Link>
  );
}