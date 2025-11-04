import Layout from "@/components/Layout";
import { ArrowRight, AlertCircle, CheckCircle, Shield } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Check if user is already logged in
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return unsubscribe;
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (!email || !password) {
        setError("Please fill in all fields");
        setLoading(false);
        return;
      }

      await signInWithEmailAndPassword(auth, email, password);
      setSuccess("Login successful! Redirecting...");
      setTimeout(() => navigate("/"), 1500);
    } catch (err: any) {
      console.error("Login error:", err);
      if (err.code === "auth/user-not-found") {
        setError("Email not found. Please register first.");
      } else if (err.code === "auth/wrong-password") {
        setError("Incorrect password. Please try again.");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email address.");
      } else {
        setError(err.message || "Failed to login. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (!email || !password || !confirmPassword) {
        setError("Please fill in all fields");
        setLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match");
        setLoading(false);
        return;
      }

      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        setLoading(false);
        return;
      }

      await createUserWithEmailAndPassword(auth, email, password);
      setSuccess("Account created successfully! Redirecting...");
      setTimeout(() => navigate("/"), 1500);
    } catch (err: any) {
      console.error("Registration error:", err);
      if (err.code === "auth/email-already-in-use") {
        setError("Email already registered. Please login instead.");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email address.");
      } else if (err.code === "auth/weak-password") {
        setError("Password is too weak. Use at least 6 characters.");
      } else {
        setError(err.message || "Failed to register. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setError("");
      setSuccess("");
    } catch (err: any) {
      setError("Failed to logout. Please try again.");
    }
  };

  // If user is logged in, show logout option
  if (currentUser) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-900 py-16 px-4">
          <div className="max-w-md mx-auto">
            <div className="bg-gray-800 rounded-xl shadow-lg p-8">
              <div className="flex items-center justify-center gap-3 mb-8">
                <div className="w-12 h-12 bg-green-900/30 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-white text-center mb-4">
                Welcome Back!
              </h2>

              <div className="bg-green-900/20 border border-green-900/30 rounded-lg p-4 mb-6">
                <p className="text-green-400 font-medium">
                  Logged in as:
                </p>
                <p className="text-green-300 text-sm break-all">
                  {currentUser.email}
                </p>
              </div>

              <button
                onClick={handleLogout}
                className="w-full bg-red-900/30 hover:bg-red-800/50 text-red-300 font-bold py-3 rounded-lg transition-all duration-300 border border-red-900/50"
              >
                Logout
              </button>

              <div className="mt-6 text-center">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 text-accent hover:text-yellow-300 font-semibold transition-colors"
                >
                  Back to Home
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-900 py-16 px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-gray-800 rounded-xl shadow-lg p-8">
            {/* Logo */}
            <div className="flex items-center justify-center gap-2 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <span className="text-2xl font-bold text-white">ElectroMart</span>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-900/20 border border-red-900/30 rounded-lg p-4 mb-6 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-900/20 border border-green-900/30 rounded-lg p-4 mb-6 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-green-300 text-sm">{success}</p>
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-gray-700">
              <button
                onClick={() => {
                  setIsLogin(true);
                  setError("");
                  setSuccess("");
                }}
                className={`flex-1 py-3 font-semibold text-center border-b-2 transition-colors ${
                  isLogin
                    ? "border-accent text-accent"
                    : "border-transparent text-gray-400"
                }`}
              >
                Login
              </button>
              <button
                onClick={() => {
                  setIsLogin(false);
                  setError("");
                  setSuccess("");
                }}
                className={`flex-1 py-3 font-semibold text-center border-b-2 transition-colors ${
                  !isLogin
                    ? "border-accent text-accent"
                    : "border-transparent text-gray-400"
                }`}
              >
                Register
              </button>
            </div>

            {/* Login Form */}
            {isLogin ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-white font-semibold mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-accent text-white placeholder-gray-400"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-white font-semibold mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-accent text-white placeholder-gray-400"
                    disabled={loading}
                  />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded bg-gray-700 border-gray-600 text-accent focus:ring-accent" disabled={loading} />
                    <span className="text-gray-300">Remember me</span>
                  </label>
                  <a href="#" className="text-accent hover:text-yellow-300">
                    Forgot Password?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-accent text-black font-bold py-3 rounded-lg hover:bg-yellow-300 transition-all duration-300 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Logging in..." : "Login"}
                </button>

                <div className="relative text-center">
                  <span className="bg-gray-800 px-2 text-gray-400 relative z-10">
                    or
                  </span>
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-700"></div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="w-full border-2 border-gray-700 text-white font-bold py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Continue as Guest
                </button>
              </form>
            ) : (
              /* Register Form */
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-white font-semibold mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-accent text-white placeholder-gray-400"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-white font-semibold mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-accent text-white placeholder-gray-400"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-white font-semibold mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-accent text-white placeholder-gray-400"
                    disabled={loading}
                  />
                </div>

                <label className="flex items-start gap-2">
                  <input type="checkbox" className="rounded bg-gray-700 border-gray-600 text-accent focus:ring-accent mt-1" disabled={loading} />
                  <span className="text-gray-300 text-sm">
                    I agree to the Terms of Service and Privacy Policy
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-accent text-black font-bold py-3 rounded-lg hover:bg-yellow-300 transition-all duration-300 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </button>
              </form>
            )}

            {/* Footer Links */}
            <div className="mt-6 text-center space-y-3">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-accent hover:text-yellow-300 font-semibold transition-colors"
              >
                Back to Home
                <ArrowRight className="w-4 h-4" />
              </Link>
              <div className="text-gray-400">or</div>
              <Link
                to="/admin-login"
                className="inline-flex items-center gap-2 text-accent hover:text-yellow-300 font-semibold transition-colors"
              >
                Admin Login
                <Shield className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}