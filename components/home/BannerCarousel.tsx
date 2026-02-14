import { Colors } from '@/constants';
import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');
const BANNER_WIDTH = screenWidth * 0.85;
const BANNER_HEIGHT = 160;
const BANNER_GAP = 16;

interface Banner {
  id: string;
  image: any;
  title?: string;
}

interface BannerCarouselProps {
  banners?: Banner[];
  onBannerPress?: (banner: Banner) => void;
}

const defaultBanners: Banner[] = [
  {
    id: '1',
    image: '',
    title: 'Summer Challenge',
  },
  {
    id: '2',
    image: '',

    title: 'New Classes',
  },
  {
    id: '3',
    image: '',
    title: 'Member Offers',
  },
];

const BannerCarousel: React.FC<BannerCarouselProps> = ({ 
  banners = defaultBanners, 
  onBannerPress 
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
      onBannerPress(banner);
    }
  };

  return (
    <View style={styles.container}>
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
            style={[
              styles.banner,
              { 
                marginLeft: index === 0 ? 0 : BANNER_GAP / 2, 
                marginRight: index === banners.length - 1 ? 0 : BANNER_GAP / 2 
              }
            ]}
            onPress={() => handleBannerPress(banner)}
            activeOpacity={0.8}
          >
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
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    alignItems: 'center',
  },
  banner: {
    width: BANNER_WIDTH,
    height: BANNER_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'center',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: '#A6A6A6',
  },
});

export default BannerCarousel;
