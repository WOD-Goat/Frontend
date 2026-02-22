import { Colors, FontFamilies, FontSizes } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    type DimensionValue
} from "react-native";
import { BottomSheet as RNBottomSheet } from "react-native-btr";

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxHeight?: DimensionValue;
}

export function BottomSheet({
  visible,
  onClose,
  title,
  children,
  maxHeight = "70%",
}: BottomSheetProps) {
  return (
    <RNBottomSheet
      visible={visible}
      onBackButtonPress={onClose}
      onBackdropPress={onClose}
    >
      <View style={[styles.bottomSheetContainer, { maxHeight }]}>
        {/* Handle bar */}
        <View style={styles.bottomSheetHandle} />

        {/* Header */}
        {title && (
          <View style={styles.bottomSheetHeader}>
            <Text style={styles.bottomSheetTitle}>{title}</Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={24} color={Colors.text.secondary} />
            </TouchableOpacity>
          </View>
        )}

        {/* Content */}
        <ScrollView style={styles.bottomSheetContent}>{children}</ScrollView>
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
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.text.tertiary,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  bottomSheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background.primary,
  },
  bottomSheetTitle: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodyLG,
    color: Colors.text.primary,
  },
  bottomSheetContent: {
    maxHeight: 400,
  },
});
