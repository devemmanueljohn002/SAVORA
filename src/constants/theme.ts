/**
 * SAVORA FOOD design tokens.
 * Brand: premium, modern, Nigerian, food-focused, trustworthy, vibrant.
 * Keep this the single source of truth for color/spacing/type — never
 * hard-code hex values or pixel sizes directly in screens/components.
 */

export const colors = {
  // Primary brand
  primary: "#C1272D", // deep red
  primaryDark: "#8F1D22",
  primaryLight: "#E15761",

  secondary: "#F2994A", // warm orange
  secondaryDark: "#D97C2B",
  secondaryLight: "#FBB878",

  accent: "#1C3D5A", // small amounts of dark blue

  // Neutrals
  background: "#FFFFFF",
  surface: "#FAFAFA",
  charcoal: "#2B2B2B",
  charcoalMuted: "#5C5C5C",
  border: "#E7E7E7",

  // Semantic
  success: "#2E7D32",
  warning: "#F2B705",
  danger: "#D32F2F",
  info: "#1C3D5A",

  // Text
  textPrimary: "#1A1A1A",
  textSecondary: "#6B6B6B",
  textInverse: "#FFFFFF",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radii = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

export const typography = {
  fontFamily: {
    regular: "System",
    medium: "System",
    bold: "System",
  },
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 28,
    display: 34,
  },
  weight: {
    regular: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
  },
};

export const shadow = {
  card: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
};

export const theme = { colors, spacing, radii, typography, shadow };
export type Theme = typeof theme;
