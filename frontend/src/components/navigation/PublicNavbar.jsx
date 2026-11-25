
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { ArrowRight, Menu, X, Cloud } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const links = [
  { label: "Home", to: "/" },
  { label: "Features", to: "/#features" },
  { label: "How it works", to: "/#how-it-works" },
  { label: "Pricing", to: "/#pricing" },
];

const PublicNavbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[76px] max-w-[1240px] items-center justify-between px-5 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500 text-white">
            <Cloud size={27} strokeWidth={2.6} />
          </span>
          <span className="text-[25px] font-extrabold tracking-tight text-[#102b50]">
            Wave<span className="text-sky-500">buy</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-9 md:flex">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.to}
              className="text-sm font-semibold text-slate-700 transition-colors hover:text-sky-600"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-6 md:flex">
          <Link
            to="/login"
            className="text-sm font-semibold text-[#102b50] transition-colors hover:text-sky-600"
          >
            Log in
          </Link>

          <Link
            to="/register"
            className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-sky-600 hover:shadow-lg hover:shadow-sky-200"
          >
            Start selling
            <ArrowRight size={16} />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded-lg p-2 text-[#102b50] md:hidden"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? <X size={25} /> : <Menu size={25} />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-slate-100 bg-white md:hidden"
          >
            <nav className="flex flex-col gap-1 px-5 py-4">
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.to}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-sky-50"
                >
                  {link.label}
                </a>
              ))}

              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-sky-50"
              >
                Log in
              </Link>

              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="mt-2 flex items-center justify-center gap-2 rounded-full bg-sky-500 px-5 py-3 font-semibold text-white"
              >
                Start selling
                <ArrowRight size={17} />
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default PublicNavbar;
