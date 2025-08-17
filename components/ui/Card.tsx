import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

interface CardProps {
  children: ReactNode;
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

export default function Card({ 
  children, 
  variant = 'elevated', 
  padding = 'medium',
  style 
}: CardProps) {
  return (
    <View style={[
      styles.card,
      styles[variant],
      styles[`${padding}Padding`],
      style
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  
  // Variants
  elevated: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  outlined: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  filled: {
    backgroundColor: '#F2F2F7',
  },
  
  // Padding variants
  nonePadding: {
    padding: 0,
  },
  smallPadding: {
    padding: 12,
  },
  mediumPadding: {
    padding: 16,
  },
  largePadding: {
    padding: 24,
  },
});
