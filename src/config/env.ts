/**
 * Centralized, typed access to environment configuration.
 * Never import process.env directly elsewhere — always go through this file.
 */

type Environment = "development" | "staging" | "production";

function required(name: string, value: string | undefined): string {
  if (!value) {
    // In development, fail loudly so misconfiguration is caught early.
    // In production, fall back to an empty string rather than crashing the app.
    if (__DEV__) {
      throw new Error(`Missing required environment variable: ${name}`);
    }
    return "";
  }
  return value;
}

export const env = {
  ENVIRONMENT: (process.env.EXPO_PUBLIC_ENVIRONMENT ?? "development") as Environment,
  API_URL: required("EXPO_PUBLIC_API_URL", process.env.EXPO_PUBLIC_API_URL),
  PAYSTACK_PUBLIC_KEY: process.env.EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY ?? "",
  FLUTTERWAVE_PUBLIC_KEY: process.env.EXPO_PUBLIC_FLUTTERWAVE_PUBLIC_KEY ?? "",
  IS_DEV: (process.env.EXPO_PUBLIC_ENVIRONMENT ?? "development") === "development",
  IS_PROD: process.env.EXPO_PUBLIC_ENVIRONMENT === "production",
};
