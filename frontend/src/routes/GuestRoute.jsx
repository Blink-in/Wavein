import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../store/authStore";

const GuestRoute = () => {
  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated
  );

  const isInitialized = useAuthStore(
    (state) => state.isInitialized
  );

  const user = useAuthStore((state) => state.user);

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5FAFE]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#DDF2FF] border-t-[#168CD9]" />
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <Navigate
        to={
          user.platformRole === "platformAdmin"
            ? "/admin"
            : "/dashboard"
        }
        replace
      />
    );
  }

  return <Outlet />;
};

export default GuestRoute;