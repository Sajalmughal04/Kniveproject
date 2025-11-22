import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, CheckCircle, XCircle } from "lucide-react";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | null
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    setErrorMessage("");

    try {
      // Check if backend is running
      console.log('Sending request to:', 'http://localhost:3000/api/contact');
      console.log('Form data:', formData);

      const response = await fetch('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log('Response:', data);

      if (data.success) {
        setSubmitStatus('success');
        setFormData({ name: "", email: "", message: "" });
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => setSubmitStatus(null), 5000);
      } else {
        setSubmitStatus('error');
        setErrorMessage(data.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error:', error);
      setSubmitStatus('error');
      
      // Specific error messages
      if (error.message === 'Failed to fetch') {
        setErrorMessage('Cannot connect to server. Please make sure backend is running on port 3000.');
      } else {
        setErrorMessage('Failed to send message. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center py-20 px-6 transition-colors duration-500">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-extrabold mb-10 text-gray-900 dark:text-white text-center uppercase tracking-wide"
      >
        Get in Touch
      </motion.h1>

      <div className="flex flex-col md:flex-row gap-10 w-full max-w-5xl">
        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 w-full md:w-1/2"
        >
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            Send Us a Message ✉️
          </h2>

          {/* Success Message */}
          {submitStatus === 'success' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-700 rounded-lg flex items-center gap-2"
            >
              <CheckCircle className="text-green-600 dark:text-green-400" size={20} />
              <p className="text-green-800 dark:text-green-200 text-sm">
                Message sent successfully! We'll get back to you soon.
              </p>
            </motion.div>
          )}

          {/* Error Message */}
          {submitStatus === 'error' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 rounded-lg flex items-start gap-2"
            >
              <XCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <p className="text-red-800 dark:text-red-200 text-sm font-semibold">
                  Failed to send message
                </p>
                <p className="text-red-700 dark:text-red-300 text-xs mt-1">
                  {errorMessage || 'Please try again or contact us directly.'}
                </p>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Your Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Your Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="johndoe@gmail.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Message
              </label>
              <textarea
                name="message"
                placeholder="Write your message..."
                value={formData.message}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 bg-transparent resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
                rows={5}
              />
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={isSubmitting}
              className={`w-full flex items-center justify-center gap-2 ${
                isSubmitting ? "bg-gray-400" : "bg-yellow-500 hover:bg-yellow-400"
              } text-black font-bold py-2 rounded-lg transition`}
            >
              {isSubmitting ? (
                "Sending..."
              ) : (
                <>
                  <Send size={18} /> Send Message
                </>
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Contact Info Card */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 w-full md:w-1/2 flex flex-col justify-center"
        >
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            Contact Information 📍
          </h2>
          <div className="space-y-5">
            <div className="flex items-center gap-3 text-gray-800 dark:text-gray-300">
              <Mail className="text-yellow-500" />
              <a
                href="mailto:support@knifehub.com"
                className="hover:text-yellow-500 transition"
              >
                support@knifehub.com
              </a>
            </div>

            <div className="flex items-center gap-3 text-gray-800 dark:text-gray-300">
              <Phone className="text-yellow-500" />
              <a
                href="tel:+923466170539"
                className="hover:text-yellow-500 transition"
              >
                +92 346 6170539
              </a>
            </div>

            <div className="flex items-start gap-3 text-gray-800 dark:text-gray-300">
              <MapPin className="text-yellow-500 mt-1" />
              <p>Bharoki street, near samma flour mill, basti qudartabad Wazirabad, 52000</p>
            </div>
          </div>

          <div className="mt-10">
            <iframe
              title="map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3247.0000000000005!2d74.11820000000001!3d32.441700000000004!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391ec123456789ab%3A0xcdefabcdefabcdef!2sBharoki+Street%2C+Basti+Qudratabad%2C+Wazirabad%2C+Punjab%2C+Pakistan!5e0!3m2!1sen!2s!4v0000000000000"
              width="100%"
              height="200"
              allowFullScreen=""
              loading="lazy"
              className="rounded-lg border border-gray-300 dark:border-gray-700"
            ></iframe>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ContactPage;