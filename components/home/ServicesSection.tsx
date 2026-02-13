import { useRouter } from "expo-router";
import {
    Image,
    ImageSourcePropType,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Colors } from "../../constants/Colors";
import { Typography } from "../../constants/Typography";

interface Service {
  id: string;
  title: string;
  icon: string;
  route: string;
}

const services: Service[] = [
  {
    id: "crossfit",
    title: "Crossfit",
    icon: "",
    route: "/services/crossfit",
  },
  {
    id: "gym",
    title: "Gym",
    icon: "",
    route: "/services/gym",
  },
  {
    id: "performance",
    title: "Performance",
    icon: "",
    route: "/services/performance",
  },
  {
    id: "mobility",
    title: "Mobility",
    icon: "",
    route: "/services/mobility",
  },
  {
    id: "fitmax",
    title: "Fit Max",
    icon: "",
    route: "/services/fitmax",
  },
];

export default function ServicesSection() {
  const router = useRouter();

  const handleServicePress = (route: string) => {
    router.push(route as any);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>WODGoat Services</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        style={styles.scrollView}
      >
        {services.map((service, index) => (
          <TouchableOpacity
            key={service.id}
            style={[styles.serviceItem]}
            onPress={() => handleServicePress(service.route)}
            activeOpacity={0.7}
          >
            <View style={styles.circleContainer}>
              <Image
                source={service.icon as ImageSourcePropType}
                style={styles.serviceIcon}
              />
            </View>
            <Text style={styles.serviceTitle}>{service.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  title: {
    ...Typography.headingSmall,
    color: Colors.text.primary,
    marginBottom: 20,
  },
  scrollView: {
    paddingLeft: 0,
  },
  scrollContainer: {
    paddingRight: 20,
  },
  serviceItem: {
    alignItems: "center",
    width: 68,
    marginRight: 10,
  },
  circleContainer: {
    width: 64,
    height: 64,
    borderRadius: 30,
    backgroundColor: Colors.secondary[500],
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    shadowColor: Colors.shadow.dark,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceIcon: {
    width: 42,
    height: 42,
  },
  serviceTitle: {
    ...Typography.labelSmall,
    color: Colors.text.primary,
    textAlign: "center",
  },
});
