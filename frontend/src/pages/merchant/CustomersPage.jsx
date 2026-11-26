import { useCallback, useEffect, useState } from "react";
import {
  Search,
  Users,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X,
  Mail,
  Phone,
  ShoppingBag,
  Wallet,
  CalendarDays,
  AlertCircle,
} from "lucide-react";
import api from "../../services/api";

const currency = (amount, code = "NGN") =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: code,
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

const dateTime = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Not available";

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
  });
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/customers", {
        params: {
          page,
          limit: 10,
          search: search.trim() || undefined,
        },
      });

      setCustomers(response.data.customers || []);
      setPagination({
        total: response.data.pagination?.total || 0,
        totalPages: response.data.pagination?.totalPages || 1,
      });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Failed to load customers."
      );
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const openCustomer = async (customer) => {
    setDetailLoading(true);
    setError("");

    try {
      const response = await api.get(
        `/customers/${encodeURIComponent(customer.email)}`
      );

      setSelectedCustomer(response.data.customer);
      setCustomerOrders(response.data.orders || []);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Could not load customer details."
      );
    } finally {
      setDetailLoading(false);
    }
  };

  const closeCustomer = () => {
    setSelectedCustomer(null);
    setCustomerOrders([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-[#168CD9]">RELATIONSHIPS</p>
          <h2 className="mt-1 text-2xl font-bold text-[#15334A]">
            Customers
          </h2>
          <p className="mt-1 text-sm text-[#7890A2]">
            View customers who have placed orders in your store.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchCustomers}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#DCE8F0] bg-white px-4 py-3 text-sm font-semibold text-[#42647C] hover:bg-[#F5FAFE]"
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-100 bg-rose-50 p-3 text-sm text-rose-700">
          <AlertCircle size={17} />
          {error}
        </div>
      )}

      <div className="flex flex-col gap-3 rounded-2xl border border-[#E3EDF5] bg-white p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#91A5B5]"
          />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search by customer name, email or phone..."
            className="w-full rounded-xl border border-[#E3EDF5] py-3 pl-10 pr-4 text-sm outline-none focus:border-[#168CD9]"
          />
        </div>
        <div className="rounded-xl bg-[#EAF6FF] px-4 py-3 text-sm font-semibold text-[#168CD9]">
          {pagination.total} customers
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#E3EDF5] bg-white">
        <div className="border-b border-[#EDF3F7] px-5 py-4">
          <h3 className="font-bold text-[#15334A]">Customer directory</h3>
          <p className="mt-1 text-xs text-[#91A5B5]">
            Customers are grouped by email address.
          </p>
        </div>

        {loading ? (
          <div className="space-y-3 p-5">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-16 animate-pulse rounded-xl bg-[#F2F7FA]"
              />
            ))}
          </div>
        ) : customers.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF6FF] text-[#168CD9]">
              <Users size={25} />
            </div>
            <h3 className="mt-4 font-bold text-[#15334A]">
              No customers found
            </h3>
            <p className="mt-1 text-sm text-[#91A5B5]">
              Customers will appear here after they place orders.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead className="bg-[#F8FBFD] text-[11px] font-bold uppercase tracking-wider text-[#91A5B5]">
                <tr>
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4">Phone</th>
                  <th className="px-5 py-4">Orders</th>
                  <th className="px-5 py-4">Paid total</th>
                  <th className="px-5 py-4">Last order</th>
                  <th className="px-5 py-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDF3F7]">
                {customers.map((customer) => (
                  <tr
                    key={customer._id || customer.email}
                    className="transition hover:bg-[#F8FBFD]"
                  >
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-[#15334A]">
                        {customer.name}
                      </p>
                      <p className="mt-1 text-xs text-[#91A5B5]">
                        {customer.email}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-sm text-[#61798B]">
                      {customer.phone || "Not provided"}
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-[#15334A]">
                      {customer.ordersCount}
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-[#15334A]">
                      {currency(customer.totalSpent)}
                    </td>
                    <td className="px-5 py-4 text-sm text-[#7890A2]">
                      {dateTime(customer.lastOrderAt)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => openCustomer(customer)}
                        className="text-sm font-semibold text-[#168CD9] hover:text-[#1178BD]"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-[#EDF3F7] px-5 py-4">
          <p className="text-xs text-[#91A5B5]">
            Page {page} of {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((current) => current - 1)}
              className="rounded-lg border border-[#E3EDF5] p-2 text-[#42647C] hover:bg-[#F5FAFE] disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft size={17} />
            </button>
            <button
              type="button"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((current) => current + 1)}
              className="rounded-lg border border-[#E3EDF5] p-2 text-[#42647C] hover:bg-[#F5FAFE] disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </div>

      {(selectedCustomer || detailLoading) && (
        <div className="fixed inset-0 z-[70] flex justify-end bg-[#102B40]/45 backdrop-blur-sm">
          <button
            type="button"
            onClick={closeCustomer}
            className="absolute inset-0 cursor-default"
            aria-label="Close customer details"
          />

          <aside className="relative h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-[#EAF1F7] bg-white px-6 py-5">
              <div>
                <p className="text-xs font-medium text-[#168CD9]">
                  CUSTOMER PROFILE
                </p>
                <h3 className="mt-1 text-lg font-bold text-[#15334A]">
                  {selectedCustomer?.name || "Loading customer..."}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeCustomer}
                className="rounded-lg p-2 text-[#7890A2] hover:bg-[#F2FAFF]"
                aria-label="Close customer details"
              >
                <X size={20} />
              </button>
            </div>

            {detailLoading ? (
              <div className="space-y-4 p-6">
                <div className="h-24 animate-pulse rounded-xl bg-[#F2F7FA]" />
                <div className="h-40 animate-pulse rounded-xl bg-[#F2F7FA]" />
              </div>
            ) : selectedCustomer && (
              <div className="space-y-6 p-6">
                <div className="rounded-2xl bg-[#F5FAFE] p-5">
                  <h4 className="text-lg font-bold text-[#15334A]">
                    {selectedCustomer.name}
                  </h4>
                  <div className="mt-4 space-y-3 text-sm text-[#61798B]">
                    <p className="flex items-center gap-2 break-all">
                      <Mail size={16} className="shrink-0 text-[#168CD9]" />
                      {selectedCustomer.email}
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone size={16} className="shrink-0 text-[#168CD9]" />
                      {selectedCustomer.phone || "No phone number"}
                    </p>
                    <p className="flex items-center gap-2">
                      <CalendarDays size={16} className="shrink-0 text-[#168CD9]" />
                      Last order: {dateTime(selectedCustomer.lastOrderAt)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-[#E3EDF5] p-4">
                    <ShoppingBag size={19} className="text-[#168CD9]" />
                    <p className="mt-3 text-xl font-bold text-[#15334A]">
                      {selectedCustomer.ordersCount}
                    </p>
                    <p className="mt-1 text-xs text-[#91A5B5]">
                      Total orders
                    </p>
                  </div>
                  <div className="rounded-xl border border-[#E3EDF5] p-4">
                    <Wallet size={19} className="text-[#168CD9]" />
                    <p className="mt-3 text-lg font-bold text-[#15334A]">
                      {currency(selectedCustomer.totalSpent)}
                    </p>
                    <p className="mt-1 text-xs text-[#91A5B5]">
                      Paid total
                    </p>
                  </div>
                </div>

                <section>
                  <h4 className="mb-3 text-sm font-bold text-[#15334A]">
                    Order history
                  </h4>

                  {customerOrders.length === 0 ? (
                    <p className="rounded-xl bg-[#F5FAFE] p-4 text-sm text-[#91A5B5]">
                      No orders found.
                    </p>
                  ) : (
                    <div className="divide-y divide-[#EDF3F7] rounded-xl border border-[#E3EDF5] px-4">
                      {customerOrders.map((order) => (
                        <div
                          key={order._id}
                          className="flex items-center justify-between gap-3 py-4"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-[#168CD9]">
                              {order.orderNumber}
                            </p>
                            <p className="mt-1 text-xs capitalize text-[#91A5B5]">
                              {order.orderStatus} · {dateTime(order.createdAt)}
                            </p>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="text-sm font-bold text-[#15334A]">
                              {currency(order.total, order.currency)}
                            </p>
                            <p className="mt-1 text-xs capitalize text-[#91A5B5]">
                              {order.paymentStatus}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
};

export default CustomersPage;
