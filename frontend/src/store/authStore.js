import { create } from "zustand";
import api from "../services/api";

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isInitialized: false,
  isInitializing: false,
  isLoading: false,

  initializeAuth: async () => {
    if (get().isInitialized || get().isInitializing) {
      return;
    }

    set({ isInitializing: true });

    try {
      const response = await api.get("/auth/me");

      set({
        user: response.data.user,
        isAuthenticated: true,
      });
    } catch {
      set({
        user: null,
        isAuthenticated: false,
      });
    } finally {
      set({
        isInitialized: true,
        isInitializing: false,
      });
    }
  },

  register: async (formData) => {
    set({ isLoading: true });

    try {
      const response = await api.post("/auth/register", formData);

      set({
        user: response.data.user,
        isAuthenticated: true,
      });

      return response.data;
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (formData) => {
    set({ isLoading: true });

    try {
      const response = await api.post("/auth/login", formData);

      set({
        user: response.data.user,
        isAuthenticated: true,
      });

      return response.data;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true });

    try {
      const response = await api.post("/auth/logout");
      return response.data;
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  updateUser: (user) => {
    set({
      user,
      isAuthenticated: Boolean(user),
    });
  },
}));

export default useAuthStore;