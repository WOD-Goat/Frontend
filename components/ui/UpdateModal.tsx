import { APP_CONFIG } from "@/config/app";
import { FontFamilies, FontSizes, Theme } from "@/constants";
import { responsiveSize } from "@/constants/Typography";
import { Image } from "expo-image";
import { Linking, Modal, Platform, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Button from "./Button";

const IMAGE_SIZE = responsiveSize(220);

interface UpdateModalProps {
  visible: boolean;
}

export default function UpdateModal({ visible }: UpdateModalProps) {
  const insets = useSafeAreaInsets();

  const handleUpdate = async () => {
    const url =
      Platform.OS === "ios"
        ? `itms-apps://apps.apple.com/app/id${APP_CONFIG.IOS_APP_STORE_ID}`
        : `market://details?id=${APP_CONFIG.ANDROID_PACKAGE}`;

    const fallbackUrl =
      Platform.OS === "ios"
        ? `https://apps.apple.com/app/id${APP_CONFIG.IOS_APP_STORE_ID}`
        : `https://play.google.com/store/apps/details?id=${APP_CONFIG.ANDROID_PACKAGE}`;

    const canOpen = await Linking.canOpenURL(url);
    await Linking.openURL(canOpen ? url : fallbackUrl);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.card,
            { paddingBottom: Math.max(insets.bottom, Theme.spacing["2xl"]) },
          ]}
        >
          <Text style={styles.title}>Update Required</Text>
          <Image
            source={require("../../assets/images/rest.png")}
            style={styles.image}
            contentFit="contain"
          />
          <Text style={styles.body}>
            A new version of WODGoat is available. Please update to continue.
          </Text>
          <Button
            title="Update Now"
            onPress={handleUpdate}
            variant="primary"
            size="large"
            fullWidth
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "flex-end",
  },
  card: {
    backgroundColor: Theme.colors.secondary[700],
    borderTopLeftRadius: Theme.borderRadius.xl,
    borderTopRightRadius: Theme.borderRadius.xl,
    paddingTop: Theme.spacing["2xl"],
    paddingHorizontal: Theme.spacing["2xl"],
    gap: Theme.spacing.lg,
  },
  image: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    alignSelf: "center",
  },
  title: {
    fontFamily: FontFamilies.spartanBold,
    fontSize: FontSizes.heading2XL,
    color: Theme.colors.text.primary,
    textAlign: "center",
  },
  body: {
    fontFamily: FontFamilies.spartanMedium,
    fontSize: FontSizes.bodyMD,
    color: Theme.colors.text.secondary,
    textAlign: "center",
    lineHeight: FontSizes.bodyMD * 1.6,
  },
});
