import { mascotAssets } from "@/assets/images";
import { Colors, FontFamilies, FontSizes } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: screenWidth } = Dimensions.get("window");
const BANNER_WIDTH = screenWidth * 0.82;
const BANNER_HEIGHT = 150;
const BANNER_GAP = 12;

interface Banner {
  id: string;
  image: any;
  title?: string;
  subtitle?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  accentColor?: string;
}

interface BannerCarouselProps {
  banners?: Banner[];
  onBannerPress?: () => void;
}

const defaultBanners: Banner[] = [
  {
    id: "1",
    image: mascotAssets["hands-free"],
    title: "Hands-Free Logging",
    subtitle: "Tap to record reps, weights, and results using your voice.",
    iconName: "mic",
    accentColor: Colors.primary[500],
  },
  {
    id: "2",
    image: mascotAssets.track,
    title: "Track your WODs",
    subtitle: "Log every workout, track your PRs, and measure real progress.",
    iconName: "analytics",
    accentColor: Colors.primary[500],
  },
  {
    id: "3",
    image: mascotAssets.whistle,
    title: "Workout Timer",
    subtitle:
      "Use interval and countdown timers to optimize your training sessions.",
    iconName: "timer-outline",
    accentColor: Colors.primary[500],
  },
];

const BannerCarousel: React.FC<BannerCarouselProps> = ({
  banners = defaultBanners,
  onBannerPress,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const pageIndex = Math.round(contentOffset.x / (BANNER_WIDTH + BANNER_GAP));
    setCurrentIndex(Math.max(0, Math.min(pageIndex, banners.length - 1)));
  };

  const handleBannerPress = (banner: Banner) => {
    if (onBannerPress) {
      onBannerPress();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Ionicons name="sparkles" size={18} color={Colors.primary[500]} />
        <Text style={styles.sectionTitle}>WODGoat AI</Text>
      </View>

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
        {banners.map((banner, index) => {
          const accent = banner.accentColor || Colors.primary[500];
          return (
            <TouchableOpacity
              key={banner.id}
              onPress={() => handleBannerPress(banner)}
              activeOpacity={0.85}
              style={[
                styles.banner,
                {
                  marginLeft: index === 0 ? 0 : BANNER_GAP / 2,
                  marginRight:
                    index === banners.length - 1 ? 0 : BANNER_GAP / 2,
                  borderColor: accent + "35",
                },
              ]}
            >
              {/* Left accent bar */}
              <View
                style={[styles.bannerAccent, { backgroundColor: accent }]}
              />

              <View style={styles.bannerBody}>
                <View style={styles.bannerContent}>
                  {banner.iconName && (
                    <View
                      style={[
                        styles.bannerIconBg,
                        { backgroundColor: accent + "20" },
                      ]}
                    >
                      <Ionicons
                        name={banner.iconName}
                        size={16}
                        color={accent}
                      />
                    </View>
                  )}
                  <Text style={styles.bannerTitle} numberOfLines={1}>
                    {banner.title}
                  </Text>
                  <Text style={styles.bannerSubtitle} numberOfLines={3}>
                    {banner.subtitle}
                  </Text>
                </View>
                <Image source={banner.image} style={styles.bannerImage} />
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Pagination */}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.headingLG,
    color: Colors.text.primary,
    letterSpacing: 0.5,
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
    backgroundColor: Colors.secondary[600],
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
  },
  bannerAccent: {
    width: 4,
    alignSelf: "stretch",
  },
  bannerBody: {
    flex: 1,
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
    justifyContent: "space-between",
  },
  bannerContent: {
    flex: 1,
    paddingRight: 12,
    justifyContent: "center",
    gap: 6,
  },
  bannerIconBg: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  bannerTitle: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.headingMD,
    color: Colors.text.inverse,
  },
  bannerSubtitle: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodyXS,
    color: Colors.text.secondary,
    lineHeight: 16,
  },
  bannerImage: {
    width: "22%",
    height: "90%",
    resizeMode: "contain",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 14,
  },
  paginationDot: {
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
  },
  activeDot: {
    backgroundColor: Colors.primary[500],
    width: 22,
  },
  inactiveDot: {
    backgroundColor: Colors.neutral[600],
    width: 6,
  },
});

export default BannerCarousel;
