import { personalRecordsService } from "@/api/services";
import { Card, Gap, Page } from "@/components";
import { Colors, FontFamilies, FontSizes } from "@/constants";
import type { PersonalRecord } from "@/types";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function PRDetailScreen() {
  const params = useLocalSearchParams();
  const { id } = params;

  const [pr, setPr] = useState<PersonalRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id && typeof id === "string") {
      loadPR(id);
    }
  }, [id]);

  const loadPR = async (prId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await personalRecordsService.getPersonalRecordById(prId);

      if (response.success && response.data) {
        setPr(response.data);
      } else {
        setError(response.message || "Failed to load personal record");
      }
    } catch (err: any) {
      console.error("Error loading PR:", err);
      setError(err.message || "Failed to load personal record");
    } finally {
      setLoading(false);
    }
  };

  const formatPRValue = (pr: PersonalRecord): string => {
    switch (pr.trackingType) {
      case "weight_reps":
        return `${pr.bestWeight || 0} lbs × ${pr.bestReps || 0} reps${
          pr.bestEstimated1RM ? ` (1RM: ${pr.bestEstimated1RM} lbs)` : ""
        }`;
      case "reps":
        return `${pr.bestReps || 0} reps`;
      case "time":
        return formatTime(pr.bestTimeInSeconds || 0);
      case "distance":
        return `${pr.bestTimeInSeconds || 0} meters`;
      case "calories":
        return `${pr.bestReps || 0} calories`;
      default:
        return "N/A";
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0
      ? `${mins}:${secs.toString().padStart(2, "0")}`
      : `${secs}s`;
  };

  const formatDate = (date: Date): string => {
    if (!date) return "N/A";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <Page title="Personal Record" showBackButton contentStyle={{ flex: 1 }}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary[500]} />
          <Text style={styles.loadingText}>Loading PR...</Text>
        </View>
      </Page>
    );
  }

  if (error || !pr) {
    return (
      <Page title="Personal Record" showBackButton contentStyle={{ flex: 1 }}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error || "PR not found"}</Text>
        </View>
      </Page>
    );
  }

  return (
    <Page
      title="Personal Record"
      showBackButton
      scrollable
      contentStyle={styles.content}
    >
      <Card style={styles.prCard}>
        <Text style={styles.exerciseName}>{pr.exerciseName}</Text>
        <Gap size={8} />
        <Text style={styles.prValue}>{formatPRValue(pr)}</Text>
        <Gap size={16} />
        <View style={styles.dateContainer}>
          <Text style={styles.dateLabel}>Achieved on:</Text>
          <Text style={styles.dateValue}>{formatDate(pr.achievedAt)}</Text>
        </View>
      </Card>

      <Gap size={24} />

      <Text style={styles.sectionTitle}>History</Text>
      <Gap size={12} />

      <Card style={styles.historyPlaceholder}>
        <Text style={styles.placeholderText}>
          History tracking coming soon!
        </Text>
        <Text style={styles.placeholderSubtext}>
          View your progress over time and past numbers.
        </Text>
      </Card>
    </Page>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: FontSizes.bodyMD,
    fontFamily: FontFamilies.poppinsRegular,
    color: Colors.text.secondary,
  },
  errorText: {
    fontSize: FontSizes.bodyMD,
    fontFamily: FontFamilies.poppinsRegular,
    color: Colors.error[500],
    textAlign: "center",
  },
  prCard: {
    padding: 20,
  },
  exerciseName: {
    fontSize: FontSizes.headingXL,
    fontFamily: FontFamilies.spartanBold,
    color: Colors.text.primary,
  },
  prValue: {
    fontSize: FontSizes.heading2XL,
    fontFamily: FontFamilies.spartanBold,
    color: Colors.primary[500],
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dateLabel: {
    fontSize: FontSizes.bodySM,
    fontFamily: FontFamilies.poppinsRegular,
    color: Colors.text.secondary,
  },
  dateValue: {
    fontSize: FontSizes.bodySM,
    fontFamily: FontFamilies.poppinsMedium,
    color: Colors.text.primary,
  },
  sectionTitle: {
    fontSize: FontSizes.headingLG,
    fontFamily: FontFamilies.spartanBold,
    color: Colors.text.primary,
  },
  historyPlaceholder: {
    padding: 40,
    alignItems: "center",
  },
  placeholderText: {
    fontSize: FontSizes.bodyMD,
    fontFamily: FontFamilies.poppinsMedium,
    color: Colors.text.secondary,
    textAlign: "center",
  },
  placeholderSubtext: {
    marginTop: 8,
    fontSize: FontSizes.bodySM,
    fontFamily: FontFamilies.poppinsRegular,
    color: Colors.text.tertiary,
    textAlign: "center",
  },
});
