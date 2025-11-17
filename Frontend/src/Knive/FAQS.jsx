import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const faqsData = [
  {
    question: "How long does delivery take?",
    answer: "Delivery usually takes 3–5 business days depending on your location.",
  },
  {
    question: "Can I return a knife?",
    answer: "Yes, you can return a knife within 14 days of purchase if unused.",
  },
  {
    question: "Are the knives dishwasher safe?",
    answer: "We recommend hand washing only to maintain sharpness and quality.",
  },
  {
    question: "Do you offer international shipping?",
    answer: "Yes, we ship to selected countries. Additional shipping charges may apply.",
  },
  {
    question: "How can I contact support?",
    answer: "You can reach us via email at support@knifehub.com or call +92 346 6170539.",
  },
];

const FAQs = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-16 px-6">
      <h2 className="text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>
      <div className="max-w-4xl mx-auto space-y-4">
        {faqsData.map((faq, index) => (
          <div
            key={index}
            className="bg-white shadow-md rounded-lg p-4 cursor-pointer"
            onClick={() => toggleFAQ(index)}
          >
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg">{faq.question}</h3>
              {openIndex === index ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
            {openIndex === index && (
              <p className="mt-2 text-gray-700">{faq.answer}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQs;
