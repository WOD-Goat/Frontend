import { Colors, FontFamilies, FontSizes } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

export default function PRHeader() {
  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>Personal Records</Text>
        <Text style={styles.subtitle}>
          Track your best lifts and achievements
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontFamily: FontFamilies.poppinsBold,
    fontSize: FontSizes.heading2XL,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: FontFamilies.spartanMedium,
    fontSize: FontSizes.bodyMD,
    color: Colors.text.primary,
    lineHeight: 20,
  },
});
