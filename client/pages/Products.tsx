import Layout from "@/components/Layout";
import { ArrowRight, Search, Filter, X } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import ProductCard from "@/components/ProductCard";

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [filters, setFilters] = useState({
    compatibility: [] as string[],
    function: [] as string[],
    brand: [] as string[],
    priceRange: "" as string,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [searchParams] = useSearchParams();

  // Initialize from URL params
  useEffect(() => {
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    if (search) setSearchTerm(search);
    if (category) setSelectedCategory(category);
  }, [searchParams]);

  // Fetch products from Firestore
  useEffect(() => {
    const productsQuery = query(collection(db, "products"), orderBy("name"));
    const unsubscribe = onSnapshot(productsQuery, (querySnapshot) => {
      const productsData: any[] = [];
      querySnapshot.forEach((doc) => {
        const productData = doc.data();
        productsData.push({
          id: doc.id,
          name: productData.name,
          price: productData.price,
          category: productData.category,
          image: productData.image || "https://images.pexels.com/photos/3568521/pexels-photo-3568521.jpeg", // Fallback image
          // Map Firestore fields to ProductCard props
          originalPrice: productData.price * 1.2, // Example: 20% higher original price
          rating: productData.rating || 4.5,
          reviews: productData.sales || 0,
          description: productData.description || "",
          inStock: (productData.stock || 0) > 0,
        });
      });
      setProducts(productsData);
      setFilteredProducts(productsData);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Filter products based on search term, category, and filters
  useEffect(() => {
    let result = products;
    
    // Text search
    if (searchTerm) {
      result = result.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Category filter
    if (selectedCategory) {
      result = result.filter(product => 
        product.category === selectedCategory
      );
    }
    
    // Compatibility filter
    if (filters.compatibility.length > 0) {
      result = result.filter(product => 
        filters.compatibility.some(comp => 
          product.name.toLowerCase().includes(comp.toLowerCase()) ||
          product.description?.toLowerCase().includes(comp.toLowerCase())
        )
      );
    }
    
    // Function filter
    if (filters.function.length > 0) {
      result = result.filter(product => 
        filters.function.some(func => 
          product.name.toLowerCase().includes(func.toLowerCase()) ||
          product.description?.toLowerCase().includes(func.toLowerCase())
        )
      );
    }
    
    // Brand filter
    if (filters.brand.length > 0) {
      result = result.filter(product => 
        filters.brand.some(brand => 
          product.name.toLowerCase().includes(brand.toLowerCase())
        )
      );
    }
    
    // Price range filter
    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split("-").map(Number);
      result = result.filter(product => {
        if (max) {
          return product.price >= min && product.price <= max;
        } else {
          return product.price >= min;
        }
      });
    }
    
    setFilteredProducts(result);
  }, [searchTerm, selectedCategory, filters, products]);

  // Get unique categories
  const categories = [...new Set(products.map(product => product.category))];

  // Filter options
  const compatibilityOptions = ["Arduino", "Raspberry Pi", "ESP32", "ESP8266"];
  const functionOptions = ["Distance", "Temperature", "Humidity", "Motor", "Light", "Sound"];
  const brandOptions = ["Generic", "Adafruit", "SparkFun", "Seeed Studio"];
  const priceRanges = [
    { label: "Under ₹500", value: "0-500" },
    { label: "₹500 - ₹1000", value: "500-1000" },
    { label: "₹1000 - ₹2000", value: "1000-2000" },
    { label: "Over ₹2000", value: "2000-" },
  ];

  // Toggle filter options
  const toggleFilter = (filterType: keyof typeof filters, value: string) => {
    setFilters(prev => {
      const currentValues = [...prev[filterType]];
      const index = currentValues.indexOf(value);
      
      if (index >= 0) {
        currentValues.splice(index, 1);
      } else {
        currentValues.push(value);
      }
      
      return {
        ...prev,
        [filterType]: currentValues
      };
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      compatibility: [],
      function: [],
      brand: [],
      priceRange: "",
    });
    setSearchTerm("");
    setSelectedCategory("");
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-900 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              Our Products
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Discover our wide range of electronic components and modules
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Filter Sidebar - Desktop */}
            <div className="hidden lg:block w-64 flex-shrink-0">
              <div className="bg-gray-800 rounded-xl shadow-lg p-6 sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Filters</h2>
                  <button 
                    onClick={clearFilters}
                    className="text-sm text-accent hover:text-yellow-300"
                  >
                    Clear All
                  </button>
                </div>

                {/* Search */}
                <div className="mb-6">
                  <h3 className="font-semibold text-white mb-3">Search</h3>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-accent text-white placeholder-gray-400"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <div className="mb-6">
                  <h3 className="font-semibold text-white mb-3">Category</h3>
                  <select
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-accent text-white"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="" className="bg-gray-700">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category} className="bg-gray-700">
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Compatibility Filter */}
                <div className="mb-6">
                  <h3 className="font-semibold text-white mb-3">Compatibility</h3>
                  <div className="space-y-2">
                    {compatibilityOptions.map((option) => (
                      <label key={option} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.compatibility.includes(option)}
                          onChange={() => toggleFilter("compatibility", option)}
                          className="rounded bg-gray-700 border-gray-600 text-accent focus:ring-accent"
                        />
                        <span className="ml-2 text-gray-300">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Function Filter */}
                <div className="mb-6">
                  <h3 className="font-semibold text-white mb-3">Function</h3>
                  <div className="space-y-2">
                    {functionOptions.map((option) => (
                      <label key={option} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.function.includes(option)}
                          onChange={() => toggleFilter("function", option)}
                          className="rounded bg-gray-700 border-gray-600 text-accent focus:ring-accent"
                        />
                        <span className="ml-2 text-gray-300">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Brand Filter */}
                <div className="mb-6">
                  <h3 className="font-semibold text-white mb-3">Brand</h3>
                  <div className="space-y-2">
                    {brandOptions.map((option) => (
                      <label key={option} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.brand.includes(option)}
                          onChange={() => toggleFilter("brand", option)}
                          className="rounded bg-gray-700 border-gray-600 text-accent focus:ring-accent"
                        />
                        <span className="ml-2 text-gray-300">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range Filter */}
                <div>
                  <h3 className="font-semibold text-white mb-3">Price Range</h3>
                  <div className="space-y-2">
                    {priceRanges.map((range) => (
                      <label key={range.value} className="flex items-center">
                        <input
                          type="radio"
                          name="priceRange"
                          checked={filters.priceRange === range.value}
                          onChange={() => setFilters(prev => ({ ...prev, priceRange: range.value }))}
                          className="bg-gray-700 border-gray-600 text-accent focus:ring-accent"
                        />
                        <span className="ml-2 text-gray-300">{range.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Mobile Filter Button */}
              <div className="lg:hidden mb-6">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 bg-gray-800 text-white font-medium py-2 px-4 rounded-lg"
                >
                  <Filter className="w-5 h-5" />
                  Filters
                </button>
              </div>

              {/* Mobile Filter Sidebar */}
              {showFilters && (
                <div className="lg:hidden fixed inset-0 z-50">
                  <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)}></div>
                  <div className="absolute right-0 top-0 bottom-0 w-80 bg-gray-800 p-6 overflow-y-auto">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-white">Filters</h2>
                      <button 
                        onClick={() => setShowFilters(false)}
                        className="p-2 hover:bg-gray-700 rounded-lg"
                      >
                        <X className="w-5 h-5 text-white" />
                      </button>
                    </div>

                    {/* Search */}
                    <div className="mb-6">
                      <h3 className="font-semibold text-white mb-3">Search</h3>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="Search products..."
                          className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-accent text-white placeholder-gray-400"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Category Filter */}
                    <div className="mb-6">
                      <h3 className="font-semibold text-white mb-3">Category</h3>
                      <select
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-accent text-white"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                      >
                        <option value="" className="bg-gray-700">All Categories</option>
                        {categories.map((category) => (
                          <option key={category} value={category} className="bg-gray-700">
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Compatibility Filter */}
                    <div className="mb-6">
                      <h3 className="font-semibold text-white mb-3">Compatibility</h3>
                      <div className="space-y-2">
                        {compatibilityOptions.map((option) => (
                          <label key={option} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={filters.compatibility.includes(option)}
                              onChange={() => toggleFilter("compatibility", option)}
                              className="rounded bg-gray-700 border-gray-600 text-accent focus:ring-accent"
                            />
                            <span className="ml-2 text-gray-300">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Function Filter */}
                    <div className="mb-6">
                      <h3 className="font-semibold text-white mb-3">Function</h3>
                      <div className="space-y-2">
                        {functionOptions.map((option) => (
                          <label key={option} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={filters.function.includes(option)}
                              onChange={() => toggleFilter("function", option)}
                              className="rounded bg-gray-700 border-gray-600 text-accent focus:ring-accent"
                            />
                            <span className="ml-2 text-gray-300">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Brand Filter */}
                    <div className="mb-6">
                      <h3 className="font-semibold text-white mb-3">Brand</h3>
                      <div className="space-y-2">
                        {brandOptions.map((option) => (
                          <label key={option} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={filters.brand.includes(option)}
                              onChange={() => toggleFilter("brand", option)}
                              className="rounded bg-gray-700 border-gray-600 text-accent focus:ring-accent"
                            />
                            <span className="ml-2 text-gray-300">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Price Range Filter */}
                    <div className="mb-6">
                      <h3 className="font-semibold text-white mb-3">Price Range</h3>
                      <div className="space-y-2">
                        {priceRanges.map((range) => (
                          <label key={range.value} className="flex items-center">
                            <input
                              type="radio"
                              name="priceRange"
                              checked={filters.priceRange === range.value}
                              onChange={() => setFilters(prev => ({ ...prev, priceRange: range.value }))}
                              className="bg-gray-700 border-gray-600 text-accent focus:ring-accent"
                            />
                            <span className="ml-2 text-gray-300">{range.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={clearFilters}
                        className="flex-1 py-2 px-4 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                      >
                        Clear All
                      </button>
                      <button
                        onClick={() => setShowFilters(false)}
                        className="flex-1 py-2 px-4 bg-accent text-black rounded-lg hover:bg-yellow-300 font-semibold"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Search and Filter Bar - Desktop */}
              <div className="hidden lg:flex items-center gap-3 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-accent text-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <select 
                  className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white font-medium outline-none"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="" className="bg-gray-800">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category} className="bg-gray-800">
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Products Grid */}
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} {...product} />
                  ))}
                </div>
              ) : (
                <div className="bg-gray-800 rounded-xl shadow-lg p-12 text-center">
                  <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">🔍</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-4">
                    No products found
                  </h2>
                  <p className="text-gray-400 mb-8">
                    Try adjusting your search or filter criteria
                  </p>
                  <button 
                    onClick={clearFilters}
                    className="inline-flex items-center gap-2 bg-accent text-black font-bold py-3 px-8 rounded-lg hover:bg-yellow-300 transition-all duration-300 hover:shadow-lg active:scale-95"
                  >
                    Clear Filters
                  </button>
                </div>
              )}

              {/* Back to Home */}
              <div className="mt-8 text-center">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 bg-accent text-black font-bold py-3 px-8 rounded-lg hover:bg-yellow-300 transition-all duration-300 hover:shadow-lg active:scale-95"
                >
                  Back to Home
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}