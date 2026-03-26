import { Button } from "@/components";
import { Colors, Typography, responsiveSize } from "@/constants";
import { useStorage } from "@/components/lib/storage";
import { router } from "expo-router";
import { useState } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import { mascotAssets } from "@/assets/images";
import { Image } from "expo-image";

const { width: screenWidth } = Dimensions.get("window");
const CARD_WIDTH = screenWidth * 0.9;

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const {set: setStorage} = useStorage();

  const handleGetStarted = async () => {
    router.push("/auth/login");
  };

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const pageIndex = Math.round(contentOffset.x / CARD_WIDTH);
    setCurrentIndex(
      Math.max(0, Math.min(pageIndex, onboardingData.length - 1)),
    );
  };

  const onboardingData = [
    {
      image: mascotAssets.coach,
      title: "Meet WODGoat",
      subtitle:
        "Your personal AI Fitness Buddy, here to track every WOD, PR, and push you to your best.",
    },
    {
      image: mascotAssets.track,
      title: "Smart WOD Tracking",
      subtitle: "WODGoat remembers your PRs, guides your workouts, and adapts to your progress.",
    },
    {
      image: mascotAssets.help,
      title: "AI Guidance Anytime",
        subtitle: "Log PRs hands-free and get workout guidance using WODGoat AI voice integration.",
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
                <Image source={item.image} style={{ width: "100%", height: "100%", resizeMode: "contain" }} />
              </View>

              {/* Text and Subtitle */}
              <Text style={[styles.title, Typography.headingLarge]}>
                {item.title}
              </Text>
              <Text style={[styles.subtitle, Typography.bodyMedium]}>
                {item.subtitle}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Section 2: Pagination Dots */}
      {renderPaginationDots()}

      {/* Section 3: Fixed Footer Button */}
      <View style={styles.footerSection}>
        <Button
          variant="primary"
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
    backgroundColor: Colors.background.primary,
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
    height: "80%",
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
    backgroundColor: "transparent",
  },

  // Image Section
  imageContainer: {
    width: screenWidth * 0.8,
    height: screenWidth * 0.8,
    backgroundColor: "#242426",
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
    padding:24
  },

  // Text
  title: {
    color: Colors.text.primary,
    textAlign: "center",
    marginBottom: 16,
  },
  subtitle: {
    color: Colors.text.primary,
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
    backgroundColor: Colors.primary[500],
    width: 24,
  },
  inactiveDot: {
    backgroundColor: "#A6A6A6",
  },

  // Section 3: Fixed Footer
  footerSection: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 20,
  },
  button: {
    width: "100%",
    backgroundColor: Colors.primary[500],
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
    color: Colors.text.primary,
    fontSize: responsiveSize(18),
    fontWeight: "bold",
    textAlign: "center",
  },
});
