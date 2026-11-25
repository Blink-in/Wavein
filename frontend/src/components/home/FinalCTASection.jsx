import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { fadeUp, viewportSettings } from "./homeAnimations";

const FinalCTASection = () => {
  return (
    <section className="bg-white px-5 py-16 lg:px-8 lg:py-20">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={viewportSettings}
        className="relative mx-auto flex max-w-[1240px] flex-col items-start justify-between gap-8 overflow-hidden rounded-[30px] bg-[#dff1ff] px-8 py-12 sm:px-12 lg:flex-row lg:items-center lg:px-16 lg:py-14"
      >
        <div className="relative z-10 max-w-[580px]">
          <h2 className="text-3xl font-extrabold tracking-tight text-[#102b50] sm:text-4xl">
            Your next chapter starts here.
          </h2>
          <p className="mt-3 text-base leading-7 text-slate-600">
            Give your business the online presence it deserves.
          </p>
        </div>

        <Link
          to="/register"
          className="group relative z-10 inline-flex shrink-0 items-center gap-3 rounded-full bg-sky-500 px-8 py-4 font-bold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-sky-600 hover:shadow-xl hover:shadow-sky-200"
        >
          Get started with Wavebuy
          <ArrowRight
            size={19}
            className="transition-transform group-hover:translate-x-1"
          />
        </Link>

        <div className="pointer-events-none absolute -bottom-28 -left-12 h-64 w-64 rounded-full bg-white/50" />
        <div className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full bg-white/40" />
      </motion.div>
    </section>
  );
};

export default FinalCTASection;
