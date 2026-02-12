import { StorageMap } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';


export type StorageControls = {
  /**
   * Set a value in storage
   * @param key - The key to set
   * @param value - The value to set
   * @param onError - The error handler
   * @example
   * ```tsx
   * import { useStorage } from 'lib/registries';
   *
   * () => {
   *  const { set } = useStorage();
   *
   *  //...
   *
   *  set('userEmail', 'hello@domain.com');
   * }
   * ```
   */
  set: <Key extends keyof StorageMap>(
    key: Key,
    value: StorageMap[Key],
    onError?: (e: unknown) => void
  ) => Promise<void>;
  /**
   * Get a value from storage
   * @param key - The key to get
   * @param onError - The error handler
   * @example
   * ```tsx
   * import { useStorage } from 'lib/registries';
   *
   * () => {
   *   const { get } = useStorage();
   *
   *   useEffect(() => {
   *     get('userEmail').then((email) => {
   *       //...
   *     });
   *   }, []);
   * }
   * ```
   */
  get: <Key extends keyof StorageMap>(key: Key) => Promise<StorageMap[Key] | null>;
  /**
   * Remove a value from storage
   * @param key - The key to remove
   * @param onError - The error handler
   * @example
   * ```tsx
   * import { useStorage } from 'lib/registries';
   *
   * () => {
   *  const { remove } = useStorage();
   *
   *  //...
   *
   *  remove('userEmail');
   * }
   * ```
   */
  remove: <Key extends keyof StorageMap>(key: Key, onError?: (e: unknown) => void) => Promise<void>;
};

/**
 * A hook for interacting with the device's local storage
 * @example
 * ```tsx
 * import { useStorage } from 'lib/registries';
 *
 * () => {
 *   const { set, get, remove } = useStorage();
 *
 *   useEffect(() => {
 *    set('userEmail', 'email@domain.com');
 *   }, []);
 * }
 * ```
 */

const set = async <Key extends keyof StorageMap>(
  key: Key,
  value: StorageMap[Key],
  onError?: (e: unknown) => void
) => {
  try {
    if (typeof value === 'object' || Array.isArray(value)) {
      value = JSON.stringify(value) as any;
    }

    await AsyncStorage.setItem(key, value?.toString() ?? '');
  } catch (e) {
    console.error(e || 'Error setting storage value');
    onError?.(e);
  }
};

const get = async <Key extends keyof StorageMap>(key: Key) => {
  try {
    const value = await AsyncStorage.getItem(key);

    if (value === null || value === undefined) {
      return null;
    }

    try {
      return JSON.parse(value) as StorageMap[Key];
    } catch {
      return value as StorageMap[Key];
    }
  } catch (e) {
    console.error(e || 'Error getting storage value');
    return null;
  }
};

const remove = async <Key extends keyof StorageMap>(key: Key, onError?: (e: unknown) => void) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    console.error(e || 'Error removing storage value');
    onError?.(e);
  }
};

export const useStorage = () => {
  return {
    set,
    get,
    remove,
  } satisfies StorageControls;
};

export const storage = {
  set,
  get,
  remove,
} satisfies StorageControls;
