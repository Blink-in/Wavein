import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  UserRoundPlus,
  Store,
  Rocket,
} from "lucide-react";
import { fadeUp, staggerContainer, viewportSettings } from "./homeAnimations";

const steps = [
  {
    number: "01",
    icon: UserRoundPlus,
    title: "Create your account",
    description: "Sign up and set up your business account.",
  },
  {
    number: "02",
    icon: Store,
    title: "Build your store",
    description: "Add your products and customize your storefront.",
  },
  {
    number: "03",
    icon: Rocket,
    title: "Start selling",
    description: "Share your store and start receiving orders.",
  },
];

const HowItWorksSection = () => {
  return (
    <section
      id="how-it-works"
      className="overflow-hidden bg-[#f4faff] py-20 lg:py-24"
    >
      <div className="mx-auto grid max-w-[1240px] gap-14 px-5 lg:grid-cols-[0.75fr_1.25fr] lg:items-center lg:px-8">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportSettings}
        >
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-sky-600">
            How it works
          </p>

          <h2 className="mt-5 max-w-[430px] text-4xl font-extrabold leading-[1.13] tracking-[-0.045em] text-[#102b50] sm:text-5xl">
            Three steps to your{" "}
            <span className="text-sky-500">online store.</span>
          </h2>

          <p className="mt-5 max-w-[390px] leading-7 text-slate-600">
            Everything you need to take your business online, without the
            technical complexity.
          </p>

          <Link
            to="/register"
            className="group mt-8 inline-flex items-center gap-3 font-bold text-sky-600 transition-colors hover:text-sky-700"
          >
            Get started
            <ArrowRight
              size={19}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportSettings}
          className="grid gap-8 sm:grid-cols-3"
        >
          {steps.map(({ number, icon: Icon, title, description }, index) => (
            <motion.article
              variants={fadeUp}
              key={number}
              className="relative"
            >
              <div className="flex h-[190px] flex-col items-center justify-center rounded-3xl border border-sky-100 bg-white px-5 text-center shadow-[0_12px_35px_rgba(33,111,170,0.045)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_18px_40px_rgba(33,111,170,0.10)]">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                  <Icon size={29} strokeWidth={1.8} />
                </div>

                <h3 className="font-bold text-[#102b50]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {description}
                </p>
              </div>

              {index !== steps.length - 1 && (
                <div className="absolute -right-7 top-1/2 hidden -translate-y-1/2 text-sky-500 lg:block">
                  <ArrowRight size={25} strokeWidth={1.7} />
                </div>
              )}
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
