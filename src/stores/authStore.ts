import { create } from "zustand";
import { secureStorage } from "@/utils/secureStorage";
import { authService } from "@/services/authService";
import { registerSessionExpiredHandler } from "@/api/client";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  status: "idle" | "loading" | "authenticated" | "unauthenticated";
  hydrate: () => Promise<void>;
  login: (identifier: string, password: string) => Promise<void>;
  register: (payload: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    referralCode?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: "idle",

  hydrate: async () => {
    set({ status: "loading" });
    const token = await secureStorage.getAccessToken();
    if (!token) {
      set({ status: "unauthenticated", user: null });
      return;
    }
    try {
      const user = await authService.me();
      set({ status: "authenticated", user });
    } catch {
      await secureStorage.clearTokens();
      set({ status: "unauthenticated", user: null });
    }
  },

  login: async (identifier: string, password: string) => {
    set({ status: "loading" });
    try {
      const { user, accessToken, refreshToken } = await authService.login({ identifier, password });
      await secureStorage.setTokens(accessToken, refreshToken);
      set({ status: "authenticated", user });
    } catch (error) {
      set({ status: "unauthenticated", user: null });
      throw error;
    }
  },

  register: async (payload) => {
    set({ status: "loading" });
    try {
      const { user, accessToken, refreshToken } = await authService.register(payload);
      await secureStorage.setTokens(accessToken, refreshToken);
      set({ status: "authenticated", user });
    } catch (error) {
      set({ status: "unauthenticated", user: null });
      throw error;
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore network errors on logout — clear local session regardless.
    }
    await secureStorage.clearTokens();
    set({ status: "unauthenticated", user: null });
  },
}));

// Wire the API client's 401-after-refresh-failure handler to this store,
// so an expired session anywhere in the app routes back to login.
registerSessionExpiredHandler(() => {
  useAuthStore.setState({ status: "unauthenticated", user: null });
});
