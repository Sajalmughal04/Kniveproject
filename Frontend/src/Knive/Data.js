import knife1a from "../assets/knife1.jpg";
import knife1b from "../assets/knife1.jpg";
import knife1c from "../assets/knife1.jpg";

import knife2a from "../assets/knife2.jpg";
import knife2b from "../assets/knife2.jpg";
import knife2c from "../assets/knife2.jpg";

import knife3a from "../assets/knife3.jpg";
import knife3b from "../assets/knife3.jpg";
import knife3c from "../assets/knife3.jpg";

import knife4a from "../assets/knife4.jpg";
import knife5a from "../assets/knife5.jpg";
import knife6a from "../assets/knife6.jpg";
import knife7a from "../assets/knife7.jpg";

export const knives = [
  {
    id: 1,
    name: "Chef’s Elite Knife",
    price: 8900,
    currency: "Rs.",
    images: [knife1a, knife1b, knife1c],
    descriptions: [
      [
        "Premium Japanese stainless steel blade.",
        "Full Length: 8.5\"",
        "Blade Length: 4\"",
        "Handle: Ergonomic wooden handle.",
        "Perfect for precision slicing and dicing.",
      ],
      [
        "Mirror-polished blade for a professional finish.",
        "Full Tang construction for strength.",
        "Anti-slip grip handle design.",
        "Ideal for home chefs and professionals alike.",
      ],
      [
        "High-carbon edge for long-lasting sharpness.",
        "Resistant to corrosion and stains.",
        "Balanced weight for comfortable control.",
        "Includes blade protector sheath.",
      ],
    ],
    category: "bestselling",
  },
  {
    id: 2,
    name: "Tactical Survival Knife",
    price: 12000,
    currency: "Rs.",
    images: [knife2a, knife2b, knife2c],
    descriptions: [
      [
        "Built for outdoor survival and adventure.",
        "Full Length: 9.5\" | Blade: 5\"",
        "Handle: Textured ABS grip for extra hold.",
        "Includes sheath and neck cord.",
      ],
      [
        "Matte black tactical design with serrated edge.",
        "Durable carbon steel construction.",
        "Lanyard hole for easy carry.",
        "Weather-resistant sheath included.",
      ],
      [
        "Lightweight and perfectly balanced.",
        "Ideal for camping, hiking, and rescue tasks.",
        "Military-grade coating for durability.",
        "Non-slip tactical handle.",
      ],
    ],
    category: "featured",
  },
  {
    id: 3,
    name: "Classic Kitchen Knife",
    price: 6900,
    currency: "Rs.",
    images: [knife3a, knife3b, knife3c],
    descriptions: [
      [
        "Perfect everyday knife for home cooking.",
        "Full Length: 8\" | Blade: 3.5\"",
        "Ergonomic plastic handle with firm grip.",
        "Dishwasher safe and rust-resistant.",
      ],
      [
        "Ultra-sharp stainless steel edge.",
        "Easy to maintain and lightweight.",
        "Designed for chopping vegetables and meat.",
        "Balanced for easy control.",
      ],
      [
        "Smooth edge blade with precision cut.",
        "Heat-treated for long life.",
        "Comfortable hold for long use.",
        "Ideal for home kitchens.",
      ],
    ],
    category: "toprated",
  },
  {
    id: 4,
    name: "Professional Butcher Knife",
    price: 9900,
    currency: "Rs.",
    images: [knife4a],
    descriptions: [
      [
        "Heavy-duty design for professional use.",
        "Full Tang construction with strong blade.",
        "Perfect for cutting large meat pieces.",
        "Wooden handle for a traditional grip.",
        "Comes with blade guard.",
      ],
    ],
    category: "bestselling",
  },
  {
    id: 5,
    name: "Premium Damascus Knife",
    price: 15000,
    currency: "Rs.",
    images: [knife5a],
    descriptions: [
      [
        "Damascus steel pattern with razor-sharp edge.",
        "Full Length: 8.7\" | Blade: 4.2\"",
        "Ergonomic resin handle with steel bolster.",
        "Each knife has a unique forged texture.",
        "Ideal for collectors and chefs.",
      ],
    ],
    category: "featured",
  },
  {
    id: 6,
    name: "Compact Utility Knife",
    price: 5900,
    currency: "Rs.",
    images: [knife6a],
    descriptions: [
      [
        "Lightweight all-purpose kitchen knife.",
        "Full Length: 7\" | Blade: 3.2\"",
        "ABS handle with anti-slip design.",
        "Perfect for cutting fruits and veggies.",
        "Dishwasher safe.",
      ],
    ],
    category: "toprated",
  },
  {
    id: 7,
    name: "Outdoor Hunting Knife",
    price: 11000,
    currency: "Rs.",
    images: [knife7a],
    descriptions: [
      [
        "Designed for outdoor use and survival.",
        "Full Length: 9.2\" | Blade: 4.8\"",
        "Handle: Textured rubber grip.",
        "Includes leather sheath and belt loop.",
        "Perfect for camping and field use.",
      ],
    ],
    category: "bestselling",
  },
];
