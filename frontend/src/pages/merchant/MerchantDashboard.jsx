
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Package,
  ShoppingBag,
  Wallet,
  Plus,
  ArrowRight,
  RefreshCw,
  Store,
  Image,
  Truck,
  CreditCard,
  CheckCircle2,
  Circle,
  Clock3,
  AlertCircle,
} from "lucide-react";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
)
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
});

const getStore = (response) => {
  const data = response?.data;

  return (
    data?.store ||
    data?.data?.store ||
    data?.data ||
    data ||
    null
  );
};

const getList = (response, key) => {
  const data = response?.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.[key])) return data[key];
  if (Array.isArray(data?.data?.[key])) return data.data[key];
  if (Array.isArray(data?.data)) return data.data;

  return [];
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

const formatDate = (date) => {
  if (!date) return "Date unavailable";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
  }

  return parsedDate.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getOrderAmount = (order) =>
  Number(
    order?.totalAmount ??
      order?.grandTotal ??
      order?.total ??
      order?.amount ??
      0
  );

const getCustomerName = (order) =>
  order?.customer?.name ||
  order?.customer?.fullName ||
  order?.customerName ||
  order?.shippingAddress?.fullName ||
  order?.shippingAddress?.name ||
  "Customer";

const statusStyles = {
  pending: "bg-amber-50 text-amber-700",
  confirmed: "bg-sky-50 text-sky-700",
  processing: "bg-sky-50 text-sky-700",
  shipped: "bg-violet-50 text-violet-700",
  delivered: "bg-emerald-50 text-emerald-700",
  completed: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-rose-50 text-rose-700",
};

const StatCard = ({
  label,
  value,
  description,
  icon: Icon,
  loading,
}) => (
  <div className="rounded-2xl border border-[#E3EDF5] bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_35px_rgba(21,51,74,0.06)] sm:p-6">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-[#7890A2]">
          {label}
        </p>

        <p className="mt-3 text-2xl font-bold tracking-tight text-[#15334A]">
          {loading ? (
            <span className="inline-block h-7 w-24 animate-pulse rounded-md bg-[#EAF3FA]" />
          ) : (
            value
          )}
        </p>

        <p className="mt-2 text-xs text-[#91A5B5]">
          {description}
        </p>
      </div>

      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF6FF] text-[#168CD9]">
        <Icon size={20} strokeWidth={1.9} />
      </div>
    </div>
  </div>
);

const SetupTask = ({
  label,
  description,
  completed,
  to,
  icon: Icon,
}) => (
  <Link
    to={to}
    className="group flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-[#F5FAFE]"
  >
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
        completed
          ? "bg-[#EAF6FF] text-[#168CD9]"
          : "bg-[#F2F6F9] text-[#8297A7]"
      }`}
    >
      <Icon size={18} />
    </div>

    <div className="min-w-0 flex-1">
      <p className="text-sm font-semibold text-[#15334A]">
        {label}
      </p>

      <p className="mt-0.5 text-xs text-[#91A5B5]">
        {description}
      </p>
    </div>

    {completed ? (
      <CheckCircle2
        size={19}
        className="shrink-0 text-[#168CD9]"
      />
    ) : (
      <Circle
        size={19}
        className="shrink-0 text-[#C5D4DF] transition group-hover:text-[#168CD9]"
      />
    )}
  </Link>
);

const MerchantDashboard = () => {
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);

  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    paidOrders: 0,
    totalRevenue: 0,
  });

  const [recentOrders, setRecentOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const results = await Promise.allSettled([
        api.get("/stores/my-store"),
        api.get("/products"),
        api.get("/orders/merchant/dashboard"),
      ]);

      const [storeResult, productsResult, dashboardResult] = results;

      const failedRequests = results.filter(
        (result) => result.status === "rejected"
      );

      if (storeResult.status === "fulfilled") {
        setStore(getStore(storeResult.value));
      } else {
        setStore(null);
      }

      if (productsResult.status === "fulfilled") {
        setProducts(
          getList(productsResult.value, "products")
        );
      } else {
        setProducts([]);
      }

      if (dashboardResult.status === "fulfilled") {
        const dashboardData = dashboardResult.value?.data;

        setStats({
          totalOrders: Number(
            dashboardData?.stats?.totalOrders || 0
          ),
          pendingOrders: Number(
            dashboardData?.stats?.pendingOrders || 0
          ),
          paidOrders: Number(
            dashboardData?.stats?.paidOrders || 0
          ),
          totalRevenue: Number(
            dashboardData?.stats?.totalRevenue || 0
          ),
        });

        setRecentOrders(
          Array.isArray(dashboardData?.recentOrders)
            ? dashboardData.recentOrders
            : []
        );
      } else {
        setStats({
          totalOrders: 0,
          pendingOrders: 0,
          paidOrders: 0,
          totalRevenue: 0,
        });

        setRecentOrders([]);
      }

      if (failedRequests.length === results.length) {
        setError(
          "We couldn't load your dashboard data. Check your connection and try again."
        );
      } else if (failedRequests.length > 0) {
        setError(
          "Some dashboard information could not be loaded. You can refresh to try again."
        );
      }
    } catch {
      setError(
        "Something went wrong while loading your dashboard."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const setupTasks = [
    {
      label: "Complete store information",
      description: "Add your store name and contact details",
      completed: Boolean(
        store?.name &&
        store?.description &&
        store?.contactDetails?.email
      ),
      to: "/dashboard/store-setup",
      icon: Store,
    },
    {
      label: "Add your store branding",
      description: "Upload a logo for your storefront",
      completed: Boolean(store?.logo),
      to: "/dashboard/store",
      icon: Image,
    },
    {
      label: "Add your first product",
      description: "Start building your product catalogue",
      completed: products.length > 0,
      to: "/dashboard/products",
      icon: Package,
    },
    {
      label: "Configure delivery",
      description: "Set up how customers receive orders",
      completed: false,
      to: "/dashboard/delivery",
      icon: Truck,
    },
    {
      label: "Configure payments",
      description: "Review your store payment settings",
      completed: false,
      to: "/dashboard/payments",
      icon: CreditCard,
    },
  ];

  const completedTasks = setupTasks.filter(
    (task) => task.completed
  ).length;

  const progress = Math.round(
    (completedTasks / setupTasks.length) * 100
  );

  const storeName = store?.name || "your store";

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-[#168CD9]">
            YOUR BUSINESS AT A GLANCE
          </p>

          <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#15334A] sm:text-[30px]">
            Welcome to your dashboard
          </h2>

          <p className="mt-2 text-sm text-[#7890A2]">
            Here's what's happening with {storeName}.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchDashboard(true)}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-[#DCEAF4] bg-white px-4 py-2.5 text-sm font-semibold text-[#42647C] transition hover:border-[#168CD9] hover:text-[#168CD9] disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
        >
          <RefreshCw
            size={16}
            className={refreshing ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </section>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-[#D8EAF7] bg-[#EFF8FF] p-4 text-sm text-[#42647C]">
          <AlertCircle
            size={18}
            className="mt-0.5 shrink-0 text-[#168CD9]"
          />
          <p>{error}</p>
        </div>
      )}

      {!loading && !store && (
        <section className="overflow-hidden rounded-2xl border border-[#DCEAF4] bg-white">
          <div className="grid gap-8 p-6 sm:p-9 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="max-w-xl">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF6FF] text-[#168CD9]">
                <Store size={23} />
              </div>

              <p className="text-xs font-bold tracking-[0.15em] text-[#168CD9]">
                LET'S GET STARTED
              </p>

              <h3 className="mt-3 text-2xl font-bold tracking-tight text-[#15334A]">
                Create your online store
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#7890A2]">
                Set up your business on Wavebuy, add your products
                and start building your online storefront.
              </p>

              <Link
                to="/dashboard/store-setup"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#168CD9] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1178BD]"
              >
                Set up your store
                <ArrowRight size={17} />
              </Link>
            </div>

            <div className="hidden h-40 w-40 items-center justify-center rounded-full bg-[#F2FAFF] lg:flex">
              <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-[#DDF2FF] text-[#168CD9]">
                <ShoppingBag
                  size={43}
                  strokeWidth={1.5}
                />
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total revenue"
          value={formatCurrency(stats.totalRevenue)}
          description="From successfully paid orders"
          icon={Wallet}
          loading={loading}
        />

        <StatCard
          label="Total orders"
          value={stats.totalOrders.toLocaleString("en-NG")}
          description={`${stats.pendingOrders} pending orders`}
          icon={ShoppingBag}
          loading={loading}
        />

        <StatCard
          label="Products"
          value={products.length.toLocaleString("en-NG")}
          description="Products in your catalogue"
          icon={Package}
          loading={loading}
        />

        <StatCard
          label="Paid orders"
          value={stats.paidOrders.toLocaleString("en-NG")}
          description="Successfully paid orders"
          icon={CheckCircle2}
          loading={loading}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-2xl border border-[#E3EDF5] bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-[#15334A]">
                Store setup
              </h3>

              <p className="mt-1 text-sm text-[#91A5B5]">
                Complete these steps to prepare your business.
              </p>
            </div>

            <span className="rounded-full bg-[#EAF6FF] px-3 py-1 text-xs font-bold text-[#168CD9]">
              {completedTasks}/{setupTasks.length} completed
            </span>
          </div>

          <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#EDF3F7]">
            <div
              className="h-full rounded-full bg-[#168CD9] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="mt-2 text-xs font-medium text-[#7890A2]">
            {progress}% of your setup completed
          </p>

          <div className="mt-5 divide-y divide-[#EDF3F7]">
            {setupTasks.map((task) => (
              <SetupTask key={task.label} {...task} />
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[#E3EDF5] bg-white p-5 sm:p-6">
          <div>
            <h3 className="text-base font-bold text-[#15334A]">
              Quick actions
            </h3>

            <p className="mt-1 text-sm text-[#91A5B5]">
              Shortcuts to manage your business.
            </p>
          </div>

          <div className="mt-5 space-y-3">
            <Link
              to="/dashboard/products"
              className="group flex items-center gap-4 rounded-xl border border-[#E8F0F6] p-4 transition hover:border-[#B9DDF5] hover:bg-[#F5FAFE]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF6FF] text-[#168CD9]">
                <Plus size={20} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#15334A]">
                  Add a product
                </p>

                <p className="mt-1 text-xs text-[#91A5B5]">
                  Expand your product catalogue
                </p>
              </div>

              <ArrowUpRight
                size={18}
                className="text-[#91A5B5] transition group-hover:text-[#168CD9]"
              />
            </Link>

            <Link
              to="/dashboard/orders"
              className="group flex items-center gap-4 rounded-xl border border-[#E8F0F6] p-4 transition hover:border-[#B9DDF5] hover:bg-[#F5FAFE]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF6FF] text-[#168CD9]">
                <ShoppingBag size={20} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#15334A]">
                  Manage orders
                </p>

                <p className="mt-1 text-xs text-[#91A5B5]">
                  Review and process customer orders
                </p>
              </div>

              <ArrowUpRight
                size={18}
                className="text-[#91A5B5] transition group-hover:text-[#168CD9]"
              />
            </Link>

            <Link
              to="/dashboard/store"
              className="group flex items-center gap-4 rounded-xl border border-[#E8F0F6] p-4 transition hover:border-[#B9DDF5] hover:bg-[#F5FAFE]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF6FF] text-[#168CD9]">
                <Store size={20} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#15334A]">
                  Customize your store
                </p>

                <p className="mt-1 text-xs text-[#91A5B5]">
                  Manage your storefront information
                </p>
              </div>

              <ArrowUpRight
                size={18}
                className="text-[#91A5B5] transition group-hover:text-[#168CD9]"
              />
            </Link>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#E3EDF5] bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EDF3F7] px-5 py-5 sm:px-6">
          <div>
            <h3 className="text-base font-bold text-[#15334A]">
              Recent orders
            </h3>

            <p className="mt-1 text-sm text-[#91A5B5]">
              Keep track of your latest customer orders.
            </p>
          </div>

          <Link
            to="/dashboard/orders"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#168CD9] transition hover:text-[#1178BD]"
          >
            View all
            <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-4 p-6">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-12 animate-pulse rounded-lg bg-[#F2F7FA]"
              />
            ))}
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF6FF] text-[#168CD9]">
              <ShoppingBag size={22} />
            </div>

            <h4 className="mt-4 text-sm font-bold text-[#15334A]">
              No orders yet
            </h4>

            <p className="mx-auto mt-1 max-w-sm text-sm text-[#91A5B5]">
              Your customer orders will appear here when someone
              places an order in your store.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left">
              <thead>
                <tr className="bg-[#F8FBFD] text-[11px] font-bold uppercase tracking-wider text-[#91A5B5]">
                  <th className="px-6 py-3.5">Order</th>
                  <th className="px-6 py-3.5">Customer</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5">Amount</th>
                  <th className="px-6 py-3.5">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#EDF3F7]">
                {recentOrders.map((order) => {
                  const status = String(
                    order?.orderStatus || "pending"
                  ).toLowerCase();

                  return (
                    <tr
                      key={order?._id || order?.orderNumber}
                      className="transition hover:bg-[#F8FBFD]"
                    >
                      <td className="px-6 py-4 text-sm font-semibold text-[#168CD9]">
                        {order?.orderNumber ||
                          order?.reference ||
                          `#${String(order?._id || "").slice(-8)}`}
                      </td>

                      <td className="px-6 py-4 text-sm font-medium text-[#42647C]">
                        {getCustomerName(order)}
                      </td>

                      <td className="px-6 py-4 text-sm text-[#7890A2]">
                        {formatDate(order?.createdAt)}
                      </td>

                      <td className="px-6 py-4 text-sm font-semibold text-[#15334A]">
                        {formatCurrency(getOrderAmount(order))}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                            statusStyles[status] ||
                            "bg-[#F0F5F8] text-[#61798B]"
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="flex items-center gap-2 pb-2 text-xs text-[#91A5B5]">
        <Clock3 size={14} />
        Dashboard information is based on the latest data returned by your store.
      </div>
    </div>
  );
};

export default MerchantDashboard;
