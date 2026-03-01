import { Colors, FontFamilies, FontSizes } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type DimensionValue,
} from "react-native";
import { BottomSheet as RNBottomSheet } from "react-native-btr";

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxHeight?: DimensionValue;
  minHeight?: DimensionValue;
  height?: DimensionValue;
}

export function BottomSheet({
  visible,
  onClose,
  title,
  children,
  maxHeight = "85%",
  minHeight = "50%",
  height,
}: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  return (
    <RNBottomSheet
      visible={visible}
      onBackButtonPress={onClose}
      onBackdropPress={onClose}
    >
      <View
        style={[
          styles.bottomSheetContainer,
          { maxHeight, minHeight, height, paddingBottom: (insets.bottom ?? 0) + 20 },
        ]}
      >
        {/* Header */}
        {title && (
          <View style={styles.bottomSheetHeader}>
            <View style={styles.headerSpacer} />
            <Text style={styles.bottomSheetTitle}>{title}</Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={Colors.text.primary} />
            </TouchableOpacity>
          </View>
        )}

        {/* Content */}
        <ScrollView
          contentContainerStyle={[
            styles.bottomSheetContent,
            { paddingBottom: (insets.bottom ?? 0) + 20 },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </View>
    </RNBottomSheet>
  );
}

const styles = StyleSheet.create({
  bottomSheetContainer: {
    backgroundColor: Colors.background.secondary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 20,
  },
  bottomSheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[700],
  },
  headerSpacer: {
    width: 24,
  },
  bottomSheetTitle: {
    flex: 1,
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodyLG,
    color: Colors.text.primary,
    textAlign: "center",
  },
  closeButton: {
    width: 24,
    alignItems: "center",
  },
  bottomSheetContent: {
    paddingBottom: 20,
  },
});
