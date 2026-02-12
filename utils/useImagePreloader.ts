import { useEffect, useState } from 'react';
import { preloadImages } from './imagePreloader';

/**
 * Custom hook to manage image preloading state
 * Returns loading state and any errors that occur during preloading
 */
export const useImagePreloader = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadImages = async () => {
      try {
        setIsLoading(true);
        await preloadImages();
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load images');
        console.error('Image preloading failed:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadImages();
  }, []);

  return {
    isLoading,
    error,
    isReady: !isLoading && !error,
  };
};
