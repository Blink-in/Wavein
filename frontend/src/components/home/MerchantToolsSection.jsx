
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import {
  fadeUp,
  viewportSettings,
} from "./homeAnimations";

const tools = [
  "Manage products and inventory",
  "Keep track of customer orders",
  "Receive payments through Paystack",
  "Set delivery zones and fees",
];

const MerchantToolsSection = () => {
  return (
    <section className="overflow-hidden bg-[#f4faff] py-20 lg:py-28">
      <div className="mx-auto grid max-w-[1240px] items-center gap-14 px-5 lg:grid-cols-2 lg:gap-20 lg:px-8">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={viewportSettings}
          transition={{ duration: 0.7 }}
          className="relative min-h-[430px] overflow-hidden rounded-[28px] bg-slate-200 sm:min-h-[560px]"
        >
          <img
            src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=85"
            alt="Organized packages ready for delivery"
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-black/10" />

          <div className="absolute bottom-6 left-6 right-6 rounded-2xl bg-white/95 p-5 shadow-xl backdrop-blur-sm sm:bottom-8 sm:left-8 sm:right-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              The day-to-day
            </p>
            <p className="mt-2 text-xl font-bold text-[#102b50]">
              Your business, organized in one place.
            </p>
          </div>
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportSettings}
        >
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-sky-600">
            More control, less busywork
          </p>

          <h2 className="mt-4 text-4xl font-extrabold leading-[1.12] tracking-[-0.045em] text-[#102b50] sm:text-5xl">
            Running your store shouldn't feel complicated.
          </h2>

          <p className="mt-6 max-w-[520px] leading-7 text-slate-600">
            Keep the important parts of your online business connected.
            From product listings to customer orders, manage your daily
            operations from your merchant dashboard.
          </p>

          <div className="mt-8 space-y-4">
            {tools.map((tool) => (
              <div key={tool} className="flex items-center gap-3">
                <CheckCircle2
                  size={21}
                  className="shrink-0 text-sky-600"
                />
                <span className="text-sm font-medium text-[#29415f] sm:text-base">
                  {tool}
                </span>
              </div>
            ))}
          </div>

          <Link
            to="/register"
            className="group mt-9 inline-flex items-center gap-3 rounded-full bg-sky-500 px-7 py-4 font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-sky-600"
          >
            Start selling
            <ArrowRight
              size={18}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default MerchantToolsSection;
