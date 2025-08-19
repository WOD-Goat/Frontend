import { Button } from "@/components";
import { Typography } from "@/constants";
import { useAppContext } from "@/hooks";
import { router } from "expo-router";
import { useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";

const { width: screenWidth } = Dimensions.get("window");
const CARD_WIDTH = screenWidth * 0.9;

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { completeOnboarding } = useAppContext();

  const handleGetStarted = () => {
    completeOnboarding();
    router.replace("/auth/login");
  };

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const pageIndex = Math.round(contentOffset.x / CARD_WIDTH);
    setCurrentIndex(
      Math.max(0, Math.min(pageIndex, onboardingData.length - 1))
    );
  };

  const onboardingData = [
    {
      image: "🚴‍♂️👨‍💼",
      title: "Welcome To 90 Box",
      subtitle:
        "Start Your Journey Towards A More Active Lifestyle With Professional Coaches",
    },
    {
      image: "🏋️‍♂️",
      title: "Reach Your Goals",
      subtitle: "Reaching Your Goals Have Never Been Easier",
    },
    {
      image: "🏆👥📜",
      title: "Where Power Meets Friendship",
      subtitle: "A Community For You, Challenge Yourself",
    },
  ];

  const renderPaginationDots = () => {
    return (
      <View style={styles.paginationContainer}>
        {onboardingData.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              index === currentIndex ? styles.activeDot : styles.inactiveDot,
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Section 1: Carousel Cards */}
      <View style={styles.carouselSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={styles.scrollContent}
          style={styles.scrollView}
          decelerationRate="fast"
          snapToInterval={CARD_WIDTH}
          snapToAlignment="start"
          pagingEnabled={false}
        >
          {onboardingData.map((item, index) => (
            <View key={index} style={styles.card}>
              {/* Image */}
              <View style={styles.imageContainer}>
                <Text style={styles.imageEmoji}>{item.image}</Text>
              </View>

              {/* Text and Subtitle */}
              <Text style={[styles.title, Typography.headingLarge]}>{item.title}</Text>
              <Text style={[styles.subtitle, Typography.bodyMedium]}>{item.subtitle}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Section 2: Pagination Dots */}
      {renderPaginationDots()}

      {/* Section 3: Fixed Footer Button */}
      <View style={styles.footerSection}>
        <Button
          variant="secondary"
          size="large"
          onPress={handleGetStarted}
          title="Get Started →"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    justifyContent: "center",
  },

  // Section 1: Carousel
  carouselSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flexGrow: 0,
    height: '80%',
  },
  scrollContent: {
    paddingHorizontal: (screenWidth - CARD_WIDTH) / 2,
    alignItems: "center",
    justifyContent: "center",
  },

  // Card
  card: {
    width: CARD_WIDTH,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: 'transparent'
  },

  // Image Section
  imageContainer: {
    width: screenWidth * 0.8,
    height: screenWidth * 0.8,
    backgroundColor: "#F8F9FA",
    borderRadius: screenWidth * 0.25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  imageEmoji: {
    fontSize: screenWidth * 0.2,
    textAlign: "center",
  },

  // Text
  title: {
    color: "#000000",
    textAlign: "center",
    marginBottom: 16,
  },
  subtitle: {
    color: "#666666",
    textAlign: "center",
    paddingHorizontal: 16,
  },

  // Section 2: Pagination Dots
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#FFD700",
    width: 24,
  },
  inactiveDot: {
    backgroundColor: "#E0E0E0",
  },

  // Section 3: Fixed Footer
  footerSection: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 20,
  },
  button: {
    width: "100%",
    backgroundColor: "#1E1E1E",
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
});
