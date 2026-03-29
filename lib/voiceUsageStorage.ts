import AsyncStorage from "@react-native-async-storage/async-storage";

interface VoiceUsageRecord {
  count: number;
  monthKey: string; // "YYYY-MM" e.g. "2026-03"
}

const STORAGE_KEY = "voice_usage_monthly";

function getCurrentMonthKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

/** Read current month's voice usage. Auto-resets if month has changed. */
export async function getVoiceUsage(): Promise<VoiceUsageRecord> {
  const currentMonthKey = getCurrentMonthKey();
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (!stored) return { count: 0, monthKey: currentMonthKey };

    const parsed: VoiceUsageRecord = JSON.parse(stored);
    // Auto-reset on new month
    if (parsed.monthKey !== currentMonthKey) {
      return { count: 0, monthKey: currentMonthKey };
    }
    return parsed;
  } catch {
    return { count: 0, monthKey: currentMonthKey };
  }
}

/** Increment the current month's voice usage count. Returns the new count. */
export async function incrementVoiceUsage(): Promise<number> {
  const usage = await getVoiceUsage();
  const updated: VoiceUsageRecord = {
    count: usage.count + 1,
    monthKey: usage.monthKey,
  };
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Non-fatal — proceed even if storage fails
  }
  return updated.count;
}

/** Reset voice usage (e.g. after upgrading plan). */
export async function resetVoiceUsage(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }
}
