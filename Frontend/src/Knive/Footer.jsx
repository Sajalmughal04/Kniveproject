import React from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Youtube } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-black to-gray-900 text-gray-300 mt-20 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-72 h-72 bg-yellow-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-yellow-600 rounded-full blur-3xl"></div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* About Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-2xl font-bold text-white">RZKnives</h2>
            </div>
            <p className="text-gray-400 leading-relaxed text-sm">
              Premium-quality kitchen knives crafted for both professional chefs and home cooks. 
              Sharp, durable, and ergonomic tools that make cooking a pleasure.
            </p>
            
            {/* Social Media Icons */}
            <div className="flex gap-3 pt-4">
              <a href="#" className="w-10 h-10 bg-white/10 hover:bg-yellow-500 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110">
                <Facebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 hover:bg-yellow-500 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 hover:bg-yellow-500 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110">
                <Twitter size={18} />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 hover:bg-yellow-500 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110">
                <Youtube size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-white mb-6 relative inline-block">
              Quick Links
              <span className="absolute -bottom-2 left-0 w-12 h-1 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full"></span>
            </h3>
            <ul className="space-y-3">
              {[
                { to: "/", label: "Home" },
                { to: "/shop", label: "Shop" },
                { to: "/about", label: "About Us" },
                { to: "/contact", label: "Contact" },
                { to: "/faq", label: "FAQs" },
                { to: "/track-order", label: "Track Order" }
              ].map((link) => (
                <li key={link.to}>
                  <Link 
                    to={link.to} 
                    className="text-gray-400 hover:text-yellow-500 transition-all duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-0 h-0.5 bg-yellow-500 group-hover:w-4 transition-all duration-300"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-bold text-white mb-6 relative inline-block">
              Customer Service
              <span className="absolute -bottom-2 left-0 w-12 h-1 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full"></span>
            </h3>
            <ul className="space-y-3">
              {[
                { to: "/profile", label: "My Account" },
                { to: "/cart", label: "Shopping Cart" },
                { to: "/wishlist", label: "Wishlist" },
                { to: "/faq", label: "Help Center" },
                { to: "/contact", label: "Support" }
              ].map((link) => (
                <li key={link.to}>
                  <Link 
                    to={link.to} 
                    className="text-gray-400 hover:text-yellow-500 transition-all duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-0 h-0.5 bg-yellow-500 group-hover:w-4 transition-all duration-300"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="text-lg font-bold text-white mb-6 relative inline-block">
              Get In Touch
              <span className="absolute -bottom-2 left-0 w-12 h-1 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full"></span>
            </h3>
            <div className="space-y-4">
              {/* Email */}
              <a 
                href="mailto:support@knifehub.com?subject=Customer%20Inquiry&body=Hello%20RZKnives%20Team," 
                className="flex items-start gap-3 text-gray-400 hover:text-yellow-500 transition-all duration-300 group cursor-pointer"
                onClick={(e) => {
                  window.location.href = 'mailto:support@knifehub.com';
                }}
              >
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-yellow-500/20 transition-all">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Email</p>
                  <p className="text-sm break-all">support@knifehub.com</p>
                </div>
              </a>

              {/* Phone */}
              <a 
                href="tel:+923466170539" 
                className="flex items-start gap-3 text-gray-400 hover:text-yellow-500 transition-all duration-300 group cursor-pointer"
              >
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-yellow-500/20 transition-all">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Phone</p>
                  <p className="text-sm">+92 346 6170539</p>
                </div>
              </a>

              {/* Address - Google Maps Link */}
              <a 
                href="https://www.google.com/maps?q=32.441700,74.118200"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 text-gray-400 hover:text-yellow-500 transition-all duration-300 group cursor-pointer"
              >
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-yellow-500/20 transition-all">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Address</p>
                  <p className="text-sm leading-relaxed">
                    Bharoki Street, Near Samma Flour Mill<br />
                    Basti Qudartabad, Wazirabad 52000
                  </p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 bg-black/30 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} <span className="text-yellow-500 font-semibold">RZKnives</span>. All Rights Reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <Link to="/privacy" className="text-gray-400 hover:text-yellow-500 transition">Privacy Policy</Link>
              <Link to="/terms" className="text-gray-400 hover:text-yellow-500 transition">Terms of Service</Link>
              <Link to="/returns" className="text-gray-400 hover:text-yellow-500 transition">Returns</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;