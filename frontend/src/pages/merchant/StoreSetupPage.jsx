
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Store, ArrowRight, LoaderCircle } from "lucide-react";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
)
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

export default function StoreSetupPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    email: "",
    phone: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((current) => ({
      ...current,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Please enter your store name.");
      return;
    }

    if (!form.email.trim()) {
      setError("Please enter your business email.");
      return;
    }

    try {
      setLoading(true);

      await axios.post(
        `${API_BASE_URL}/api/stores`,
        {
          name: form.name.trim(),
          description: form.description.trim(),
          contactDetails: {
            email: form.email.trim(),
            phone: form.phone.trim(),
            address: form.address.trim(),
          },
        },
        {
          withCredentials: true,
        }
      );

      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to create your store. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">
          Store onboarding
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          Let's set up your store
        </h1>

        <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
          Tell us a little about your business. You can customize your
          storefront and add products after creating your store.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-7 rounded-xl border border-slate-200 bg-white p-5 sm:p-8"
      >
        <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <Store size={21} />
          </div>

          <div>
            <h2 className="font-semibold text-slate-900">
              Business information
            </h2>
            <p className="text-xs text-slate-500">
              Your store's basic details
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Store name *
          </label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            maxLength={100}
            placeholder="e.g. Urban Collections"
            className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Store description
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            maxLength={1000}
            placeholder="Tell customers what your business offers..."
            className="w-full resize-y rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          />
          <p className="text-right text-xs text-slate-400">
            {form.description.length}/1000
          </p>
        </div>

        <div className="border-t border-slate-100 pt-6">
          <h3 className="font-semibold text-slate-900">
            Contact information
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Customers can use these details to reach your business.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Business email *
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="business@example.com"
              className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Phone number
            </label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+234..."
              className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Business address
          </label>
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            rows={2}
            placeholder="Your business location"
            className="w-full resize-y rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          />
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            Currency: Nigerian Naira (NGN)
          </p>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <LoaderCircle size={17} className="animate-spin" />
                Creating store...
              </>
            ) : (
              <>
                Create my store
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
