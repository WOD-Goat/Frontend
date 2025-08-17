import { Typography } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ReactNode } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewStyle,
} from "react-native";

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
  backgroundColor = "#FFFFFF",
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
    if (!title && !showBackButton && !headerRight) return null;

    return (
      <View style={[styles.header, headerStyle]}>
        <View style={styles.headerTop}>
          {showBackButton && (
            <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
              <Ionicons name="arrow-back" size={24} color="#000000" />
            </TouchableOpacity>
          )}
          
          <View style={styles.headerRightContainer}>
            {headerRight}
          </View>
        </View>
        
        {(title || subtitle) && (
          <View style={styles.titleSection}>
            {title && (
              <Text style={[styles.title, Typography.headingLarge]}>
                {title}
              </Text>
            )}
            {subtitle && (
              <Text style={[styles.subtitle, Typography.bodyMedium]}>
                {subtitle}
              </Text>
            )}
          </View>
        )}
      </View>
    );
  };

  const renderContent = () => {
    const contentWithPadding = (
      <View style={[
        styles.content, 
        { paddingHorizontal: contentPadding },
        contentStyle
      ]}>
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
      {footer && (
        <View style={styles.footerContainer}>
          {footer}
        </View>
      )}
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
    paddingTop: 20,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
    marginLeft: -8, // Align with content padding
  },
  headerRightContainer: {
    alignItems: "center",
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
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
});
