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
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={[
        styles.inputContainer,
        styles[variant],
        isFocused && styles.focused,
        error && styles.error,
      ]}>
        {leftIcon && (
          <Ionicons 
            name={leftIcon} 
            size={20} 
            color={error ? '#FF3B30' : isFocused ? '#007AFF' : '#8E8E93'} 
          />
        )}
        
        <TextInput
          style={[styles.input, leftIcon && styles.inputWithLeftIcon]}
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
            color={error ? '#FF3B30' : isFocused ? '#007AFF' : '#8E8E93'}
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
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
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
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  error: {
    borderColor: '#FF3B30',
    borderWidth: 1,
  },
  
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1C1C1E',
  },
  inputWithLeftIcon: {
    marginLeft: 0,
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    marginTop: 4,
  },
});
