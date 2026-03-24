import { mascotAssets } from "@/assets/images";
import { Gap, Page } from "@/components";
import { Colors, FontFamilies, FontSizes } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

export default function GroupsScreen() {
  return (
    <Page showBackButton={false} contentStyle={{ flex: 1 }} scrollable={false}>
      <View style={styles.container}>
        <Image
          source={mascotAssets.coach}
          style={styles.mascot}
          contentFit="contain"
        />
        <Gap size={24} />
        <Text style={styles.title}>Groups</Text>
        <Gap size={8} />
        <Text style={styles.subtitle}>Coming Soon</Text>
        <Gap size={16} />
        <View style={styles.featureList}>
          <FeatureItem
            icon="people"
            text="Join groups with a code"
          />
          <FeatureItem
            icon="barbell"
            text="Workout together with your team"
          />
          <FeatureItem
            icon="shield-checkmark"
            text="Admin controls for managing groups"
          />
        </View>
      </View>
    </Page>
  );
}

function FeatureItem({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIconBg}>
        <Ionicons
          name={icon as any}
          size={18}
          color={Colors.primary[500]}
        />
      </View>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  mascot: {
    width: 140,
    height: 140,
  },
  title: {
    fontFamily: FontFamilies.poppinsBold,
    fontSize: FontSizes.heading2XL,
    color: Colors.text.primary,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: FontFamilies.spartanMedium,
    fontSize: FontSizes.headingLG,
    color: Colors.primary[500],
    textAlign: "center",
  },
  featureList: {
    gap: 14,
    width: "100%",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.secondary[600],
    borderRadius: 14,
    padding: 14,
  },
  featureIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary[500] + "18",
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodyMD,
    color: Colors.text.secondary,
    flex: 1,
  },
});
