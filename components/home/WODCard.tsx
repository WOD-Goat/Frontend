import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { mascotAssets } from "../../assets/images";
import { Colors, FontFamilies, FontSizes } from "../../constants";

interface WODCardProps {
  onPress: () => void;
}

export default function WODCard({ onPress }: WODCardProps) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
      <View style={styles.card}>
        <View style={styles.content}>
          <Image source={mascotAssets.upcoming} style={styles.mascot} />
          <View style={styles.textContent}>
            <Text style={styles.heading}>Ready to crush it?</Text>
            <Text style={styles.subtext}>Check out your upcoming workout</Text>
          </View>
          <View style={styles.arrowCircle}>
            <Ionicons
              name="arrow-forward"
              size={18}
              color={Colors.text.inverse}
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.secondary[500],
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.primary[500] + "35",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 18,
    gap: 14,
  },
  mascot: {
    width: 72,
    height: 72,
    resizeMode: "contain",
  },
  textContent: {
    flex: 1,
    gap: 2,
  },
  heading: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.headingMD,
    color: Colors.text.inverse,
  },
  subtext: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodyXS,
    color: Colors.text.secondary,
  },
  arrowCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary[500],
    alignItems: "center",
    justifyContent: "center",
  },
});
