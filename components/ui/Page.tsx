import { Colors, Typography } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface PageProps {
  children: ReactNode;

  // Header props
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  headerRight?: ReactNode;

  // Layout props
  scrollable?: boolean;
  keyboardAvoiding?: boolean;
  backgroundColor?: string;
  contentPadding?: number;

  // Footer props
  footer?: ReactNode;

  // Style overrides
  contentStyle?: ViewStyle;
  headerStyle?: ViewStyle;
}

export default function Page({
  children,
  title,
  subtitle,
  showBackButton = true,
  onBackPress,
  headerRight,
  scrollable = true,
  keyboardAvoiding = true,
  backgroundColor = Colors.background.primary,
  contentPadding = 24,
  footer,
  contentStyle,
  headerStyle,
}: PageProps) {
  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  const renderHeader = () => {
    if (!title && !showBackButton && !headerRight && !subtitle) return null;

    return (
      <View style={[styles.header, headerStyle]}>
        <View style={styles.headerTop}>
          {showBackButton && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackPress}
            >
              <Ionicons name="arrow-back" size={24} color="#000000" />
            </TouchableOpacity>
          )}

          {title && (
            <Text style={[styles.headerTitle, Typography.headingMedium]}>
              {title}
            </Text>
          )}

          <View style={styles.headerRightContainer}>{headerRight}</View>
        </View>

        {subtitle && (
          <View style={styles.subtitleSection}>
            <Text style={[styles.subtitle, Typography.bodyMedium]}>
              {subtitle}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderContent = () => {
    const contentWithPadding = (
      <View
        style={[
          styles.content,
          { paddingHorizontal: contentPadding },
          contentStyle,
        ]}
      >
        {children}
      </View>
    );

    if (scrollable) {
      return (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {contentWithPadding}
        </ScrollView>
      );
    }

    return contentWithPadding;
  };

  const pageContent = (
    <View style={[styles.container, { backgroundColor }]}>
      {renderHeader()}
      {renderContent()}
      {footer && <View style={styles.footerContainer}>{footer}</View>}
    </View>
  );

  if (keyboardAvoiding) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          {pageContent}
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      {pageContent}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },

  // Header styles
  header: {
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 40,
  },
  backButton: {
    padding: 8,
    marginLeft: -8, // Align with content padding
  },
  headerTitle: {
    flex: 1,
    color: "#000000",
    marginLeft: 8,
  },
  headerRightContainer: {
    alignItems: "center",
  },
  subtitleSection: {
    paddingTop: 8,
    alignItems: "flex-start",
  },
  titleSection: {
    alignItems: "flex-start",
  },
  title: {
    color: "#000000",
    marginBottom: 8,
  },
  subtitle: {
    color: "#666666",
  },

  // Content styles
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
  },

  // Footer styles
  footerContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 8,
  },
});
