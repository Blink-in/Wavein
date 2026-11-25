import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import heroimage from "../../assets/images/merchant-hero.png"
import { motion, useReducedMotion } from "framer-motion";

const HeroSection = () => {
  const reduceMotion = useReducedMotion();

  const reveal = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <section className="relative overflow-hidden bg-[#f4faff]">
      <div className="mx-auto grid min-h-[610px] max-w-[1240px] items-center gap-10 px-5 py-16 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-20">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: { staggerChildren: 0.14 },
            },
          }}
          className="relative z-10"
        >
          <motion.h1
            variants={reveal}
            className="max-w-[650px] text-5xl font-extrabold leading-[1.08] tracking-[-0.055em] text-[#102b50] sm:text-6xl lg:text-[68px]"
          >
            Take your business to{" "}
            <span className="text-sky-500">new heights.</span>
          </motion.h1>

          <motion.p
            variants={reveal}
            className="mt-7 max-w-[540px] text-lg leading-8 text-slate-600"
          >
            Create your online store, manage your business and reach more
            customers with Wavebuy.
          </motion.p>

          <motion.div
            variants={reveal}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <Link
              to="/register"
              className="group inline-flex items-center gap-3 rounded-full bg-sky-500 px-8 py-4 font-semibold text-white shadow-lg shadow-sky-200/70 transition-all duration-300 hover:-translate-y-1 hover:bg-sky-600 hover:shadow-xl"
            >
              Create your store
              <ArrowRight
                size={19}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>

            <a
              href="#features"
              className="inline-flex items-center gap-2 rounded-full border border-sky-500 bg-white px-8 py-4 font-semibold text-[#102b50] transition-all duration-300 hover:-translate-y-1 hover:bg-sky-50"
            >
              Explore features
              <ArrowUpRight size={18} />
            </a>
          </motion.div>

          <motion.div
            variants={reveal}
            className="mt-9 flex items-center gap-3 text-sm text-slate-500"
          >
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-sky-100 text-xs font-bold text-sky-700"
                >
                  {item}
                </div>
              ))}
            </div>
            <span>Built for businesses ready to grow</span>
          </motion.div>
        </motion.div>

        <div className="relative mx-auto flex min-h-[420px] w-full max-w-[600px] items-center justify-center lg:min-h-[500px]">
          <motion.div
            animate={
              reduceMotion
                ? {}
                : { y: [0, -13, 0], scale: [1, 1.015, 1] }
            }
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute h-[330px] w-[330px] rounded-full bg-[#d9edff] sm:h-[420px] sm:w-[420px]"
          />

          <img
            src={heroimage}
            alt="Business owner managing an online store on a laptop"
            className="relative z-10 h-auto w-full max-w-[570px] object-contain drop-shadow-[0_24px_35px_rgba(38,105,160,0.13)]"
          />

          <motion.div
            animate={reduceMotion ? {} : { y: [0, -9, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-0 top-[13%] z-20 rounded-2xl border border-white bg-white p-4 shadow-xl shadow-sky-100/70"
          >
            <div className="text-xs font-medium text-slate-500">
              Total revenue
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-xl font-extrabold text-[#102b50]">
                ₦2.45M
              </span>
              <TrendingUp size={18} className="text-emerald-500" />
            </div>
            <div className="mt-1 h-1.5 w-28 overflow-hidden rounded-full bg-sky-100">
              <div className="h-full w-4/5 rounded-full bg-sky-500" />
            </div>
          </motion.div>

          <motion.div
            animate={reduceMotion ? {} : { y: [0, 10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-[15%] right-0 z-20 rounded-2xl border border-white bg-white p-4 shadow-xl shadow-sky-100/70"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                <ShoppingBag size={21} />
              </span>
              <div>
                <div className="text-xs text-slate-500">Total orders</div>
                <div className="text-xl font-extrabold text-[#102b50]">
                  348
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
