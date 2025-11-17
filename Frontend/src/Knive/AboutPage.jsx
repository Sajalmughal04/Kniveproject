import React from "react";
import { Award, Users, Target, Star } from "lucide-react";

const AboutPage = () => {
  const stats = [
    { label: "Years of Excellence", value: "15+", icon: Award },
    { label: "Satisfied Customers", value: "10K+", icon: Users },
    { label: "Master Craftsmen", value: "25+", icon: Star },
    { label: "Countries Served", value: "50+", icon: Target },
  ];

  const values = [
    {
      icon: Target,
      title: "Precision Engineering",
      description: "Every blade is forged with meticulous attention to detail, ensuring perfect balance and razor-sharp edges."
    },
    {
      icon: Award,
      title: "Premium Materials",
      description: "We use only the finest high-carbon stainless steel and exotic woods for handles that last a lifetime."
    },
    {
      icon: Users,
      title: "Master Craftsmanship",
      description: "Our team of experienced artisans brings decades of knife-making expertise to every single piece."
    }
  ];

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Hero Section */}
      <div className="relative w-full h-[60vh] flex items-center justify-center bg-black">
        <div className="text-center px-6 max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Crafting Excellence Since 2008
          </h1>
          <p className="text-xl text-gray-300">
            Where tradition meets innovation in every blade
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center p-6 border-2 border-black rounded-lg"
            >
              <stat.icon className="w-10 h-10 mx-auto mb-3 text-black" />
              <h3 className="text-3xl font-bold text-black mb-1">
                {stat.value}
              </h3>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Story Section */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-black">Our Story</h2>
          <div className="w-20 h-1 bg-black mx-auto"></div>
        </div>

        <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
          <p>
            Founded in 2008, BladeCraft emerged from a simple yet powerful vision: to create knives that professionals trust and enthusiasts cherish. What started as a small workshop has grown into an internationally recognized brand.
          </p>
          <p>
            Our master craftsmen combine centuries-old forging techniques with cutting-edge metallurgy to produce blades that are both beautiful and functional. Each knife undergoes rigorous quality testing to ensure it meets our exacting standards.
          </p>
          <p>
            Today, BladeCraft knives are used by Michelin-starred chefs, culinary schools, and home cooks who demand the very best.
          </p>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-black">What Sets Us Apart</h2>
            <div className="w-20 h-1 bg-black mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="p-6 bg-white rounded-lg border-2 border-black"
              >
                <value.icon className="w-10 h-10 text-black mb-4" />
                <h3 className="text-xl font-bold mb-3 text-black">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-black py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Experience the BladeCraft Difference
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of satisfied customers who trust our craftsmanship
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.location.href = "/"}
              className="bg-white text-black font-semibold py-3 px-8 rounded-lg hover:bg-gray-200 transition"
            >
              Explore Collection
            </button>
            <button
              onClick={() => window.location.href = "/contact"}
              className="bg-black text-white font-semibold py-3 px-8 rounded-lg border-2 border-white hover:bg-gray-900 transition"
            >
              Contact Us
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;