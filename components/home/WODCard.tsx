import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { mascotAssets } from "../../assets/images";
import { Colors, FontFamilies, FontSizes } from "../../constants";
import { Image } from "expo-image";
import { Button } from "../ui";

interface WODCardProps {
  title?: string;
  workoutType: string;
  coach: string;
  workoutCount: number;
  onPress: () => void;
}

export default function WODCard({
  title = "Today's WOD",
  workoutType,
  coach,
  workoutCount,
  onPress,
}: WODCardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      <View style={[styles.card]}>
        <View style={styles.content}>
          <View style={styles.leftContent}>
            <Text style={styles.workoutType}>{workoutType}</Text>

            <View style={styles.details}>
              <Text style={styles.detailsTitle}>Details:</Text>
              <Text style={styles.detailText}>WOD by Coach {coach}</Text>
              <Text style={styles.detailText}>
                {workoutCount} Workout{workoutCount !== 1 ? "s" : ""}
              </Text>
            </View>
            <Button
              title="Let's Go →"
              onPress={onPress}
              variant="primary"
              rounded
              size="medium"
            />
          </View>

          <Image source={mascotAssets.upcoming} style={styles.mascot} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  title: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.headingXL,
    color: "#FFFFFF",
    marginBottom: 16,
  },
  card: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 24,
    overflow: "hidden",
  },
  content: {
    flexDirection: "row",
    padding: 24,
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftContent: {
    flex: 1,
    paddingRight: 16,
  },
  workoutType: {
    fontFamily: FontFamilies.spartanMedium,
    fontSize: FontSizes.displayMD,
    color: "#FFFFFF",
    marginBottom: 16,
  },
  details: {
    marginBottom: 20,
  },
  detailsTitle: {
    fontFamily: FontFamilies.spartanSemiBold,
    fontSize: FontSizes.bodyLG,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  detailText: {
    fontFamily: FontFamilies.spartanRegular,
    fontSize: FontSizes.bodyLG,
    color: "#FFFFFF",
    opacity: 0.9,
    lineHeight: 20,
  },
  button: {
    backgroundColor: Colors.primary[500],
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 50,
    alignSelf: "flex-start",
    width: "100%",
  },
  buttonText: {
    fontFamily: FontFamilies.poppinsBold,
    fontSize: FontSizes.bodyMD,
    color: "#FFFFFF",
    textAlign: "center",
  },
  rightContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  mascot: {
    width: "35%",
    height: "100%",
    resizeMode: "contain",
  },
});
