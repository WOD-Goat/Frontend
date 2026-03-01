import { Colors, FontFamilies, FontSizes, responsiveSize, Typography } from '@/constants';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  placeholder?: string;
  error?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  variant?: 'default' | 'outlined' | 'filled';
}

export default function Input({
  label,
  placeholder,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  variant = 'outlined',
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label]}>{label}</Text>}

      <View style={[
        styles.inputContainer,
        styles[variant],
        isFocused && styles.focused,
        error && styles.error,
        props.multiline && { height: responsiveSize(120), paddingVertical: 12 },
      ]}>

        <TextInput
          style={[styles.input]}
          placeholder={placeholder}
          placeholderTextColor="#999999"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        
        {rightIcon && (
          <Ionicons
            name={rightIcon}
            size={20}
            color={error ? Colors.error[500] : isFocused ? Colors.secondary[500] : '#8E8E93'}
            onPress={onRightIconPress}
          />
        )}
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  label: {
    color: Colors.text.primary,
    marginBottom: 8,
    fontSize: FontSizes.labelMD,
    fontFamily: FontFamilies.spartanMedium,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 12,
    height: responsiveSize(55),
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: FontSizes.bodySM,
  },
  
  // Variants
  default: {
    backgroundColor: '#F2F2F7',
  },
  outlined: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filled: {
    backgroundColor: '#F2F2F7',
  },
  
  // States
  focused: {
    borderColor: Colors.primary[300],
    borderWidth: 2,
  },
  error: {
    borderColor: Colors.error[500],
    borderWidth: 1,
  },
  errorText: {
    fontSize: FontSizes.bodyXS,
    color: Colors.error[500],
    marginTop: 4,
  },
});
