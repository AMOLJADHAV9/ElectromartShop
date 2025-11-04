import Layout from "@/components/Layout";
import { Mail, Phone, MapPin, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function Contact() {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-900 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">
              Contact Us
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Have a question? We're here to help. Get in touch with our team.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Contact Info Cards */}
            <div className="bg-gray-800 rounded-lg shadow-lg p-8 text-center">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Email</h3>
              <p className="text-gray-300">support@electromart.in</p>
            </div>

            <div className="bg-gray-800 rounded-lg shadow-lg p-8 text-center">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Phone</h3>
              <p className="text-gray-300">+91 1234567890</p>
            </div>

            <div className="bg-gray-800 rounded-lg shadow-lg p-8 text-center">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Location</h3>
              <p className="text-gray-300">
                123 Tech Street, Innovation City, IC 12345
              </p>
            </div>
          </div>

          {/* Contact Form and Map */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form */}
            <div className="bg-gray-800 rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-white mb-6">
                Send us a Message
              </h2>

              <div className="bg-gray-700 border-l-4 border-accent p-4 rounded mb-6">
                <p className="text-gray-200">
                  Contact form will include fields for name, email, subject, and message. Form submission will be implemented to send emails.
                </p>
              </div>

              <form className="space-y-4">
                <div>
                  <label className="block text-white font-semibold mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    placeholder="Your Name"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-accent text-white placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-white font-semibold mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-accent text-white placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-white font-semibold mb-2">
                    Message
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Your message..."
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-accent text-white placeholder-gray-400 resize-none"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-accent text-black font-bold py-3 rounded-lg hover:bg-yellow-300 transition-all duration-300 hover:shadow-lg active:scale-95"
                >
                  Send Message
                </button>
              </form>
            </div>

            {/* Map Placeholder */}
            <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <div className="w-full h-full bg-gray-700 flex items-center justify-center p-8">
                <div className="text-center">
                  <MapPin className="w-16 h-16 text-accent mx-auto mb-4 opacity-50" />
                  <p className="text-gray-300 font-medium">
                    Google Map or location map will be embedded here
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Back Link */}
          <div className="text-center mt-12">
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
    </Layout>
  );
}