import { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';
import { Theme, Typography } from '../../constants';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
}: ButtonProps) {
  const getButtonStyle = (): ViewStyle[] => {
    const baseStyle: ViewStyle[] = [styles.button, styles[size] as ViewStyle];
    
    if (fullWidth) {
      baseStyle.push(styles.fullWidth as ViewStyle);
    }
    
    if (disabled || loading) {
      baseStyle.push(styles.disabled as ViewStyle);
    } else {
      baseStyle.push(styles[variant] as ViewStyle);
    }
    
    return baseStyle;
  };

  const getTextStyle = (): TextStyle[] => {
    const baseStyle: TextStyle[] = [styles.text, styles[`${size}Text`] as TextStyle];
    
    if (disabled || loading) {
      baseStyle.push(styles.disabledText as TextStyle);
    } else {
      baseStyle.push(styles[`${variant}Text`] as TextStyle);
    }
    
    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'primary' ? Theme.colors.text.inverse : Theme.common.primary} 
        />
      ) : (
        <>
          {icon}
          <Text style={getTextStyle()}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Theme.borderRadius.md,
    gap: Theme.spacing.sm,
  },
  
  // Sizes
  small: {
    height: Theme.layout.buttonHeight.small,
    paddingHorizontal: Theme.spacing.base,
  },
  medium: {
    height: Theme.layout.buttonHeight.medium,
    paddingHorizontal: Theme.spacing.xl,
  },
  large: {
    height: Theme.layout.buttonHeight.large,
    paddingHorizontal: Theme.spacing['2xl'],
  },
  
  // Variants
  primary: {
    backgroundColor: Theme.common.primary,
    ...Theme.shadows.small,
  },
  secondary: {
    backgroundColor: Theme.common.secondary,
    ...Theme.shadows.small,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Theme.common.primary,
  },
  danger: {
    backgroundColor: Theme.common.error,
    ...Theme.shadows.small,
  },
  
  // States
  disabled: {
    backgroundColor: Theme.colors.neutral[200],
    opacity: 0.6,
    ...Theme.shadows.none,
  },
  fullWidth: {
    width: '100%',
  },
  
  // Text styles
  text: {
    fontWeight: '600',
  },
  smallText: {
    ...Typography.buttonSmall,
  },
  mediumText: {
    ...Typography.buttonMedium,
  },
  largeText: {
    ...Typography.buttonLarge,
  },
  
  // Text variants
  primaryText: {
    color: Theme.colors.text.inverse,
  },
  secondaryText: {
    color: Theme.colors.text.inverse,
  },
  outlineText: {
    color: Theme.common.primary,
  },
  dangerText: {
    color: Theme.colors.text.inverse,
  },
  disabledText: {
    color: Theme.colors.text.secondary,
  },
});
