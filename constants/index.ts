// Main constants export file
export * from './Colors';
export * from './Layout';
export * from './Typography';

// Theme object for easy access to all design tokens
import { Colors, CommonColors } from './Colors';
import { BorderRadius, Layout, Shadows, Spacing } from './Layout';
import { FontSizes, FontWeights, Typography } from './Typography';

export const Theme = {
  colors: Colors,
  common: CommonColors,
  typography: Typography,
  fonts: {
    sizes: FontSizes,
    weights: FontWeights,
  },
  spacing: Spacing,
  borderRadius: BorderRadius,
  layout: Layout,
  shadows: Shadows,
} as const;
