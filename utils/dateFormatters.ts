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
