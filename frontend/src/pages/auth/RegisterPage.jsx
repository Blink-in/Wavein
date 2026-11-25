import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { Cloud, LoaderCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import PasswordInput from "../../components/common/PasswordInput";
import useAuthStore from "../../store/authStore";

const registerSchema = z
  .object({
    firstName: z.string().trim().min(2, "First name must contain at least 2 characters"),
    lastName: z.string().trim().min(2, "Last name must contain at least 2 characters"),
    email: z.string().trim().email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must contain at least 8 characters")
      .max(128, "Password cannot exceed 128 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const RegisterPage = () => {
  const registerUser = useAuthStore((state) => state.register);
  const isLoading = useAuthStore((state) => state.isLoading);

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (formData) => {
    try {
      const { confirmPassword, ...accountData } = formData;

      const response = await register(accountData);

      toast.success(response.message || "Your account was created successfully.");

      navigate("/dashboard", { replace: true });
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to create your account. Please try again."
      );
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F2FAFF] px-5 py-12">
      <div className="pointer-events-none absolute -left-32 top-0 h-80 w-80 rounded-full bg-sky-200/60 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-blue-100 blur-3xl" />

      <div className="relative w-full max-w-lg">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-sky-500"
        >
          <ArrowLeft size={17} />
          Back to home
        </Link>

        <div className="rounded-3xl border border-white bg-white p-7 shadow-2xl shadow-sky-100/80 sm:p-10">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500 text-white">
              <Cloud size={24} fill="currentColor" />
            </div>

            <span className="text-2xl font-extrabold text-slate-800">
              Wave<span className="text-sky-500">buy</span>
            </span>
          </Link>

          <div className="mt-9">
            <h1 className="text-3xl font-extrabold tracking-tight text-[#15334A]">
              Create your account
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Start building your online business with Wavebuy.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="firstName"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  First name
                </label>

                <input
                  id="firstName"
                  autoComplete="given-name"
                  placeholder="First name"
                  {...register("firstName")}
                  className={`h-12 w-full rounded-xl border px-4 text-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100 ${
                    errors.firstName ? "border-red-400" : "border-slate-200"
                  }`}
                />

                {errors.firstName && (
                  <p className="mt-1.5 text-xs text-red-500">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Last name
                </label>

                <input
                  id="lastName"
                  autoComplete="family-name"
                  placeholder="Last name"
                  {...register("lastName")}
                  className={`h-12 w-full rounded-xl border px-4 text-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100 ${
                    errors.lastName ? "border-red-400" : "border-slate-200"
                  }`}
                />

                {errors.lastName && (
                  <p className="mt-1.5 text-xs text-red-500">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Email address
              </label>

              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                {...register("email")}
                className={`h-12 w-full rounded-xl border px-4 text-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100 ${
                  errors.email ? "border-red-400" : "border-slate-200"
                }`}
              />

              {errors.email && (
                <p className="mt-1.5 text-xs text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            <PasswordInput
              id="password"
              label="Password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              error={errors.password?.message}
              {...register("password")}
            />

            <PasswordInput
              id="confirmPassword"
              label="Confirm password"
              autoComplete="new-password"
              placeholder="Enter your password again"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />

            <p className="text-xs leading-5 text-slate-400">
              By creating an account, you agree to use Wavebuy in
              accordance with its terms and policies.
            </p>

            <button
              type="submit"
              disabled={isLoading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-sky-500 font-bold text-white shadow-lg shadow-sky-200 transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <LoaderCircle size={19} className="animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-bold text-sky-600 hover:text-sky-700"
            >
              Sign in
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Wavebuy. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;