
import { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Store,
  Truck,
  CreditCard,
  ChartNoAxesCombined,
  Settings,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
} from "lucide-react";

const navigation = [
  {
    title: "OVERVIEW",
    items: [
      { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard, end: true },
    ],
  },
  {
    title: "MANAGEMENT",
    items: [
      { label: "Products", path: "/dashboard/products", icon: Package },
      { label: "Orders", path: "/dashboard/orders", icon: ShoppingBag },
      { label: "Customers", path: "/dashboard/customers", icon: Users },
    ],
  },
  {
    title: "YOUR STORE",
    items: [
      { label: "Store settings", path: "/dashboard/store", icon: Store },
      { label: "Delivery", path: "/dashboard/delivery", icon: Truck },
      { label: "Payments", path: "/dashboard/payments", icon: CreditCard },
    ],
  },
  {
    title: "BUSINESS",
    items: [
      { label: "Analytics", path: "/dashboard/analytics", icon: ChartNoAxesCombined },
      { label: "Settings", path: "/dashboard/settings", icon: Settings },
    ],
  },
];

const MerchantLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const currentPage =
    navigation.flatMap((section) => section.items).find((item) =>
      item.end
        ? location.pathname === item.path
        : location.pathname.startsWith(item.path)
    )?.label || "Dashboard";

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-[#F5FAFE] text-[#15334A]">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={closeSidebar}
          className="fixed inset-0 z-40 bg-[#102B40]/40 backdrop-blur-[2px] lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col border-r border-[#E3EDF5] bg-white transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-[76px] items-center justify-between border-b border-[#EAF1F7] px-6">
          <Link to="/" className="flex items-center gap-2.5" onClick={closeSidebar}>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#168CD9] text-lg font-bold text-white">
              W
            </span>
            <span className="text-[21px] font-extrabold tracking-tight text-[#15334A]">
              wavebuy<span className="text-[#168CD9]">.</span>
            </span>
          </Link>

          <button
            type="button"
            onClick={closeSidebar}
            className="rounded-lg p-2 text-slate-500 hover:bg-[#F2FAFF] lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="border-b border-[#EAF1F7] px-5 py-5">
          <div className="flex items-center gap-3 rounded-xl bg-[#F2FAFF] p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#DDF2FF] text-[#168CD9]">
              <Store size={19} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-[#7890A2]">Merchant workspace</p>
              <p className="truncate text-sm font-semibold text-[#15334A]">
                Your business
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-7 overflow-y-auto px-4 py-6">
          {navigation.map((section) => (
            <div key={section.title}>
              <p className="mb-3 px-3 text-[10px] font-bold tracking-[0.16em] text-[#91A5B5]">
                {section.title}
              </p>

              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.end}
                      onClick={closeSidebar}
                      className={({ isActive }) =>
                        `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-all duration-200 ${
                          isActive
                            ? "bg-[#EAF6FF] text-[#168CD9]"
                            : "text-[#61798B] hover:bg-[#F4FAFE] hover:text-[#168CD9]"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon
                            size={18}
                            strokeWidth={isActive ? 2.3 : 1.8}
                          />
                          <span className="flex-1">{item.label}</span>
                          {isActive && (
                            <span className="h-1.5 w-1.5 rounded-full bg-[#168CD9]" />
                          )}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-[#EAF1F7] p-4">
          <Link
            to="/"
            className="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold text-[#61798B] transition hover:bg-[#F2FAFF] hover:text-[#168CD9]"
          >
            <span className="flex items-center gap-3">
              <ExternalLink size={17} />
              Visit Wavebuy
            </span>
            <ChevronRight size={16} />
          </Link>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-[270px]">
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-[#E3EDF5] bg-white/95 px-5 backdrop-blur-md sm:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl border border-[#E3EDF5] p-2 text-[#15334A] hover:bg-[#F2FAFF] lg:hidden"
              aria-label="Open navigation"
            >
              <Menu size={20} />
            </button>

            <div>
              <p className="text-[11px] font-medium text-[#91A5B5]">
                MERCHANT WORKSPACE
              </p>
              <h1 className="text-base font-bold text-[#15334A]">
                {currentPage}
              </h1>
            </div>
          </div>

          <Link
            to="/dashboard/settings"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E3EDF5] bg-[#F5FAFE] text-[#168CD9] transition hover:bg-[#DDF2FF]"
            aria-label="Settings"
          >
            <Settings size={18} />
          </Link>
        </header>

        <main className="mx-auto w-full max-w-[1600px] p-5 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MerchantLayout;
