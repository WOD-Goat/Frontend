import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { Colors, Typography } from "../../constants";
import Button from "./Button";

interface NoInternetScreenProps {
  onRetry: () => void;
  loading?: boolean;
}

export default function NoInternetScreen({
  onRetry,
  loading = false,
}: NoInternetScreenProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="cloud-offline-outline" size={64} color={Colors.text.secondary} />
      <Text style={[styles.title, Typography.headingLarge]}>No Internet Connection</Text>
      <Text style={styles.subtitle}>
        WODGoat requires an active internet connection. Please check your
        settings and try again.
      </Text>
      <Button
        title="Try Again"
        onPress={onRetry}
        size="large"
        loading={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.background.primary,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    gap: 16,
    zIndex: 9999,
  },
  title: {
    color: Colors.text.primary,
    textAlign: "center",
  },
  subtitle: {
    color: Colors.text.secondary,
    textAlign: "center",
    fontSize: 15,
    lineHeight: 22,
  },
});
