import { useCallback, useEffect, useState } from "react";
import {
  Search,
  ShoppingBag,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X,
  Package,
  MapPin,
  Clock3,
  CheckCircle2,
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
    ? new Date(date).toLocaleString("en-NG", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Not available";

const statusClasses = {
  pending: "bg-amber-50 text-amber-700",
  confirmed: "bg-sky-50 text-sky-700",
  processing: "bg-indigo-50 text-indigo-700",
  shipped: "bg-violet-50 text-violet-700",
  delivered: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-rose-50 text-rose-700",
};

const transitions = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [statusNote, setStatusNote] = useState("");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/orders/merchant", {
        params: {
          page,
          limit: 10,
          status: status || undefined,
        },
      });

      setOrders(response.data.orders || []);
      setPagination({
        total: response.data.pagination?.total || 0,
        totalPages: response.data.pagination?.totalPages || 1,
      });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Failed to load your orders."
      );
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const openOrder = async (orderId) => {
    setError("");

    try {
      const response = await api.get(`/orders/merchant/${orderId}`);
      setSelectedOrder(response.data.order);
      setStatusNote("");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Could not load order details."
      );
    }
  };

  const changeOrderStatus = async (nextStatus) => {
    if (!selectedOrder) return;

    setUpdating(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.patch(
        `/orders/merchant/${selectedOrder._id}/status`,
        {
          orderStatus: nextStatus,
          note: statusNote.trim(),
        }
      );

      setSelectedOrder(response.data.order);
      setStatusNote("");
      setSuccess("Order status updated successfully.");
      await fetchOrders();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Could not update the order status."
      );
    } finally {
      setUpdating(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const query = search.trim().toLowerCase();

    if (!query) return true;

    return [
      order.orderNumber,
      order.customer?.name,
      order.customer?.email,
      order.customer?.phone,
    ].some((value) => String(value || "").toLowerCase().includes(query));
  });

  const closeOrder = () => {
    if (updating) return;
    setSelectedOrder(null);
    setStatusNote("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-[#168CD9]">SALES</p>
          <h2 className="mt-1 text-2xl font-bold text-[#15334A]">
            Orders
          </h2>
          <p className="mt-1 text-sm text-[#7890A2]">
            Review customer purchases and manage fulfilment.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchOrders}
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

      {success && (
        <div className="rounded-xl border border-[#D5EAF8] bg-[#EFF8FF] p-3 text-sm text-[#2778AC]">
          {success}
        </div>
      )}

      <div className="flex flex-col gap-3 rounded-2xl border border-[#E3EDF5] bg-white p-4 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#91A5B5]"
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search this page by order or customer..."
            className="w-full rounded-xl border border-[#E3EDF5] py-3 pl-10 pr-4 text-sm outline-none focus:border-[#168CD9]"
          />
        </div>

        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
          className="rounded-xl border border-[#E3EDF5] bg-white px-4 py-3 text-sm text-[#42647C] outline-none focus:border-[#168CD9]"
        >
          <option value="">All order statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#E3EDF5] bg-white">
        <div className="border-b border-[#EDF3F7] px-5 py-4">
          <h3 className="font-bold text-[#15334A]">All orders</h3>
          <p className="mt-1 text-xs text-[#91A5B5]">
            {pagination.total} orders in your store
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
        ) : filteredOrders.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF6FF] text-[#168CD9]">
              <ShoppingBag size={25} />
            </div>
            <h3 className="mt-4 font-bold text-[#15334A]">
              No orders found
            </h3>
            <p className="mt-1 text-sm text-[#91A5B5]">
              Orders from your customers will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead className="bg-[#F8FBFD] text-[11px] font-bold uppercase tracking-wider text-[#91A5B5]">
                <tr>
                  <th className="px-5 py-4">Order</th>
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Total</th>
                  <th className="px-5 py-4">Payment</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDF3F7]">
                {filteredOrders.map((order) => (
                  <tr
                    key={order._id}
                    className="transition hover:bg-[#F8FBFD]"
                  >
                    <td className="px-5 py-4 text-sm font-bold text-[#168CD9]">
                      {order.orderNumber}
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-[#15334A]">
                        {order.customer?.name}
                      </p>
                      <p className="mt-1 text-xs text-[#91A5B5]">
                        {order.customer?.email}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-sm text-[#7890A2]">
                      {dateTime(order.createdAt)}
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-[#15334A]">
                      {currency(order.total, order.currency)}
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-semibold capitalize text-[#61798B]">
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                          statusClasses[order.orderStatus] ||
                          "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => openOrder(order._id)}
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

      {selectedOrder && (
        <div className="fixed inset-0 z-[70] flex justify-end bg-[#102B40]/45 backdrop-blur-sm">
          <button
            type="button"
            onClick={closeOrder}
            className="absolute inset-0 cursor-default"
            aria-label="Close order details"
          />

          <aside className="relative flex h-full w-full max-w-2xl flex-col overflow-y-auto bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-[#EAF1F7] bg-white px-6 py-5">
              <div>
                <p className="text-xs font-medium text-[#168CD9]">
                  ORDER DETAILS
                </p>
                <h3 className="mt-1 text-lg font-bold text-[#15334A]">
                  {selectedOrder.orderNumber}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeOrder}
                className="rounded-lg p-2 text-[#7890A2] hover:bg-[#F2FAFF]"
                aria-label="Close details"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 space-y-6 p-6">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                    statusClasses[selectedOrder.orderStatus] ||
                    "bg-slate-100 text-slate-600"
                  }`}
                >
                  {selectedOrder.orderStatus}
                </span>
                <span className="rounded-full bg-[#F2F6F9] px-3 py-1 text-xs font-semibold capitalize text-[#61798B]">
                  Payment: {selectedOrder.paymentStatus}
                </span>
              </div>

              <section>
                <h4 className="mb-3 text-sm font-bold text-[#15334A]">
                  Customer information
                </h4>
                <div className="rounded-xl bg-[#F5FAFE] p-4 text-sm">
                  <p className="font-semibold text-[#15334A]">
                    {selectedOrder.customer?.name}
                  </p>
                  <p className="mt-1 text-[#61798B]">
                    {selectedOrder.customer?.email}
                  </p>
                  <p className="mt-1 text-[#61798B]">
                    {selectedOrder.customer?.phone}
                  </p>
                </div>
              </section>

              <section>
                <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-[#15334A]">
                  <Package size={17} className="text-[#168CD9]" />
                  Items ordered
                </h4>
                <div className="divide-y divide-[#EDF3F7] rounded-xl border border-[#E3EDF5] px-4">
                  {(selectedOrder.items || []).map((item, index) => (
                    <div
                      key={`${item.product}-${index}`}
                      className="flex items-center justify-between gap-3 py-4"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#EAF6FF] text-[#168CD9]">
                            <Package size={18} />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#15334A]">
                            {item.name}
                          </p>
                          <p className="mt-1 text-xs text-[#91A5B5]">
                            Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <p className="shrink-0 text-sm font-semibold text-[#15334A]">
                        {currency(item.lineTotal, selectedOrder.currency)}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-[#15334A]">
                  <MapPin size={17} className="text-[#168CD9]" />
                  Delivery address
                </h4>
                <div className="rounded-xl bg-[#F5FAFE] p-4 text-sm leading-6 text-[#61798B]">
                  <p className="font-semibold text-[#15334A]">
                    {selectedOrder.shippingAddress?.fullName}
                  </p>
                  <p>{selectedOrder.shippingAddress?.phone}</p>
                  <p>{selectedOrder.shippingAddress?.addressLine1}</p>
                  {selectedOrder.shippingAddress?.addressLine2 && (
                    <p>{selectedOrder.shippingAddress.addressLine2}</p>
                  )}
                  <p>
                    {selectedOrder.shippingAddress?.city},{" "}
                    {selectedOrder.shippingAddress?.state},{" "}
                    {selectedOrder.shippingAddress?.country}
                  </p>
                  <p className="mt-2">
                    Delivery zone: {selectedOrder.delivery?.zoneName}
                  </p>
                  <p>
                    Delivery status: {selectedOrder.delivery?.status}
                  </p>
                </div>
              </section>

              <section>
                <h4 className="mb-3 text-sm font-bold text-[#15334A]">
                  Payment summary
                </h4>
                <div className="space-y-2 rounded-xl border border-[#E3EDF5] p-4 text-sm">
                  <div className="flex justify-between text-[#7890A2]">
                    <span>Subtotal</span>
                    <span>{currency(selectedOrder.subtotal, selectedOrder.currency)}</span>
                  </div>
                  <div className="flex justify-between text-[#7890A2]">
                    <span>Delivery fee</span>
                    <span>{currency(selectedOrder.deliveryFee, selectedOrder.currency)}</span>
                  </div>
                  <div className="flex justify-between border-t border-[#EDF3F7] pt-3 font-bold text-[#15334A]">
                    <span>Total</span>
                    <span>{currency(selectedOrder.total, selectedOrder.currency)}</span>
                  </div>
                  <p className="break-all pt-2 text-xs text-[#91A5B5]">
                    Payment reference: {selectedOrder.paymentReference || "Not available"}
                  </p>
                </div>
              </section>

              <section>
                <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-[#15334A]">
                  <Clock3 size={17} className="text-[#168CD9]" />
                  Order timeline
                </h4>
                <div className="space-y-4">
                  {(selectedOrder.timeline || []).map((entry, index) => (
                    <div key={`${entry.status}-${index}`} className="flex gap-3">
                      <div className="mt-0.5 text-[#168CD9]">
                        <CheckCircle2 size={17} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold capitalize text-[#15334A]">
                          {entry.status}
                        </p>
                        <p className="mt-1 text-xs text-[#7890A2]">
                          {entry.note}
                        </p>
                        <p className="mt-1 text-xs text-[#A0B0BC]">
                          {dateTime(entry.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {transitions[selectedOrder.orderStatus]?.length > 0 && (
                <section className="rounded-xl border border-[#DCEAF4] p-4">
                  <h4 className="text-sm font-bold text-[#15334A]">
                    Update order status
                  </h4>
                  <p className="mt-1 text-xs text-[#91A5B5]">
                    Only valid next steps are available.
                  </p>

                  <textarea
                    value={statusNote}
                    onChange={(event) => setStatusNote(event.target.value)}
                    maxLength={500}
                    rows={2}
                    placeholder="Optional note for the order timeline"
                    className="mt-4 w-full rounded-xl border border-[#DCE8F0] px-3 py-3 text-sm outline-none focus:border-[#168CD9]"
                  />

                  <div className="mt-3 flex flex-wrap gap-2">
                    {transitions[selectedOrder.orderStatus].map((nextStatus) => (
                      <button
                        key={nextStatus}
                        type="button"
                        disabled={updating}
                        onClick={() => changeOrderStatus(nextStatus)}
                        className={`rounded-lg px-3 py-2 text-xs font-semibold capitalize transition disabled:opacity-50 ${
                          nextStatus === "cancelled"
                            ? "border border-rose-200 text-rose-600 hover:bg-rose-50"
                            : "bg-[#168CD9] text-white hover:bg-[#1178BD]"
                        }`}
                      >
                        {updating ? "Updating..." : nextStatus}
                      </button>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
