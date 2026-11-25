
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import {
  fadeUp,
  viewportSettings,
} from "./homeAnimations";

const StorefrontShowcaseSection = () => {
  return (
    <section className="overflow-hidden bg-[#f4faff] py-20 lg:py-28">
      <div className="mx-auto max-w-[1240px] px-5 lg:px-8">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportSettings}
          className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end lg:mb-14"
        >
          <div className="max-w-[650px]">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-sky-600">
              Your business, your brand
            </p>

            <h2 className="mt-4 text-4xl font-extrabold leading-[1.12] tracking-[-0.045em] text-[#102b50] sm:text-5xl lg:text-[54px]">
              A store that looks as good as what you sell.
            </h2>
          </div>

          <p className="max-w-[370px] text-base leading-7 text-slate-600">
            Give your products a proper home online. Present your brand,
            showcase your collection and make it easy for customers to shop.
          </p>
        </motion.div>

        <div className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
          {/* Main storefront image */}
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportSettings}
            transition={{ duration: 0.7 }}
            className="group relative min-h-[420px] overflow-hidden rounded-[28px] bg-slate-200 sm:min-h-[540px]"
          >
            <img
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1400&q=85"
              alt="Modern clothing boutique interior"
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            />

            <div className="absolute inset-0 bg-black/35 transition-colors duration-500 group-hover:bg-black/40" />

            <div className="absolute bottom-0 left-0 max-w-[520px] p-7 text-white sm:p-10">
              <p className="text-sm font-medium text-white/80">
                Build your storefront
              </p>

              <h3 className="mt-3 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                Make your first impression count.
              </h3>
            </div>
          </motion.div>

          {/* Right-side showcase */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
            {/* Product image */}
            <motion.div
              initial={{ opacity: 0, x: 25 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={viewportSettings}
              transition={{ duration: 0.65 }}
              className="group relative min-h-[280px] overflow-hidden rounded-[28px] bg-slate-200 lg:min-h-0"
            >
              <img
                src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85"
                alt="Minimal wristwatch product photography"
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-black/20 transition-colors duration-500 group-hover:bg-black/30" />

              <div className="absolute bottom-0 left-0 p-6 text-white">
                <p className="text-sm font-medium text-white/85">
                  Product presentation
                </p>

                <h3 className="mt-2 text-2xl font-bold tracking-tight">
                  Every detail matters.
                </h3>
              </div>
            </motion.div>

            {/* Text and CTA */}
            <motion.div
              initial={{ opacity: 0, x: 25 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={viewportSettings}
              transition={{ duration: 0.65, delay: 0.12 }}
              className="flex min-h-[250px] flex-col justify-between rounded-[28px] bg-white p-7 sm:p-8"
            >
              <div>
                <p className="text-sm font-semibold text-sky-600">
                  Made for your business
                </p>

                <h3 className="mt-4 max-w-[340px] text-2xl font-bold leading-tight tracking-tight text-[#102b50] sm:text-3xl">
                  Your products deserve to be seen.
                </h3>

                <p className="mt-3 max-w-[340px] text-sm leading-6 text-slate-500">
                  Organize your products and give customers a clear way
                  to discover what you offer.
                </p>
              </div>

              <Link
                to="/register"
                className="group/link mt-7 inline-flex w-fit items-center gap-2 font-bold text-sky-600 transition-colors hover:text-sky-700"
              >
                Create your store

                <ArrowUpRight
                  size={18}
                  className="transition-transform duration-300 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5"
                />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StorefrontShowcaseSection;
