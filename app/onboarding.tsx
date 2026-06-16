import { Button } from "@/components";
import { Colors, Typography } from "@/constants";
import { useStorage } from "@/components/lib/storage";
import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { mascotAssets } from "@/assets/images";
import { Image } from "expo-image";

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { set: setStorage } = useStorage();
  const { width, height } = useWindowDimensions();

  const CARD_WIDTH = width * 0.9;
  const imageSize = Math.min(width * 0.72, height * 0.38);
  const imageMarginBottom = Math.max(16, height * 0.03);
  const paginationPadding = Math.max(12, height * 0.025);
  const footerPaddingBottom = Math.max(24, height * 0.05);

  const handleGetStarted = async () => {
    router.push("/auth/login");
  };

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const pageIndex = Math.round(contentOffset.x / CARD_WIDTH);
    setCurrentIndex(Math.max(0, Math.min(pageIndex, onboardingData.length - 1)));
  };

  const onboardingData = [
    {
      image: mascotAssets.egypt,
      title: "Egypt's First AI Fitness App",
      subtitle: "Just speak your workout details and WODGoat transcribes them instantly — logging WODs has never been this fast.",
    },
    {
      image: mascotAssets.community,
      title: "Train Together, Win Together",
      subtitle: "Join groups, take on shared WODs, and compete with your crew — accountability built right in.",
    },
    {
      image: mascotAssets.coach,
      title: "Never Watch the Clock Again",
      subtitle: "Built-in timers for every WOD format — AMRAP, EMOM, For Time. Stay in the zone, we'll handle the clock.",
    },
  ];

  const renderPaginationDots = () => {
    return (
      <View style={[styles.paginationContainer, { paddingVertical: paginationPadding }]}>
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
          contentContainerStyle={[
            styles.scrollContent,
            { paddingHorizontal: (width - CARD_WIDTH) / 2 },
          ]}
          style={styles.scrollView}
          decelerationRate="fast"
          snapToInterval={CARD_WIDTH}
          snapToAlignment="start"
          pagingEnabled={false}
        >
          {onboardingData.map((item, index) => (
            <View key={index} style={[styles.card, { width: CARD_WIDTH }]}>
              {/* Image */}
              <View style={[
                styles.imageContainer,
                {
                  width: imageSize,
                  height: imageSize,
                  borderRadius: imageSize * 0.3,
                  marginBottom: imageMarginBottom,
                },
              ]}>
                <Image source={item.image} style={{ width: "100%", height: "100%" }} contentFit="contain" />
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
      <View style={[styles.footerSection, { paddingBottom: footerPaddingBottom }]}>
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
  },

  // Section 1: Carousel
  carouselSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flexGrow: 0,
    width: "100%",
  },
  scrollContent: {
    alignItems: "center",
  },

  // Card
  card: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: "transparent",
  },

  // Image Section (width/height/borderRadius/marginBottom injected inline)
  imageContainer: {
    backgroundColor: "#242426",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    padding: 24,
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

  // Section 2: Pagination Dots (paddingVertical injected inline)
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
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

  // Section 3: Fixed Footer (paddingBottom injected inline)
  footerSection: {
    paddingHorizontal: 24,
    paddingTop: 16,  },
});
