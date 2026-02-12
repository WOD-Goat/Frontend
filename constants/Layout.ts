// Spacing and Layout constants for WODGoat Fitness App

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  "2xl": 32,
  "3xl": 40,
  "4xl": 48,
  "5xl": 64,
  "6xl": 80,
  "7xl": 96,
  "8xl": 128,
} as const;

export const BorderRadius = {
  none: 0,
  xs: 2,
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  full: 9999,
} as const;

export const Layout = {
  // Container widths
  containerPadding: Spacing.base,
  sectionPadding: Spacing.xl,

  // Card spacing
  cardPadding: Spacing.base,
  cardGap: Spacing.base,

  // Component heights
  buttonHeight: {
    small: 32,
    medium: 44,
    large: 56,
  },

  inputHeight: {
    small: 32,
    medium: 44,
    large: 56,
  },

  // Header heights
  headerHeight: 56,
  tabBarHeight: 80,

  // Icon sizes
  iconSize: {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
    "2xl": 40,
    "3xl": 48,
  },

  // Screen margins
  screenHorizontal: Spacing.base,
  screenVertical: Spacing.lg,
} as const;

export const Shadows = {
  none: {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },

  small: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  medium: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },

  large: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },

  xl: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 16,
  },
} as const;

// Common layout patterns
export const Layouts = {
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  centerHorizontal: {
    alignItems: "center",
  },

  centerVertical: {
    justifyContent: "center",
  },

  spaceBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  column: {
    flexDirection: "column",
  },
} as const;
