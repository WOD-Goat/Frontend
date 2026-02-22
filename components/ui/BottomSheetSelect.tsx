import { Colors, FontFamilies, FontSizes } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BottomSheet } from "./BottomSheet";

export interface SelectOption<T = any> {
  label: string;
  value: T;
  description?: string;
}

interface BottomSheetSelectProps<T = any> {
  label: string;
  placeholder?: string;
  value: T;
  options: SelectOption<T>[];
  onValueChange: (value: T) => void;
  disabled?: boolean;
}

export function BottomSheetSelect<T = any>({
  label,
  placeholder,
  value,
  options,
  onValueChange,
  disabled = false,
}: BottomSheetSelectProps<T>) {
  const [visible, setVisible] = useState(false);
  const selectedOption = options.find((option) => option.value === value);

  const handleSelect = (selectedValue: T) => {
    onValueChange(selectedValue);
    setVisible(false);
  };

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>
        <TouchableOpacity
          style={[styles.selectButton, disabled && styles.selectButtonDisabled]}
          onPress={() => !disabled && setVisible(true)}
          disabled={disabled}
        >
          <Text
            style={[
              styles.selectText,
              !selectedOption && styles.selectTextPlaceholder,
            ]}
          >
            {selectedOption?.label || placeholder || "Select an option"}
          </Text>
          <Ionicons
            name="chevron-down"
            size={20}
            color={disabled ? Colors.text.tertiary : Colors.text.secondary}
          />
        </TouchableOpacity>
      </View>

      <BottomSheet
        visible={visible}
        onClose={() => setVisible(false)}
        title={label}
      >
        {options.length > 0 ? (
          options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionItem,
                option.value === value && styles.optionItemSelected,
              ]}
              onPress={() => handleSelect(option.value)}
            >
              <View style={styles.optionContent}>
                <Text
                  style={[
                    styles.optionLabel,
                    option.value === value && styles.optionLabelSelected,
                  ]}
                >
                  {option.label}
                </Text>
                {option.description && (
                  <Text style={styles.optionDescription}>
                    {option.description}
                  </Text>
                )}
              </View>
              {option.value === value && (
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={Colors.primary[500]}
                />
              )}
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons
              name="alert-circle-outline"
              size={48}
              color={Colors.text.tertiary}
            />
            <Text style={styles.emptyStateText}>No options available</Text>
          </View>
        )}
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontFamily: FontFamilies.poppinsMedium,
    fontSize: FontSizes.bodySM,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  selectButton: {
    backgroundColor: Colors.background.primary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.text.tertiary,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectButtonDisabled: {
    opacity: 0.5,
  },
  selectText: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodyMD,
    color: Colors.text.primary,
    flex: 1,
  },
  selectTextPlaceholder: {
    color: Colors.text.tertiary,
  },
  optionItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background.primary,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  optionItemSelected: {
    backgroundColor: "rgba(191, 255, 0, 0.1)",
  },
  optionContent: {
    flex: 1,
    marginRight: 12,
  },
  optionLabel: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodyMD,
    color: Colors.text.primary,
  },
  optionLabelSelected: {
    fontFamily: FontFamilies.poppinsSemiBold,
    color: Colors.primary[500],
  },
  optionDescription: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodySM,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateText: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodyMD,
    color: Colors.text.tertiary,
    marginTop: 12,
    textAlign: "center",
  },
});
