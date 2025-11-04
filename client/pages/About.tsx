import Layout from "@/components/Layout";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-900 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-12 px-4">
              <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">About ElectroMart</h1>
                <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                  Learn about our mission to provide quality electronics components for makers and engineers worldwide.
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 md:p-12">
              <div className="max-w-3xl mx-auto space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-4">
                    Our Story
                  </h2>
                  <p className="text-gray-300">
                    This is where the story of ElectroMart will be told. Share information about how the company was founded, its mission, and vision.
                  </p>
                </div>

                <div className="bg-gray-700 border-l-4 border-accent p-6 rounded">
                  <p className="text-gray-200 font-medium mb-2">Page sections to implement:</p>
                  <ul className="text-gray-300 space-y-2 list-disc list-inside">
                    <li>Company story and history</li>
                    <li>Mission and vision statement</li>
                    <li>Team members with photos and bios</li>
                    <li>Company values and achievements</li>
                    <li>Why choose us section</li>
                    <li>Contact call-to-action</li>
                  </ul>
                </div>

                <div className="flex gap-4 pt-4">
                  <Link
                    to="/"
                    className="inline-flex items-center gap-2 bg-accent text-black font-bold py-3 px-8 rounded-lg hover:bg-yellow-300 transition-all duration-300 hover:shadow-lg active:scale-95"
                  >
                    Back to Home
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 border-2 border-accent text-accent font-bold py-3 px-8 rounded-lg hover:bg-accent hover:text-black transition-all duration-300"
                  >
                    Contact Us
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}