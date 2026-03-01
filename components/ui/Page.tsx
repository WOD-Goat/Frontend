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
  contentPadding = 16,
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
              <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
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
    marginLeft: -8,
   },
  headerTitle: {
    flex: 1,
    color: Colors.text.primary,
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
    color: Colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    color: Colors.text.primary,
  },

  // Content styles
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 56,
  },
  content: {
    paddingBottom: 42,
  },

  // Footer styles
  footerContainer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderTopWidth: 1,
    borderColor: Colors.neutral[700],
    backgroundColor: Colors.secondary[600],
    paddingBottom: 16,
  },
});
