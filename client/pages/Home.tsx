import { ArrowRight, Zap, Radio, Cpu, Rocket } from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import CategoryCard from "@/components/CategoryCard";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  description: string;
  inStock: boolean;
  offer?: {
    isActive: boolean;
    discountPercentage: number;
    endDate: string;
    description: string;
  };
}

const categoriesData = [
  {
    name: "Arduino Boards",
    icon: "🎛️",
    description: "Uno, Nano, Mega, and more",
    productCount: 24,
    color: "blue" as const,
  },
  {
    name: "Sensors",
    icon: "📡",
    description: "Ultrasonic, IR, DHT11, and more",
    productCount: 45,
    color: "orange" as const,
  },
  {
    name: "Modules",
    icon: "🔌",
    description: "Bluetooth, WiFi, Relay, Motor",
    productCount: 38,
    color: "green" as const,
  },
  {
    name: "Robotics",
    icon: "🤖",
    description: "Kits, Motors, and Wheels",
    productCount: 18,
    color: "purple" as const,
  },
];

const categories = [
  {
    name: "Arduino Boards",
    icon: "🎛️",
    description: "Uno, Nano, Mega, and more",
    productCount: 24,
    color: "blue" as const,
  },
  {
    name: "Sensors",
    icon: "📡",
    description: "Ultrasonic, IR, DHT11, and more",
    productCount: 45,
    color: "orange" as const,
  },
  {
    name: "Modules",
    icon: "🔌",
    description: "Bluetooth, WiFi, Relay, Motor",
    productCount: 38,
    color: "green" as const,
  },
  {
    name: "Robotics",
    icon: "🤖",
    description: "Kits, Motors, and Wheels",
    productCount: 18,
    color: "purple" as const,
  },
];

export default function Home() {
  const [currentOfferIndex, setCurrentOfferIndex] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [offerProducts, setOfferProducts] = useState<any[]>([]); // New state for offer products

  const nextOffer = () => {
    if (offerProducts.length > 0) {
      setCurrentOfferIndex((prev) => (prev + 1) % offerProducts.length);
    }
  };

  const prevOffer = () => {
    if (offerProducts.length > 0) {
      setCurrentOfferIndex(
        (prev) => (prev - 1 + offerProducts.length) % offerProducts.length
      );
    }
  };

  // Fetch products from Firestore
  useEffect(() => {
    const productsQuery = query(collection(db, "products"), orderBy("name"), limit(8));
    const unsubscribe = onSnapshot(productsQuery, (querySnapshot) => {
      const productsData: any[] = [];
      querySnapshot.forEach((doc) => {
        productsData.push({
          id: doc.id,
          ...doc.data(),
          // Map Firestore fields to ProductCard props
          originalPrice: doc.data().price * 1.2, // Example: 20% higher original price
          rating: doc.data().rating || 4.5,
          reviews: doc.data().sales || 0,
          description: doc.data().description || "",
          inStock: (doc.data().stock || 0) > 0,
        });
      });
      setFeaturedProducts(productsData);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Fetch products with active offers
  useEffect(() => {
    const productsQuery = query(collection(db, "products"));
    const unsubscribe = onSnapshot(productsQuery, (querySnapshot) => {
      const offerProductsData: any[] = [];
      const today = new Date();
      
      querySnapshot.forEach((doc) => {
        const productData = doc.data();
        // Check if product has an active offer
        if (productData.offer && productData.offer.isActive) {
          const endDate = new Date(productData.offer.endDate);
          // Check if offer is still valid (not expired)
          if (endDate >= today) {
            offerProductsData.push({
              id: doc.id,
              ...productData,
              // Calculate discounted price
              discountedPrice: productData.price * (1 - productData.offer.discountPercentage / 100),
              originalPrice: productData.price,
              rating: productData.rating || 4.5,
              reviews: productData.sales || 0,
              description: productData.description || "",
              inStock: (productData.stock || 0) > 0,
            });
          }
        }
      });
      
      // If we have offer products, update the state
      if (offerProductsData.length > 0) {
        setOfferProducts(offerProductsData);
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  return (
    <Layout>
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left Side - Text */}
            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
                Your One-Stop Electronics Store
              </h1>
              <p className="text-lg text-gray-300">
                Explore Arduino, Sensors, Modules & More! Everything you need for your electronics projects.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/products"
                  className="bg-accent hover:bg-yellow-300 text-black font-bold py-3 px-8 rounded-lg inline-flex items-center gap-2 transition-all duration-300 hover:shadow-lg active:scale-95"
                >
                  Shop Now
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <button className="border-2 border-accent text-accent hover:bg-accent hover:text-black font-bold py-3 px-8 rounded-lg transition-all duration-300">
                  Learn More
                </button>
              </div>
            </div>

            {/* Right Side - Hero Image */}
            <div className="hidden md:block">
              <img
                src="https://images.pexels.com/photos/3568521/pexels-photo-3568521.jpeg"
                alt="Electronics Store"
                className="w-full rounded-lg shadow-2xl object-cover h-96"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16 sm:py-24 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              Shop by Category
            </h2>
            <p className="text-gray-400 text-lg">
              Explore our wide range of electronic components
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <CategoryCard key={category.name} {...category} />
            ))}
          </div>
        </div>
      </section>

      {/* Limited Time Offers */}
      <section className="py-16 sm:py-24 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-8 text-center">
            Limited Time Offers
          </h2>

          {offerProducts.length > 0 ? (
            <div className="relative">
              {/* Carousel */}
              <div className="relative overflow-hidden rounded-xl">
                <img
                  src={offerProducts[currentOfferIndex]?.image || "https://images.pexels.com/photos/343457/pexels-photo-343457.jpeg"}
                  alt={offerProducts[currentOfferIndex]?.name || "Offer"}
                  className="w-full h-64 sm:h-96 object-cover"
                />

                {/* Overlay Content */}
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white text-center">
                  <h3 className="text-2xl sm:text-4xl font-bold mb-2">
                    {offerProducts[currentOfferIndex]?.offer?.description || "Special Offer"}
                  </h3>
                  <p className="text-lg sm:text-xl mb-4">
                    {offerProducts[currentOfferIndex]?.name}
                  </p>
                  <div className="flex items-center gap-4">
                    <span className="text-2xl sm:text-3xl font-bold text-gray-300 line-through">
                      ₹{offerProducts[currentOfferIndex]?.originalPrice}
                    </span>
                    <div className="text-3xl sm:text-5xl font-bold text-accent">
                      {offerProducts[currentOfferIndex]?.offer?.discountPercentage}%
                    </div>
                    <span className="text-2xl sm:text-3xl font-bold text-white">
                      ₹{offerProducts[currentOfferIndex]?.discountedPrice?.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <button
                onClick={prevOffer}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-charcoal p-3 rounded-full transition-all duration-300 z-10"
                aria-label="Previous offer"
              >
                <ArrowRight className="w-5 h-5 rotate-180" />
              </button>
              <button
                onClick={nextOffer}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-charcoal p-3 rounded-full transition-all duration-300 z-10"
                aria-label="Next offer"
              >
                <ArrowRight className="w-5 h-5" />
              </button>

              {/* Indicators */}
              <div className="flex justify-center gap-2 mt-4">
                {offerProducts.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentOfferIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentOfferIndex ? "bg-accent w-8" : "bg-gray-300"
                    }`}
                    aria-label={`Go to offer ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          ) : (
            // Fallback to original hardcoded offers if no offer products found
            <div className="relative">
              {/* Carousel */}
              <div className="relative overflow-hidden rounded-xl">
                <img
                  src="https://images.pexels.com/photos/343457/pexels-photo-343457.jpeg"
                  alt="Limited Time Offers"
                  className="w-full h-64 sm:h-96 object-cover"
                />
                

                {/* Overlay Content */}
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white text-center">
                  <h3 className="text-2xl sm:text-4xl font-bold mb-2">
                    Limited Time Offers
                  </h3>
                  <p className="text-lg sm:text-xl mb-4">
                    Check back soon for exclusive deals
                  </p>
                  <div className="text-3xl sm:text-5xl font-bold text-accent">
                    Up to 50% Off
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Trending Products */}
      <section className="py-16 sm:py-24 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                Trending Products
              </h2>
              <p className="text-gray-400">
                Most popular items this week
              </p>
            </div>
            <Link
              to="/products"
              className="text-accent font-semibold hover:text-yellow-300 flex items-center gap-2 transition-colors"
            >
              View All
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.slice(0, 8).map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </div>
      </section>

      {/* Educational Content / Blog Section */}
      <section className="py-16 sm:py-24 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              Learn & Build
            </h2>
            <p className="text-gray-400 text-lg">
              Tutorials, projects, and guides to help you master electronics
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Project 1 */}
            <div className="bg-gray-700 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <img
                src="https://images.pexels.com/photos/38644/pexels-photo-38644.jpeg"
                alt="Arduino Project"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <span className="inline-block bg-accent/20 text-accent text-xs px-2 py-1 rounded mb-3">
                  Beginner
                </span>
                <h3 className="text-xl font-bold text-white mb-2">
                  Getting Started with Arduino
                </h3>
                <p className="text-gray-300 mb-4">
                  Learn the basics of Arduino programming and build your first LED blinking project.
                </p>
                <Link
                  to="/blog/arduino-basics"
                  className="text-accent hover:text-yellow-300 font-semibold flex items-center gap-1"
                >
                  Read Tutorial
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Project 2 */}
            <div className="bg-gray-700 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <img
                src="https://images.pexels.com/photos/2589759/pexels-photo-2589759.jpeg"
                alt="Sensor Project"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <span className="inline-block bg-accent/20 text-accent text-xs px-2 py-1 rounded mb-3">
                  Intermediate
                </span>
                <h3 className="text-xl font-bold text-white mb-2">
                  Temperature Monitoring System
                </h3>
                <p className="text-gray-300 mb-4">
                  Build a real-time temperature monitoring system using DHT11 sensor and Arduino.
                </p>
                <Link
                  to="/blog/temperature-monitoring"
                  className="text-accent hover:text-yellow-300 font-semibold flex items-center gap-1"
                >
                  Read Tutorial
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Project 3 */}
            <div className="bg-gray-700 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <img
                src="https://images.pexels.com/photos/2058128/pexels-photo-2058128.jpeg"
                alt="IoT Project"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <span className="inline-block bg-accent/20 text-accent text-xs px-2 py-1 rounded mb-3">
                  Advanced
                </span>
                <h3 className="text-xl font-bold text-white mb-2">
                  Smart Home Automation
                </h3>
                <p className="text-gray-300 mb-4">
                  Create a complete smart home system with ESP32, sensors, and mobile app control.
                </p>
                <Link
                  to="/blog/smart-home"
                  className="text-accent hover:text-yellow-300 font-semibold flex items-center gap-1"
                >
                  Read Tutorial
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 bg-accent text-black font-bold py-3 px-8 rounded-lg hover:bg-yellow-300 transition-all duration-300 hover:shadow-lg"
            >
              View All Tutorials
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 sm:py-24 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-12">
            Why Choose ElectroMart?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Fast Shipping
              </h3>
              <p className="text-gray-400">
                Get your orders delivered within 2-3 business days
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Radio className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Authentic Products
              </h3>
              <p className="text-gray-400">
                100% genuine electronics from trusted brands
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Cpu className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Expert Support
              </h3>
              <p className="text-gray-400">
                Get technical guidance from our experienced team
              </p>
            </div>

            {/* Feature 4 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Rocket className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Best Prices
              </h3>
              <p className="text-gray-400">
                Competitive prices with exclusive discounts
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-16 sm:py-20 border-t border-gray-700">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Subscribe to Our Newsletter
          </h2>
          <p className="text-lg text-gray-300 mb-8">
            Get exclusive deals, product launches, and tech tips delivered to your inbox
          </p>

          <form className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white font-medium outline-none focus:ring-2 focus:ring-accent placeholder-gray-400"
            />
            <button
              type="submit"
              className="bg-accent hover:bg-yellow-300 text-black font-bold py-3 px-8 rounded-lg transition-all duration-300 hover:shadow-lg active:scale-95 whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>

          <p className="text-gray-400 text-sm mt-4">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </section>
    </Layout>
  );
}
