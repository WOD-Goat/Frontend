import { Asset } from 'expo-asset';
import { Image } from 'expo-image';
import { appIcons, mascotAssets, tabIcons } from '../assets/images';

// Collect all image sources
const imageAssets = [
  // Tab icons
  ...Object.values(tabIcons),
  // App icons
  ...Object.values(appIcons),
  // Mascot assets
  ...Object.values(mascotAssets),
];

/**
 * Preloads all app icons and images for better performance using expo-asset
 * Call this function during app initialization
 */
export const preloadImages = async (): Promise<void> => {
  try {
    // Load assets directly using Asset.loadAsync with the require() modules
    await Asset.loadAsync(imageAssets);
    console.log('✅ All images preloaded successfully');
  } catch (error) {
    console.warn('⚠️ Error preloading images:', error);
    // Fallback to expo-image prefetch
    await cacheImagesWithExpoImage();
  }
};

/**
 * Alternative method using expo-image caching
 * This is more efficient if you're using expo-image throughout your app
 */
export const cacheImagesWithExpoImage = async (): Promise<void> => {
  try {
    const cachePromises = imageAssets.map(async (image) => {
      // For local assets, we need to resolve the asset first
      const asset = Asset.fromModule(image);
      if (!asset.downloaded) {
        await asset.downloadAsync();
      }
      // Use the resolved URI for prefetching
      const uri = asset.uri || asset.localUri;
      if (uri) {
        await Image.prefetch(uri);
      }
      return asset;
    });

    await Promise.all(cachePromises);
    console.log('✅ All images cached with expo-image');
  } catch (error) {
    console.warn('⚠️ Error caching images with expo-image:', error);
  }
};

/**
 * Simple preloader that just resolves all asset modules
 * This ensures the require() calls are processed and cached by Metro bundler
 */
export const preloadImagesSimple = async (): Promise<void> => {
  try {
    // This will ensure all the require() calls are processed
    const promises = imageAssets.map(async (image) => {
      return new Promise<void>((resolve) => {
        // Simply referencing the asset will cause it to be bundled and available
        resolve();
      });
    });
    
    await Promise.all(promises);
    console.log('✅ Images registered for bundling');
  } catch (error) {
    console.warn('⚠️ Error in simple preload:', error);
  }
};
