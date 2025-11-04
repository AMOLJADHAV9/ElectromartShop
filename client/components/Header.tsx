import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Search, Menu, X, LogOut, User, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useCart } from "@/contexts/CartContext";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [productsMenuOpen, setProductsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const { totalItems } = useCart();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return unsubscribe;
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setUserMenuOpen(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Mock product suggestions - in a real app, this would come from Firestore
  const getSuggestions = (term: string) => {
    const suggestions = [
      { id: "1", name: "DHT11 Temperature & Humidity Sensor", category: "Sensors" },
      { id: "2", name: "Arduino Uno R3", category: "Arduino Boards" },
      { id: "3", "name": "HC-SR04 Ultrasonic Sensor", category: "Sensors" },
      { id: "4", name: "ESP32 Development Board", category: "Modules" },
      { id: "5", name: "L298N Motor Driver", category: "Actuators" },
      { id: "6", name: "PIR Motion Sensor", category: "Sensors" },
      { id: "7", name: "NodeMCU ESP8266", category: "Modules" },
      { id: "8", name: "Servo Motor SG90", category: "Actuators" },
    ];

    if (!term) return [];
    return suggestions.filter(item => 
      item.name.toLowerCase().includes(term.toLowerCase()) ||
      item.category.toLowerCase().includes(term.toLowerCase())
    );
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term.length > 1) {
      const results = getSuggestions(term);
      setSearchResults(results);
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm) {
      navigate(`/products?search=${searchTerm}`);
      setShowSearchResults(false);
      setSearchTerm("");
    }
  };

  // Product categories for mega menu
  const productCategories = [
    {
      name: "Environmental Sensors",
      items: ["Temperature & Humidity", "Air Quality", "Light Sensors", "Sound Sensors"],
      icon: "🌡️"
    },
    {
      name: "Motion Sensors",
      items: ["PIR Sensors", "Ultrasonic Sensors", "Accelerometers", "Gyroscopes"],
      icon: "📡"
    },
    {
      name: "Actuators",
      items: ["Servo Motors", "Stepper Motors", "Relays", "Solenoids"],
      icon: "⚙️"
    },
    {
      name: "Communication Modules",
      items: ["Bluetooth Modules", "WiFi Modules", "RF Modules", "NFC Modules"],
      icon: "📶"
    }
  ];

  return (
    <header className="bg-gray-900 border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Top Bar - Logo and Main Navigation */}
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-dark rounded flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <span className="text-xl font-bold text-white hidden sm:inline">
              ElectroMart
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className="text-white hover:text-accent font-medium transition-colors"
            >
              Home
            </Link>
            <div className="relative">
              <button
                onMouseEnter={() => setProductsMenuOpen(true)}
                onMouseLeave={() => setProductsMenuOpen(false)}
                className="flex items-center gap-1 text-white hover:text-accent font-medium transition-colors"
              >
                Products
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {/* Mega Menu */}
              {productsMenuOpen && (
                <div 
                  onMouseEnter={() => setProductsMenuOpen(true)}
                  onMouseLeave={() => setProductsMenuOpen(false)}
                  className="absolute top-full left-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 w-[800px]"
                >
                  <div className="grid grid-cols-2 gap-8 p-6">
                    {productCategories.map((category) => (
                      <div key={category.name}>
                        <h3 className="flex items-center gap-2 text-lg font-bold text-accent mb-3">
                          <span>{category.icon}</span>
                          {category.name}
                        </h3>
                        <ul className="space-y-2">
                          {category.items.map((item) => (
                            <li key={item}>
                              <Link 
                                to={`/products?category=${encodeURIComponent(item)}`}
                                className="text-gray-300 hover:text-white transition-colors"
                              >
                                {item}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors md:hidden"
            >
              <Search className="w-5 h-5 text-white" />
            </button>

            {/* User Menu */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <User className="w-5 h-5 text-accent" />
                  <span className="text-sm font-medium text-white max-w-[150px] truncate">
                    {currentUser.email}
                  </span>
                </button>

                {userMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50 min-w-[200px]">
                    <div className="px-4 py-3 border-b border-gray-700">
                      <p className="text-xs text-gray-400">Logged in as</p>
                      <p className="text-sm font-semibold text-white truncate">
                        {currentUser.email}
                      </p>
                    </div>
                    <Link
                      to="/orders"
                      className="block w-full text-left px-4 py-2 text-white hover:bg-gray-700 transition-colors text-sm font-medium"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      My Orders
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-900/20 transition-colors flex items-center gap-2 text-sm font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden sm:block text-accent font-medium hover:text-yellow-300 transition-colors"
              >
                Login
              </Link>
            )}

            {/* Cart Icon */}
            <Link
              to="/cart"
              className="relative p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ShoppingCart className="w-6 h-6 text-white" />
              {totalItems > 0 && (
                <span className="absolute top-1 right-1 bg-accent text-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors md:hidden"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-white" />
              ) : (
                <Menu className="w-6 h-6 text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Search Bar - Desktop */}
        <div className="hidden md:flex items-center gap-3 pb-4 relative" ref={searchRef}>
          <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center bg-gray-800 rounded-lg px-4 py-2">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for part numbers (e.g., DHT11, Uno R3)..."
              className="bg-transparent w-full ml-2 outline-none text-white placeholder-gray-400"
              value={searchTerm}
              onChange={handleSearch}
            />
          </form>
          <select className="px-4 py-2 bg-gray-800 rounded-lg text-white font-medium outline-none border border-gray-700">
            <option className="bg-gray-800">All Categories</option>
            <option className="bg-gray-800">Arduino</option>
            <option className="bg-gray-800">Sensors</option>
            <option className="bg-gray-800">Modules</option>
            <option className="bg-gray-800">Robotics</option>
          </select>
          
          {/* Search Suggestions Dropdown */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 mt-1 max-h-60 overflow-y-auto">
              {searchResults.map((result) => (
                <div 
                  key={result.id}
                  onClick={() => {
                    navigate(`/products/${result.id}`);
                    setSearchTerm("");
                    setShowSearchResults(false);
                  }}
                  className="px-4 py-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-b-0"
                >
                  <div className="font-medium text-white">{result.name}</div>
                  <div className="text-sm text-gray-400">{result.category}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-700">
            <nav className="flex flex-col gap-3 pt-4">
              <Link
                to="/"
                className="text-white hover:text-accent font-medium transition-colors px-2 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/products"
                className="text-white hover:text-accent font-medium transition-colors px-2 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Products
              </Link>
            </nav>

            {/* Mobile Search */}
            {searchOpen && (
              <div className="mt-4 flex items-center bg-gray-800 rounded-lg px-4 py-2">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="bg-transparent w-full ml-2 outline-none text-white"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}