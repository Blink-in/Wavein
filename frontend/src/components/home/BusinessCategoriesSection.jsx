
import { motion } from "framer-motion";
import {
  fadeUp,
  staggerContainer,
  viewportSettings,
} from "./homeAnimations";

const categories = [
  {
    name: "Fashion",
    description: "Clothing, footwear and accessories",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1000&q=85",
    className: "md:col-span-2",
  },
  {
    name: "Beauty",
    description: "Skincare and beauty products",
    image:
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=85",
    className: "",
  },
  {
    name: "Electronics",
    description: "Gadgets and everyday technology",
    image:
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1000&q=85",
    className: "",
  },
  {
    name: "Lifestyle",
    description: "Home, decor and everyday essentials",
    image:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=85",
    className: "md:col-span-2",
  },
];

const BusinessCategoriesSection = () => {
  return (
    <section className="bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-[1240px] px-5 lg:px-8">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportSettings}
          className="mx-auto mb-12 max-w-[700px] text-center"
        >
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-sky-600">
            One platform, many possibilities
          </p>

          <h2 className="mt-4 text-4xl font-extrabold leading-[1.12] tracking-[-0.045em] text-[#102b50] sm:text-5xl">
            Whatever you sell, there's room for it here.
          </h2>

          <p className="mx-auto mt-5 max-w-[560px] leading-7 text-slate-600">
            From a growing fashion label to a gadget store or beauty
            brand, bring your products together in one place.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportSettings}
          className="grid gap-5 md:grid-cols-3"
        >
          {categories.map((category) => (
            <motion.article
              variants={fadeUp}
              key={category.name}
              className={`group relative min-h-[300px] overflow-hidden rounded-[26px] bg-slate-200 ${category.className}`}
            >
              <img
                src={category.image}
                alt={`${category.name} products`}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

<div className="absolute inset-0 bg-black/30" />

              <div className="absolute bottom-0 left-0 p-7 text-white">
                <h3 className="text-2xl font-bold">{category.name}</h3>
                <p className="mt-1 text-sm text-white/80">
                  {category.description}
                </p>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default BusinessCategoriesSection;
