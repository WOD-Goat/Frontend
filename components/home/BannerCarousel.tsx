import { mascotAssets } from "@/assets/images";
import { Colors, FontFamilies, FontSizes } from "@/constants";
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  Touchable,
  TouchableOpacity,
  View,
} from "react-native";
import { Button } from "../ui";

const { width: screenWidth } = Dimensions.get("window");
const BANNER_WIDTH = screenWidth * 0.85;
const BANNER_HEIGHT = 160;
const BANNER_GAP = 16;

interface Banner {
  id: string;
  image: any;
  title?: string;
  subtitle?: string;
}

interface BannerCarouselProps {
  banners?: Banner[];
  onBannerPress?: () => void;
}

const defaultBanners: Banner[] = [
  {
    id: "1",
    image: mascotAssets.coach,
    title: "Ask WODGoat AI",
    subtitle:
      "From WOD strategy to recovery advice, your AI fitness expert is ready to guide you.",
  },
  {
    id: "2",
    image: mascotAssets["hands-free"],
    title: "Hands-Free Logging",
    subtitle:
      "Hands tired after WOD? Tap to record reps, weights, and results using your voice.",
  },
  {
    id: "3",
    image: mascotAssets.track,
    title: "Track your WODs",
    subtitle:
      "Log every workout, track your PRs, and measure real progress over time.",
  },
];

const BannerCarousel: React.FC<BannerCarouselProps> = ({
  banners = defaultBanners,
  onBannerPress,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const pageIndex = Math.round(contentOffset.x / BANNER_WIDTH);
    setCurrentIndex(Math.max(0, Math.min(pageIndex, banners.length - 1)));
  };

  const renderPaginationDots = () => {
    return (
      <View style={styles.paginationContainer}>
        {banners.map((_, index) => (
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

  const handleBannerPress = (banner: Banner) => {
    if (onBannerPress) {
      onBannerPress();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>WODGoat AI</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
        decelerationRate="fast"
        snapToInterval={BANNER_WIDTH + BANNER_GAP}
        snapToAlignment="start"
        pagingEnabled={false}
      >
        {banners.map((banner, index) => (
          <TouchableOpacity
            key={banner.id}
            onPress={() => handleBannerPress(banner)}
            style={[
              styles.banner,
              {
                marginLeft: index === 0 ? 0 : BANNER_GAP / 2,
                marginRight: index === banners.length - 1 ? 0 : BANNER_GAP / 2,
              },
            ]}
          >
            <View style={styles.bannerContent}>
              <Text style={styles.bannerTitle}>{banner.title}</Text>
              <Text style={styles.bannerSubtitle}>{banner.subtitle}</Text>
            </View>
            <Image source={banner.image} style={styles.bannerImage} />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {renderPaginationDots()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  title: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.headingXL,
    color: "#FFFFFF",
    marginBottom: 16,
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    alignItems: "center",
  },
  banner: {
    width: BANNER_WIDTH,
    height: BANNER_HEIGHT,
    flexDirection: "row",
    padding: 20,
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.background.secondary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 107, 44, 0.5)",
    shadowColor: "#ffffff",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  bannerContent: {
    flex: 1,
    paddingRight: 12,
    justifyContent: "center",
    flexShrink: 1,
  },
  bannerTitle: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodyXL,
    color: "#FFFFFF",
    marginBottom: 4,
    flexWrap: "wrap",
  },
  bannerSubtitle: {
    fontFamily: FontFamilies.spartanRegular,
    fontSize: FontSizes.bodyMD,
    color: "#FFFFFF",
    opacity: 0.9,
    lineHeight: 16,
    flexWrap: "wrap",
  },
  bannerImage: {
    width: "25%",
    height: "100%",
    resizeMode: "contain",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
  },
  activeDot: {
    backgroundColor: Colors.primary[500],
    width: 20,
  },
  inactiveDot: {
    backgroundColor: "#A6A6A6",
  },
});

export default BannerCarousel;
