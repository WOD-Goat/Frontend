// Typography system for WODGoat Fitness App
import { Dimensions, TextStyle } from 'react-native';

// Get screen dimensions for responsive sizing
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Base dimensions (iPhone 12/13 as reference: 390x844)
const baseWidth = 390;
const baseHeight = 844;

// Calculate responsive multipliers
const widthMultiplier = screenWidth / baseWidth;
const heightMultiplier = screenHeight / baseHeight;
const fontMultiplier = Math.min(widthMultiplier, heightMultiplier);

// Responsive font size function
export const responsiveSize = (size: number): number => {
  return Math.round(size * fontMultiplier);
};

// Font families
export const FontFamilies = {
  // League Spartan for headings and display text
  spartanThin: 'LeagueSpartan-Thin',
  spartanExtraLight: 'LeagueSpartan-ExtraLight',
  spartanLight: 'LeagueSpartan-Light',
  spartanRegular: 'LeagueSpartan-Regular',
  spartanMedium: 'LeagueSpartan-Medium',
  spartanSemiBold: 'LeagueSpartan-SemiBold',
  spartanBold: 'LeagueSpartan-Bold',
  spartanExtraBold: 'LeagueSpartan-ExtraBold',
  spartanBlack: 'LeagueSpartan-Black',
  
  // Poppins for body text and labels
  poppinsThin: 'Poppins-Thin',
  poppinsExtraLight: 'Poppins-ExtraLight',
  poppinsLight: 'Poppins-Light',
  poppinsRegular: 'Poppins-Regular',
  poppinsMedium: 'Poppins-Medium',
  poppinsSemiBold: 'Poppins-SemiBold',
  poppinsBold: 'Poppins-Bold',
  poppinsExtraBold: 'Poppins-ExtraBold',
  poppinsBlack: 'Poppins-Black',
} as const;

export const FontSizes = {
  // Display sizes (largest)
  displayXL: responsiveSize(40),
  displayLG: responsiveSize(36),
  displayMD: responsiveSize(30),
  
  // Heading sizes
  heading2XL: responsiveSize(24),
  headingXL: responsiveSize(20),
  headingLG: responsiveSize(18),
  headingMD: responsiveSize(16),
  headingSM: responsiveSize(14),
  headingXS: responsiveSize(12),
  
  // Body text sizes
  bodyXL: responsiveSize(20),
  bodyLG: responsiveSize(18),
  bodyMD: responsiveSize(16),
  bodySM: responsiveSize(14),
  bodyXS: responsiveSize(12),
  
  // Label sizes
  labelLG: responsiveSize(18),
  labelMD: responsiveSize(16),
  labelSM: responsiveSize(14),
  labelXS: responsiveSize(12),
} as const;

export const FontWeights = {
  thin: '100',
  extraLight: '200',
  light: '300',
  normal: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
  extraBold: '800',
  black: '900',
} as const;

export const LineHeights = {
  none: 1,
  tight: 1.25,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2,
} as const;

export const Typography = {
  // Display text (largest sizes for hero sections, main titles) - League Spartan
  displayLarge: {
    fontSize: FontSizes.displayXL,
    fontFamily: FontFamilies.poppinsBold,
    lineHeight: FontSizes.displayXL * LineHeights.tight,
  } as TextStyle,

  displayMedium: {
    fontSize: FontSizes.displayLG,
    fontFamily: FontFamilies.poppinsBold,
    lineHeight: FontSizes.displayLG * LineHeights.tight,
  } as TextStyle,

  displaySmall: {
    fontSize: FontSizes.displayMD,
    fontFamily: FontFamilies.poppinsBold,
    lineHeight: FontSizes.displayMD * LineHeights.tight,
  } as TextStyle,

  // Heading text (section headers, card titles) - Poppins
  headingLarge: {
    fontSize: FontSizes.heading2XL,
    fontFamily: FontFamilies.poppinsSemiBold,
    lineHeight: FontSizes.heading2XL * LineHeights.snug,
  } as TextStyle,

  headingMedium: {
    fontSize: FontSizes.headingXL,
    fontFamily: FontFamilies.poppinsSemiBold,
    lineHeight: FontSizes.headingXL * LineHeights.snug,
  } as TextStyle,

  headingSmall: {
    fontSize: FontSizes.headingLG,
    fontFamily: FontFamilies.poppinsSemiBold,
    lineHeight: FontSizes.headingLG * LineHeights.normal,
  } as TextStyle,

  // Body text (paragraphs, descriptions) - League Spartan
  bodyLarge: {
    fontSize: FontSizes.bodyLG,
    fontFamily: FontFamilies.spartanRegular,
    lineHeight: FontSizes.bodyLG * LineHeights.relaxed,
  } as TextStyle,

  bodyMedium: {
    fontSize: FontSizes.bodyMD,
    fontFamily: FontFamilies.spartanRegular,
    lineHeight: FontSizes.bodyMD * LineHeights.none,
  } as TextStyle,

  bodySmall: {
    fontSize: FontSizes.bodySM,
    fontFamily: FontFamilies.spartanRegular,
    lineHeight: FontSizes.bodySM * LineHeights.normal,
  } as TextStyle,

  // Label text (form labels, captions, metadata) - League Spartan
  labelLarge: {
    fontSize: FontSizes.labelLG,
    fontFamily: FontFamilies.spartanMedium,
    lineHeight: FontSizes.labelLG * LineHeights.normal,
  } as TextStyle,

  labelMedium: {
    fontSize: FontSizes.labelMD,
    fontFamily: FontFamilies.spartanMedium,
    lineHeight: FontSizes.labelMD * LineHeights.normal,
  } as TextStyle,

  labelSmall: {
    fontSize: FontSizes.labelSM,
    fontFamily: FontFamilies.spartanSemiBold,
    lineHeight: FontSizes.labelSM * LineHeights.tight,
  } as TextStyle,

  // Special text styles
  caption: {
    fontSize: FontSizes.labelXS,
    fontFamily: FontFamilies.spartanRegular,
    lineHeight: FontSizes.labelXS * LineHeights.normal,
  } as TextStyle,

  overline: {
    fontSize: FontSizes.labelXS,
    fontFamily: FontFamilies.spartanSemiBold,
    lineHeight: FontSizes.labelXS * LineHeights.normal,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  } as TextStyle,

  // Button text (interactive elements) - League Spartan
  buttonLarge: {
    fontSize: FontSizes.labelLG,
    fontFamily: FontFamilies.spartanBold,
    lineHeight: FontSizes.labelLG * LineHeights.none,
  } as TextStyle,

  buttonMedium: {
    fontSize: FontSizes.labelMD,
    fontFamily: FontFamilies.spartanSemiBold,
    lineHeight: FontSizes.labelMD * LineHeights.none,
  } as TextStyle,

  buttonSmall: {
    fontSize: FontSizes.labelSM,
    fontFamily: FontFamilies.spartanSemiBold,
    lineHeight: FontSizes.labelSM * LineHeights.none,
  } as TextStyle,

} as const;
