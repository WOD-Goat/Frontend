/**
 * Persistent Storage Types
 * Represents data stored in AsyncStorage that persists across app sessions
 */

import { User } from "./auth";

export type Locale = "en" | "ar";

export interface StorageMap {
  token: string | null;
  access_token: string | null;
  refresh_token: string | null;
  locale: Locale;
  isLoggedIn: boolean;
  user: User | null;
}
