import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { ArrowRight } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
        <div className="text-center max-w-md">
          <div className="text-7xl font-bold text-primary mb-4">404</div>
          <h1 className="text-4xl font-bold text-charcoal mb-3">
            Page Not Found
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Sorry, the page you're looking for doesn't exist. Let's get you back on track.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-primary-dark transition-all duration-300 hover:shadow-lg active:scale-95"
          >
            Back to Home
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
