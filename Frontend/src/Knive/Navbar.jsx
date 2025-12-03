import React, { useState, useEffect } from "react";
import {
  Menu,
  X,
  ShoppingCart,
  Search,
  User,
  Sun,
  Moon,
  Heart,
  LogOut,
  Package,
  Settings,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../Redux/slice/authSlice";
import { selectCartCount } from "../Redux/slice/cartSlice";
import { useWishlist } from "./WishlistContext";

const Navbar = ({ setSearchTerm, theme, toggleTheme }) => {
  const cartCount = useSelector(selectCartCount);
  const { wishlistCount } = useWishlist();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth || {});

  const [open, setOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getAvatarColor = (name) => {
    if (!name) return "bg-gray-500";
    const colors = [
      "bg-blue-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
      "bg-orange-500",
      "bg-green-500",
      "bg-red-500",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (location.pathname !== "/shop") navigate("/shop");
  };

  const handleLogout = () => {
    dispatch(logout());
    setShowUserMenu(false);
    setOpen(false);
    navigate('/');
  };

  const menuItems = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <nav
      className={`fixed w-full z-50 top-0 left-0 transition-all duration-500 ${
        scrolled
          ? "backdrop-blur-lg bg-white/90 dark:bg-gray-900/90 shadow-lg border-b border-gray-200 dark:border-gray-800"
          : "bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm"
      }`}
    >
      <div className="container mx-auto flex justify-between items-center px-6 py-4 gap-6">
        {/* Logo */}
        <h1
          onClick={() => navigate("/")}
          className="text-2xl font-extrabold tracking-wide cursor-pointer relative group text-gray-900 dark:text-white"
        >
          Blade<span className="text-yellow-500">Craft</span>
          <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-yellow-500 transition-all group-hover:w-full"></span>
        </h1>

        {/* Search */}
        <div className="hidden md:flex items-center rounded-full px-4 py-2 w-72 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus-within:border-yellow-500 dark:focus-within:border-yellow-500 transition-all">
          <Search className="w-5 h-5 mr-2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            onChange={handleSearch}
            className="bg-transparent outline-none text-sm w-full placeholder-gray-400 text-gray-900 dark:text-white"
          />
        </div>

        {/* Desktop Menu */}
        <ul className="hidden md:flex items-center text-base ml-auto space-x-6">
          {menuItems.map((item) => (
            <li key={item.name} className="relative group">
              <Link 
                to={item.path} 
                className={`font-medium transition-colors ${
                  location.pathname === item.path 
                    ? "text-yellow-500" 
                    : "text-gray-700 dark:text-gray-300 hover:text-yellow-500 dark:hover:text-yellow-500"
                }`}
              >
                {item.name}
              </Link>
              {location.pathname === item.path && (
                <span className="absolute left-0 -bottom-1 w-full h-[2px] bg-yellow-500"></span>
              )}
            </li>
          ))}

          {/* Icons */}
          <li className="flex items-center space-x-3 ml-4">
            {/* ❤️ Wishlist */}
            <button
              onClick={() => navigate("/wishlist")}
              className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-yellow-500 transition-colors" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* 🛒 Cart */}
            <button
              onClick={() => navigate("/cart")}
              className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group"
              aria-label="Shopping cart"
            >
              <ShoppingCart className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-yellow-500 transition-colors" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-yellow-500 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* 👤 User Profile / Login */}
            {isAuthenticated && user ? (
              <div className="relative user-menu-container">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${getAvatarColor(user.name)} text-white font-semibold text-sm hover:ring-2 hover:ring-yellow-500 hover:ring-offset-2 dark:hover:ring-offset-gray-900 transition-all cursor-pointer`}
                  aria-label="User menu"
                >
                  {getInitials(user.name)}
                </button>

                {/* User Dropdown Menu */}
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-3 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                    >
                      {/* User Info Header */}
                      <div className="px-4 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500">
                        <div className="flex items-center space-x-3">
                          <div className={`flex items-center justify-center w-12 h-12 rounded-full ${getAvatarColor(user.name)} text-white font-bold text-lg`}>
                            {getInitials(user.name)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-900 font-semibold truncate">
                              {user.name}
                            </p>
                            <p className="text-gray-700 text-sm truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <Link
                          to="/profile"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center space-x-3 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <User className="w-4 h-4" />
                          <span className="font-medium">My Profile</span>
                        </Link>

                        <Link
                          to="/track-order"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center space-x-3 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Package className="w-4 h-4" />
                          <span className="font-medium">My Orders</span>
                        </Link>

                        <Link
                          to="/wishlist"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center justify-between px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <Heart className="w-4 h-4" />
                            <span className="font-medium">My Wishlist</span>
                          </div>
                          {wishlistCount > 0 && (
                            <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                              {wishlistCount}
                            </span>
                          )}
                        </Link>

                        <Link
                          to="/settings"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center space-x-3 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          <span className="font-medium">Settings</span>
                        </Link>
                      </div>

                      <div className="border-t border-gray-200 dark:border-gray-700 py-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-3 px-4 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full"
                        >
                          <LogOut className="w-4 h-4" />
                          <span className="font-medium">Logout</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group"
                aria-label="Login"
              >
                <User className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-yellow-500 transition-colors" />
              </button>
            )}

            {/* 🌙 / ☀️ Theme */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 text-gray-300 group-hover:text-yellow-500 transition-colors" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700 group-hover:text-yellow-500 transition-colors" />
              )}
            </button>
          </li>
        </ul>

        {/* ⭐⭐⭐ MOBILE ICONS - WISHLIST, CART, THEME ⭐⭐⭐ */}
        <div className="flex md:hidden items-center space-x-2">
          {/* ❤️ Mobile Wishlist */}
          <button
            onClick={() => navigate("/wishlist")}
            className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            aria-label="Wishlist"
          >
            <Heart className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* 🛒 Mobile Cart */}
          <button
            onClick={() => navigate("/cart")}
            className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            aria-label="Shopping cart"
          >
            <ShoppingCart className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-yellow-500 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          {/* 🌙 / ☀️ Mobile Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5 text-gray-300" />
            ) : (
              <Moon className="w-5 h-5 text-gray-700" />
            )}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            aria-label="Toggle mobile menu"
          >
            {open ? (
              <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            )}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white dark:bg-gray-900 shadow-lg overflow-hidden border-t border-gray-200 dark:border-gray-800"
          >
            <div className="px-6 py-4 space-y-4">
              {/* Mobile Search */}
              <div className="flex items-center rounded-full px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <Search className="w-5 h-5 mr-2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  onChange={handleSearch}
                  className="bg-transparent outline-none text-sm w-full placeholder-gray-400 text-gray-900 dark:text-white"
                />
              </div>

              {/* Mobile Menu Items */}
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setOpen(false)}
                  className={`block px-4 py-2.5 rounded-lg font-medium transition-colors ${
                    location.pathname === item.path
                      ? "bg-yellow-500 text-white"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  {item.name}
                </Link>
              ))}

              {/* Mobile User Section */}
              {isAuthenticated && user ? (
                <>
                  <div className="flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full ${getAvatarColor(user.name)} text-white font-bold text-lg`}>
                      {getInitials(user.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {user.name}
                      </p>
                      <p className="text-sm text-gray-700 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setOpen(false)}
                    className="flex items-center space-x-3 px-4 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
                  >
                    <User className="w-5 h-5" />
                    <span className="font-medium">My Profile</span>
                  </Link>

                  <Link
                    to="/track-order"
                    onClick={() => setOpen(false)}
                    className="flex items-center space-x-3 px-4 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
                  >
                    <Package className="w-5 h-5" />
                    <span className="font-medium">My Orders</span>
                  </Link>

                  <Link
                    to="/wishlist"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between px-4 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
                  >
                    <div className="flex items-center space-x-3">
                      <Heart className="w-5 h-5" />
                      <span className="font-medium">My Wishlist</span>
                    </div>
                    {wishlistCount > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2.5 py-1">
                        {wishlistCount}
                      </span>
                    )}
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 px-4 py-2.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-600 dark:text-red-400 w-full"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setOpen(false);
                    navigate("/login");
                  }}
                  className="flex items-center justify-center space-x-2 w-full bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-3 rounded-lg font-semibold transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span>Login / Sign Up</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;