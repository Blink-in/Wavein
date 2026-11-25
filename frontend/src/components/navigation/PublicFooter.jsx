import { Link } from "react-router-dom";
import { Cloud, ArrowUpRight } from "lucide-react";

const PublicFooter = () => {
  return (
    <footer className="border-t border-slate-100 bg-white">
      <div className="mx-auto flex max-w-[1240px] flex-col justify-between gap-10 px-5 py-12 sm:flex-row sm:items-center lg:px-8">
        <div>
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500 text-white">
              <Cloud size={24} strokeWidth={2.5} />
            </span>
            <span className="text-2xl font-extrabold tracking-tight text-[#102b50]">
              Wave<span className="text-sky-500">buy</span>
            </span>
          </Link>
          <p className="mt-3 text-sm text-slate-500">
            Everything your business needs to sell online.
          </p>
        </div>

        <div className="flex flex-wrap gap-x-7 gap-y-3 text-sm font-medium text-slate-600">
          <a href="/#features" className="hover:text-sky-600">Features</a>
          <a href="/#how-it-works" className="hover:text-sky-600">How it works</a>
          <Link to="/login" className="hover:text-sky-600">Log in</Link>
          <Link to="/register" className="inline-flex items-center gap-1 hover:text-sky-600">
            Get started <ArrowUpRight size={15} />
          </Link>
        </div>
      </div>

      <div className="border-t border-slate-100">
        <div className="mx-auto max-w-[1240px] px-5 py-5 text-xs text-slate-400 lg:px-8">
          © {new Date().getFullYear()} Wavebuy. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
