import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Sample knife images - replace with your actual imports
const img1 = "https://plus.unsplash.com/premium_photo-1723600961498-39c83aacb7e4?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8a25pZmUlMjBraXRjaGVufGVufDB8fDB8fHww&auto=format&fit=crop&q=60&w=500";
const img2 = "https://media.istockphoto.com/id/74411700/photo/chef-chopping-parsley.webp?a=1&b=1&s=612x612&w=0&k=20&c=_B4DZlkwft1Z3CmJsfyTEVwXaTroZRf1kzRyYDZpLZI=";
const img3 = "https://media.istockphoto.com/id/508667869/photo/kitchen-knive-on-cutting-board.webp?a=1&b=1&s=612x612&w=0&k=20&c=qeETP-IWyj7DemFvWUZo5WLMdf6iouw29_yLUp8K9Vc=";

const Hero = () => {
  const images = [img1, img2, img3];
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleShopNow = () => {
    const productsSection = document.getElementById("products-section");
    if (productsSection) productsSection.scrollIntoView({ behavior: "smooth" });
  };

  const features = [
    { label: "Hand Forged", value: "100%" },
    { label: "Premium Steel", value: "VG-10" },
    { label: "Warranty", value: "Lifetime" }
  ];

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Image Slider */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: [0.43, 0.13, 0.23, 0.96] }}
          className="absolute inset-0"
        >
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${images[current]})` }}
          >
            {/* Sophisticated overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Main Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 w-full">
          <div className="max-w-2xl space-y-8">
            {/* Tagline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="inline-block"
            >
              <span className="text-white/60 uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[10px] sm:text-xs font-light border-l-2 border-white/40 pl-3 sm:pl-4">
                Premium Craftsmanship
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-[0.95] tracking-tight"
            >
              The Art of
              <br />
              <span className="italic font-light">Precision</span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-white/70 text-sm sm:text-base md:text-lg max-w-lg leading-relaxed font-light"
            >
              Every blade tells a story of dedication, forged with centuries-old techniques and modern precision engineering.
            </motion.p>

            {/* Features Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 pt-2 sm:pt-4"
            >
              {features.map((feature, index) => (
                <div key={index} className="border-l border-white/20 pl-4">
                  <div className="text-white text-xl md:text-2xl font-semibold">
                    {feature.value}
                  </div>
                  <div className="text-white/50 text-xs uppercase tracking-wider mt-1">
                    {feature.label}
                  </div>
                </div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-6 pt-2 sm:pt-4"
            >
              <button
                onClick={handleShopNow}
                className="group relative bg-white text-black px-8 sm:px-10 py-3 sm:py-4 font-medium overflow-hidden transition-all hover:scale-105 text-sm sm:text-base"
              >
                <span className="relative z-10 group-hover:opacity-0 transition-opacity">
                  Explore Collection
                </span>
                <div className="absolute inset-0 bg-black transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
                <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 text-white transition-opacity duration-500 z-20">
                  Explore Collection →
                </span>
              </button>

              <button
                className="text-white/70 hover:text-white font-light text-xs sm:text-sm uppercase tracking-wider transition-colors py-2 sm:py-0"
                onClick={() => {
                  const about = document.getElementById("about-section");
                  if (about) about.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Learn More
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-12 left-6 md:left-12 lg:left-20 flex flex-col gap-3 z-20">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-1 transition-all duration-500 ${current === index
                ? "h-16 bg-white"
                : "h-8 bg-white/30 hover:bg-white/50"
              }`}
          />
        ))}
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-12 right-6 md:right-12 lg:right-20 z-20"
      >
        <div className="flex flex-col items-center gap-3">
          <span className="text-white/40 text-xs uppercase tracking-widest [writing-mode:vertical-lr]">
            Scroll
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="w-px h-16 bg-gradient-to-b from-white/60 to-transparent"
          />
        </div>
      </motion.div>

      {/* Top border accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent z-20" />
    </div>
  );
};

export default Hero;