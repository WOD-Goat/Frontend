// Color Palette for WODGoat Fitness App
export const Colors = {
  // Primary Colors (Yellow/Gold)
  primary: {
    50: '#FFFEF0',
    100: '#FFFDE1',
    200: '#FFFBC3',
    300: '#FFF8A4',
    400: '#FAF437',
    500: '#F8E805', // Main primary color
    600: '#C6BA04',
    700: '#948B03',
    800: '#625D02',
    900: '#312E01',
  },

  // Secondary Colors (Dark Gray)
  secondary: {
    50: '#F5F5F5',
    100: '#EBEBEB',
    200: '#D7D7D7',
    300: '#C3C3C3',
    400: '#9F9F9F',
    500: '#2E2E2E', // Main secondary color
    600: '#252525',
    700: '#1C1C1C',
    800: '#131313',
    900: '#0A0A0A',
  },

  // Success Colors (Green)
  success: {
    50: '#E8F5E8',
    100: '#D1EBD1',
    200: '#A3D7A3',
    300: '#75C375',
    400: '#47AF47',
    500: '#34C759', // Main success color
    600: '#2A9F47',
    700: '#1F7735',
    800: '#154F23',
    900: '#0A2712',
  },

  // Error/Danger Colors (Red)
  error: {
    50: '#FFE6E6',
    100: '#FFCCCC',
    200: '#FF9999',
    300: '#FF6666',
    400: '#FF3333',
    500: '#FF3B30', // Main error color
    600: '#CC2F26',
    700: '#99231D',
    800: '#661713',
    900: '#330C0A',
  },

  // Warning Colors (Yellow)
  warning: {
    50: '#FFFBE6',
    100: '#FFF7CC',
    200: '#FFEF99',
    300: '#FFE766',
    400: '#FFDF33',
    500: '#FFD60A', // Main warning color
    600: '#CCAB08',
    700: '#998006',
    800: '#665504',
    900: '#332A02',
  },

  // Neutral/Gray Colors
  neutral: {
    50: '#FAFAFA',
    100: '#F2F2F7',
    200: '#E5E5EA',
    300: '#D1D1D6',
    400: '#C7C7CC',
    500: '#8E8E93',
    600: '#636366',
    700: '#48484A',
    800: '#1C1C1E',
    900: '#000000',
  },

  // Background Colors
  background: {
    primary: '#FFFFFF',
    secondary: '#F2F2F7',
    tertiary: '#FAFAFA',
    dark: '#1C1C1E',
    overlay: 'rgba(0, 0, 0, 0.4)',
  },

  // Text Colors
  text: {
    primary: '#1C1C1E',
    secondary: '#8E8E93',
    tertiary: '#C7C7CC',
    inverse: '#FFFFFF',
    link: '#F8E805',
    success: '#34C759',
    error: '#FF3B30',
    warning: '#FFD60A',
  },

  // Border Colors
  border: {
    light: '#E5E5EA',
    medium: '#D1D1D6',
    dark: '#C7C7CC',
    focus: '#F8E805',
    error: '#FF3B30',
  },

  // Shadow Colors
  shadow: {
    light: 'rgba(0, 0, 0, 0.1)',
    medium: 'rgba(0, 0, 0, 0.15)',
    dark: 'rgba(0, 0, 0, 0.25)',
  },

  // Fitness-specific colors
  fitness: {
    cardio: '#FF6B6B',
    strength: '#4ECDC4',
    flexibility: '#45B7D1',
    rest: '#FFA07A',
    nutrition: '#98D8C8',
  },

  // Gradient combinations for backgrounds/cards
  gradients: {
    primary: ['#F8E805', '#C6BA04'],
    secondary: ['#2E2E2E', '#1C1C1C'],
    success: ['#34C759', '#2A9F47'],
    sunset: ['#FF6B6B', '#F8E805'],
    dark: ['#2E2E2E', '#000000'],
    fitness: ['#F8E805', '#2E2E2E'],
  },
} as const;

// Quick access to commonly used colors
export const CommonColors = {
  primary: Colors.primary[500],
  secondary: Colors.secondary[500],
  success: Colors.success[500],
  error: Colors.error[500],
  warning: Colors.warning[500],
  
  background: Colors.background.primary,
  backgroundSecondary: Colors.background.secondary,
  
  textPrimary: Colors.text.primary,
  textSecondary: Colors.text.secondary,
  
  borderLight: Colors.border.light,
  borderMedium: Colors.border.medium,
} as const;
