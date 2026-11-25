import { motion } from "framer-motion";
import {
  Store,
  ShieldCheck,
  ChartNoAxesCombined,
} from "lucide-react";
import { fadeUp, staggerContainer, viewportSettings } from "./homeAnimations";

const benefits = [
  {
    icon: Store,
    title: "Your own online store",
    description: "Build a storefront that reflects your brand and puts your products in front of customers.",
  },
  {
    icon: ShieldCheck,
    title: "Payments you can trust",
    description: "Accept customer payments securely through integrated payment services.",
  },
  {
    icon: ChartNoAxesCombined,
    title: "Room to grow",
    description: "Manage orders, follow sales and understand how your business is performing.",
  },
];

const BenefitsSection = () => {
  return (
    <section id="features" className="bg-white py-16 lg:py-20">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewportSettings}
        className="mx-auto grid max-w-[1240px] gap-10 px-5 md:grid-cols-3 md:gap-8 lg:px-8"
      >
        {benefits.map(({ icon: Icon, title, description }, index) => (
          <motion.article
            variants={fadeUp}
            key={title}
            className="group flex gap-5 border-b border-slate-100 pb-8 last:border-0 md:border-b-0 md:border-r md:pb-0 md:pr-7 md:last:border-0"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 transition-all duration-300 group-hover:-translate-y-1 group-hover:bg-sky-100">
              <Icon size={27} strokeWidth={1.9} />
            </div>

            <div>
              <h3 className="text-lg font-bold tracking-tight text-[#102b50]">
                {title}
              </h3>
              <p className="mt-2 max-w-[300px] text-sm leading-6 text-slate-500">
                {description}
              </p>
            </div>
          </motion.article>
        ))}
      </motion.div>
    </section>
  );
};

export default BenefitsSection;
