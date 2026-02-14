import { Colors, responsiveSize, Typography } from "@/constants";
import { router } from "expo-router";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

// Mock subscription data with banner images
const subscriptionOffers = [
  {
    id: "premium-monthly",
    backgroundImage: '',
  },
  {
    id: "premium-yearly",
    backgroundImage: '',
  },
  {
    id: "basic-monthly",
    backgroundImage: '',
  },
];

export default function SubscriptionOffers() {
  const handleOfferPress = (offerId: string) => {
    router.push({
      pathname: "/subscription/[id]",
      params: { id: offerId },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Subscription Offers</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        style={styles.scrollView}
        decelerationRate="fast"
        snapToInterval={width * 0.8 + 15}
        snapToAlignment="start"
      >
        {subscriptionOffers.map((offer, index) => (
          <TouchableOpacity
            key={offer.id}
            style={[styles.bannerContainer, index === 0 && styles.firstBanner]}
            onPress={() => handleOfferPress(offer.id)}
            activeOpacity={0.8}
          >
            <Image
              source={offer.backgroundImage}
              style={styles.bannerImage}
              resizeMode="cover"
            />
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
  scrollContainer: {},
  bannerContainer: {
    width: width * 0.4,
    height: responsiveSize(100),
    marginRight: 8,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: Colors.shadow.dark,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  firstBanner: {
    marginLeft: 0,
  },
  bannerBackground: {
    flex: 1,
    position: "relative",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 16,
  },
  popularBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: Colors.primary[500],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 2,
  },
  popularText: {
    ...Typography.caption,
    color: Colors.text.primary,
    fontSize: 10,
    fontWeight: "bold",
  },
  discountBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: Colors.error[500],
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    alignItems: "center",
    minWidth: 50,
    zIndex: 2,
  },
  discountText: {
    ...Typography.labelMedium,
    color: Colors.text.inverse,
    fontWeight: "bold",
    fontSize: 16,
    lineHeight: 18,
  },
  discountLabel: {
    ...Typography.caption,
    color: Colors.text.inverse,
    fontSize: 8,
    marginTop: -2,
  },
  bannerContent: {
    flex: 1,
    padding: 16,
    justifyContent: "space-between",
    zIndex: 1,
  },
  titleSection: {
    marginTop: 20,
  },
  bannerTitle: {
    ...Typography.headingSmall,
    color: Colors.text.inverse,
    fontWeight: "bold",
    marginBottom: 2,
  },
  bannerSubtitle: {
    ...Typography.bodySmall,
    color: Colors.text.inverse,
    opacity: 0.9,
    fontSize: 12,
  },
  priceSection: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  originalPrice: {
    ...Typography.bodySmall,
    color: Colors.text.inverse,
    textDecorationLine: "line-through",
    opacity: 0.7,
    fontSize: 12,
  },
  finalPrice: {
    ...Typography.headingMedium,
    color: Colors.text.inverse,
    fontWeight: "bold",
    fontSize: 18,
  },
  duration: {
    ...Typography.caption,
    color: Colors.text.inverse,
    opacity: 0.8,
    fontSize: 10,
  },
});
