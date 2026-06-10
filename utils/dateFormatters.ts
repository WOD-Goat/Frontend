export const parseFirebaseDate = (timestamp: any): Date => {
  // Firebase Timestamp with toDate() method
  if (timestamp?.toDate && typeof timestamp.toDate === "function") {
    return timestamp.toDate();
  }
  // Firebase Timestamp object format
  if (timestamp?._seconds !== undefined) {
    return new Date(
      timestamp._seconds * 1000 + (timestamp._nanoseconds || 0) / 1000000,
    );
  }
  // Already a Date object
  if (timestamp instanceof Date) {
    return timestamp;
  }
  // String format
  return new Date(timestamp);
};

export const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

export const isYesterday = (date: Date): boolean => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  );
};

export const formatDate = (date: Date): string => {
  const monthDay = date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });

  if (isToday(date)) {
    return `Today, ${monthDay}`;
  } else if (isYesterday(date)) {
    return `Yesterday, ${monthDay}`;
  } else {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  }
};

/**
 * Compact date format for cards: "Feb 26" or "Dec 3, '25"
 * Shows year suffix only if not the current year.
 */
export const formatShortDate = (date: Date): string => {
  const now = new Date();
  const sameYear = date.getFullYear() === now.getFullYear();

  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";

  const month = date.toLocaleDateString("en-US", { month: "short" });
  const day = date.getDate();

  if (sameYear) return `${month} ${day}`;
  const yearSuffix = `'${String(date.getFullYear()).slice(-2)}`;
  return `${month} ${day}, ${yearSuffix}`;
};

export const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export const getWeekStart = (date: Date): Date => {
  const d = new Date(date);
  d.setDate(d.getDate() - (d.getDay() + 1) % 7); // Saturday
  d.setHours(0, 0, 0, 0);
  return d;
};

export const getWeekEnd = (date: Date): Date => {
  const start = getWeekStart(date);
  start.setDate(start.getDate() + 6); // Friday
  start.setHours(23, 59, 59, 999);
  return start;
};

export const getWeekDays = (date: Date): Date[] => {
  const start = getWeekStart(date);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
};

export const getWeekNumber = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
};

export const getWeekLabel = (date: Date): string => {
  const month = date.toLocaleDateString("en-US", { month: "long" });
  const year = date.getFullYear();
  const week = getWeekNumber(date);
  return `${month} ${year} · Week ${week}`;
};

const DAY_LETTERS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const;
export const getDayLetter = (date: Date): string => DAY_LETTERS[date.getDay()];
