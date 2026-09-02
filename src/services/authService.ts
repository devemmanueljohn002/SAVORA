import { apiClient } from "@/api/client";
import type { AuthTokens, User } from "@/types";

export interface RegisterPayload {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  referralCode?: string;
}

export interface LoginPayload {
  identifier: string; // email or phone
  password: string;
}

export const authService = {
  async register(payload: RegisterPayload): Promise<{ user: User } & AuthTokens> {
    const { data } = await apiClient.post("/auth/register", payload);
    return data;
  },

  async login(payload: LoginPayload): Promise<{ user: User } & AuthTokens> {
    const { data } = await apiClient.post("/auth/login", payload);
    return data;
  },

  async logout(): Promise<void> {
    await apiClient.post("/auth/logout");
  },

  async me(): Promise<User> {
    const { data } = await apiClient.get("/auth/me");
    return data;
  },

  async forgotPassword(email: string): Promise<void> {
    await apiClient.post("/auth/forgot-password", { email });
  },

  /**
   * Verifies a 6-digit OTP sent to the user's email.
   * `purpose` distinguishes a fresh-registration verification from a
   * password-reset verification, since the backend likely issues and
   * checks these codes against different flows/expiries.
   */
  async verifyOtp(payload: {
    email: string;
    code: string;
    purpose: "register" | "reset";
  }): Promise<{ verified: true; resetToken?: string }> {
    const { data } = await apiClient.post("/auth/verify-email", payload);
    return data;
  },

  async resendVerificationCode(payload: { email: string; purpose: "register" | "reset" }): Promise<void> {
    await apiClient.post("/auth/resend-code", payload);
  },

  /**
   * Completes password reset using the resetToken returned by verifyOtp.
   * Kept separate from the token-based signature below so either backend
   * contract (OTP-then-token, or direct link-token) can be supported —
   * confirm which one the real Express routes implement before Phase 4.
   */
  async resetPassword(payload: { resetToken: string; newPassword: string }): Promise<void> {
    await apiClient.post("/auth/reset-password", payload);
  },
};
