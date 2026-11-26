import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  Package,
  Pencil,
  Trash2,
  X,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  AlertCircle,
} from "lucide-react";
import api from "../../services/api";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  compareAtPrice: "",
  sku: "",
  stockQuantity: "0",
  category: "",
  status: "draft",
  isFeatured: false,
  imagesText: "",
};

const getError = (error) =>
  error.response?.data?.message || "Something went wrong. Please try again.";

const currency = (amount) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalProducts: 0,
    totalPages: 1,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/products", {
        params: {
          page,
          limit: 10,
          search: search.trim(),
          status: status || undefined,
          sort: "newest",
        },
      });

      setProducts(response.data.products || []);
      setPagination({
        totalProducts: response.data.totalProducts || 0,
        totalPages: response.data.totalPages || 1,
      });
    } catch (requestError) {
      setError(getError(requestError));
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateForm = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const openCreate = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditingProduct(product);

    setForm({
      name: product.name || "",
      description: product.description || "",
      price: String(product.price ?? ""),
      compareAtPrice:
        product.compareAtPrice == null ? "" : String(product.compareAtPrice),
      sku: product.sku || "",
      stockQuantity: String(product.stockQuantity ?? 0),
      category:
        typeof product.category === "object"
          ? product.category?._id || ""
          : product.category || "",
      status: product.status || "draft",
      isFeatured: Boolean(product.isFeatured),
      imagesText: (product.images || []).join("\n"),
    });

    setError("");
    setSuccess("");
    setModalOpen(true);
  };

  const submitProduct = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const images = form.imagesText
      .split("\n")
      .map((image) => image.trim())
      .filter(Boolean);

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      compareAtPrice:
        form.compareAtPrice === "" ? null : Number(form.compareAtPrice),
      sku: form.sku.trim() || null,
      stockQuantity: Number(form.stockQuantity),
      category: form.category.trim() || null,
      status: form.status,
      isFeatured: form.isFeatured,
      images,
    };

    try {
      if (editingProduct) {
        await api.patch(
          `/products/${editingProduct.id || editingProduct._id}`,
          payload
        );
        setSuccess("Product updated successfully.");
      } else {
        await api.post("/products", payload);
        setSuccess("Product created successfully.");
      }

      setModalOpen(false);
      setForm(emptyForm);
      setEditingProduct(null);
      await fetchProducts();
    } catch (requestError) {
      setError(getError(requestError));
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (product) => {
    const confirmed = window.confirm(
      `Delete "${product.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await api.delete(`/products/${product.id || product._id}`);
      setSuccess("Product deleted successfully.");
      await fetchProducts();
    } catch (requestError) {
      setError(getError(requestError));
    }
  };

  const updateStock = async (product) => {
    const value = window.prompt(
      `Enter the new stock quantity for ${product.name}:`,
      String(product.stockQuantity ?? 0)
    );

    if (value === null) return;

    const stockQuantity = Number(value);

    if (!Number.isInteger(stockQuantity) || stockQuantity < 0) {
      setError("Stock quantity must be a non-negative whole number.");
      return;
    }

    setError("");
    setSuccess("");

    try {
      await api.patch(
        `/products/${product.id || product._id}/stock`,
        { stockQuantity }
      );
      setSuccess("Product stock updated successfully.");
      await fetchProducts();
    } catch (requestError) {
      setError(getError(requestError));
    }
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditingProduct(null);
    setForm(emptyForm);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-[#168CD9]">CATALOGUE</p>
          <h2 className="mt-1 text-2xl font-bold text-[#15334A]">
            Products
          </h2>
          <p className="mt-1 text-sm text-[#7890A2]">
            Manage your products, pricing and inventory.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#168CD9] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1178BD]"
        >
          <Plus size={18} />
          Add product
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
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search products by name..."
            className="w-full rounded-xl border border-[#E3EDF5] py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#168CD9]"
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
          <option value="">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>

        <button
          type="button"
          onClick={fetchProducts}
          className="flex items-center justify-center rounded-xl border border-[#E3EDF5] px-4 py-3 text-[#42647C] hover:bg-[#F5FAFE]"
          aria-label="Refresh products"
        >
          <RefreshCw size={17} />
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#E3EDF5] bg-white">
        <div className="flex items-center justify-between border-b border-[#EDF3F7] px-5 py-4">
          <div>
            <h3 className="font-bold text-[#15334A]">Your catalogue</h3>
            <p className="mt-1 text-xs text-[#91A5B5]">
              {pagination.totalProducts} products
            </p>
          </div>
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
        ) : products.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF6FF] text-[#168CD9]">
              <Package size={25} />
            </div>
            <h3 className="mt-4 font-bold text-[#15334A]">
              No products found
            </h3>
            <p className="mt-1 text-sm text-[#91A5B5]">
              Add a product or change your search filters.
            </p>
            <button
              type="button"
              onClick={openCreate}
              className="mt-5 font-semibold text-[#168CD9] hover:text-[#1178BD]"
            >
              Add your first product
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead className="bg-[#F8FBFD] text-[11px] font-bold uppercase tracking-wider text-[#91A5B5]">
                <tr>
                  <th className="px-5 py-4">Product</th>
                  <th className="px-5 py-4">Price</th>
                  <th className="px-5 py-4">Inventory</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDF3F7]">
                {products.map((product) => (
                  <tr
                    key={product.id || product._id}
                    className="hover:bg-[#F8FBFD]"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="h-12 w-12 rounded-xl border border-[#E3EDF5] object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF6FF] text-[#168CD9]">
                            <ImagePlus size={19} />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="max-w-[240px] truncate text-sm font-semibold text-[#15334A]">
                            {product.name}
                          </p>
                          <p className="mt-1 text-xs text-[#91A5B5]">
                            {product.sku || "No SKU"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-[#15334A]">
                      {currency(product.price)}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => updateStock(product)}
                        className="text-left text-sm font-semibold text-[#42647C] hover:text-[#168CD9]"
                      >
                        {product.stockQuantity} in stock
                        <span className="mt-1 block text-xs font-normal text-[#168CD9]">
                          Update stock
                        </span>
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          product.status === "published"
                            ? "bg-[#EAF6FF] text-[#168CD9]"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {product.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(product)}
                          className="rounded-lg p-2 text-[#668296] hover:bg-[#EAF6FF] hover:text-[#168CD9]"
                          aria-label={`Edit ${product.name}`}
                        >
                          <Pencil size={17} />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteProduct(product)}
                          className="rounded-lg p-2 text-[#9A7180] hover:bg-rose-50 hover:text-rose-600"
                          aria-label={`Delete ${product.name}`}
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
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

      {modalOpen && (
        <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-[#102B40]/45 p-4 backdrop-blur-sm">
          <div className="my-6 w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EAF1F7] px-6 py-5">
              <div>
                <h3 className="text-lg font-bold text-[#15334A]">
                  {editingProduct ? "Edit product" : "Add a product"}
                </h3>
                <p className="mt-1 text-xs text-[#91A5B5]">
                  Add the product details for your storefront.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-2 text-[#7890A2] hover:bg-[#F2FAFF]"
                aria-label="Close product form"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={submitProduct} className="space-y-5 p-6">
              {error && (
                <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
                  {error}
                </p>
              )}

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#42647C]">
                  Product name *
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={updateForm}
                  required
                  minLength={2}
                  maxLength={150}
                  placeholder="e.g. Classic leather bag"
                  className="w-full rounded-xl border border-[#DCE8F0] px-4 py-3 text-sm outline-none focus:border-[#168CD9]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#42647C]">
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={updateForm}
                  maxLength={5000}
                  rows={4}
                  placeholder="Describe your product..."
                  className="w-full resize-y rounded-xl border border-[#DCE8F0] px-4 py-3 text-sm outline-none focus:border-[#168CD9]"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#42647C]">
                    Selling price (NGN) *
                  </label>
                  <input
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={updateForm}
                    required
                    className="w-full rounded-xl border border-[#DCE8F0] px-4 py-3 text-sm outline-none focus:border-[#168CD9]"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#42647C]">
                    Compare-at price
                  </label>
                  <input
                    name="compareAtPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.compareAtPrice}
                    onChange={updateForm}
                    placeholder="Optional"
                    className="w-full rounded-xl border border-[#DCE8F0] px-4 py-3 text-sm outline-none focus:border-[#168CD9]"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#42647C]">
                    SKU
                  </label>
                  <input
                    name="sku"
                    value={form.sku}
                    onChange={updateForm}
                    placeholder="Optional product code"
                    className="w-full rounded-xl border border-[#DCE8F0] px-4 py-3 text-sm outline-none focus:border-[#168CD9]"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#42647C]">
                    Stock quantity *
                  </label>
                  <input
                    name="stockQuantity"
                    type="number"
                    min="0"
                    step="1"
                    value={form.stockQuantity}
                    onChange={updateForm}
                    required
                    className="w-full rounded-xl border border-[#DCE8F0] px-4 py-3 text-sm outline-none focus:border-[#168CD9]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#42647C]">
                  Category ID
                </label>
                <input
                  name="category"
                  value={form.category}
                  onChange={updateForm}
                  placeholder="Optional MongoDB category ID"
                  className="w-full rounded-xl border border-[#DCE8F0] px-4 py-3 text-sm outline-none focus:border-[#168CD9]"
                />
                <p className="mt-1 text-xs text-[#91A5B5]">
                  Leave empty if this product does not have a category.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#42647C]">
                  Product image URLs
                </label>
                <textarea
                  name="imagesText"
                  value={form.imagesText}
                  onChange={updateForm}
                  rows={3}
                  placeholder={"https://example.com/image-1.jpg\nhttps://example.com/image-2.jpg"}
                  className="w-full rounded-xl border border-[#DCE8F0] px-4 py-3 text-sm outline-none focus:border-[#168CD9]"
                />
                <p className="mt-1 text-xs text-[#91A5B5]">
                  Enter one HTTP or HTTPS image URL per line, up to 10 images.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#42647C]">
                    Visibility
                  </label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={updateForm}
                    className="w-full rounded-xl border border-[#DCE8F0] bg-white px-4 py-3 text-sm outline-none focus:border-[#168CD9]"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
                <label className="flex items-center gap-3 self-end rounded-xl border border-[#DCE8F0] p-3 text-sm font-medium text-[#42647C]">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={form.isFeatured}
                    onChange={updateForm}
                    className="h-4 w-4 accent-[#168CD9]"
                  />
                  Feature this product
                </label>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-[#EDF3F7] pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-[#DCE8F0] px-5 py-3 text-sm font-semibold text-[#61798B] hover:bg-[#F5FAFE]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[#168CD9] px-5 py-3 text-sm font-semibold text-white hover:bg-[#1178BD] disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingProduct
                      ? "Save changes"
                      : "Create product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
