
import { motion } from "framer-motion";
import {
  fadeUp,
  viewportSettings,
} from "./homeAnimations";

const ShoppingExperienceSection = () => {
  return (
    <section className="bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-[1240px] px-5 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportSettings}
          >
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-sky-600">
              Made for your customers
            </p>

            <h2 className="mt-4 text-4xl font-extrabold leading-[1.12] tracking-[-0.045em] text-[#102b50] sm:text-5xl">
              Shopping should feel simple from the first click.
            </h2>

            <p className="mt-6 max-w-[470px] leading-7 text-slate-600">
              Give customers a clear way to explore your products,
              understand what they're buying and place their orders
              from the devices they already use.
            </p>

            <div className="mt-8 border-l-2 border-sky-500 pl-5">
              <p className="text-lg font-semibold leading-7 text-[#102b50]">
                A smoother shopping experience helps customers focus
                on what matters: finding what they love.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={viewportSettings}
            transition={{ duration: 0.75 }}
            className="grid grid-cols-[1.15fr_0.85fr] items-center gap-4 sm:gap-6"
          >
            <div className="overflow-hidden rounded-[26px]">
              <img
                src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1100&q=85"
                alt="Fashion model wearing a modern outfit"
                loading="lazy"
                decoding="async"
                className="h-[390px] w-full object-cover transition-transform duration-700 hover:scale-105 sm:h-[510px]"
              />
            </div>

            <div className="space-y-4 sm:space-y-6">
              <div className="overflow-hidden rounded-[22px]">
                <img
                  src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=85"
                  alt="Red sneaker product photograph"
                  loading="lazy"
                  decoding="async"
                  className="h-[180px] w-full object-cover transition-transform duration-700 hover:scale-105 sm:h-[240px]"
                />
              </div>

              <div className="overflow-hidden rounded-[22px]">
                <img
                  src="https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=85"
                  alt="Camera product photograph"
                  loading="lazy"
                  decoding="async"
                  className="h-[180px] w-full object-cover transition-transform duration-700 hover:scale-105 sm:h-[240px]"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ShoppingExperienceSection;
