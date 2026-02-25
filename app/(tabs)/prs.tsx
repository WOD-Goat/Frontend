import { personalRecordsService } from "@/api/services";
import { Gap, Page, PRHeader } from "@/components";
import { Colors, FontFamilies, FontSizes } from "@/constants";
import type { PersonalRecord } from "@/types";
import { formatDate, parseFirebaseDate } from "@/utils";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function PRsScreen() {
  const [prs, setPrs] = useState<PersonalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPRs();
  }, []);

  const loadPRs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await personalRecordsService.getAllPersonalRecords();

      if (response.success && response.data) {
        // Sort by newest first (achievedAt date)
        const sortedPRs = response.data.sort((a, b) => {
          const dateA = new Date(a.achievedAt).getTime();
          const dateB = new Date(b.achievedAt).getTime();
          return dateB - dateA; // Newest first
        });
        setPrs(sortedPRs);
      } else {
        setError(response.message || "Failed to load personal records");
      }
    } catch (err: any) {
      console.error("Error loading PRs:", err);
      setError(err.message || "Failed to load personal records");
    } finally {
      setLoading(false);
    }
  };

  const formatPRValue = (
    pr: PersonalRecord,
  ): { value: string; unit: string } => {
    switch (pr.trackingType) {
      case "weight_reps":
        return { value: `${pr.bestWeight || 0}`, unit: "KG" };
      case "reps":
        return { value: `${pr.bestReps || 0}`, unit: "REPS" };
      case "time":
        return { value: formatTime(pr.bestTimeInSeconds || 0), unit: "S" };
      case "distance":
        return { value: `${pr.bestTimeInSeconds || 0}`, unit: "M" };
      case "calories":
        return { value: `${pr.bestReps || 0}`, unit: "CAL" };
      default:
        return { value: "N/A", unit: "" };
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, "0")}` : `${secs}`;
  };

  const handlePRPress = useCallback((prId: string) => {
    router.push(`/pr/${prId}` as any);
  }, []);

  if (loading) {
    return (
      <Page
        showBackButton={false}
        contentStyle={{ flex: 1 }}
        scrollable={false}
      >
        <PRHeader />
        <Gap size={26} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary[500]} />
          <Text style={styles.loadingText}>Loading PRs...</Text>
        </View>
      </Page>
    );
  }

  if (error) {
    return (
      <Page
        showBackButton={false}
        contentStyle={{ flex: 1 }}
        scrollable={false}
      >
        <PRHeader />
        <Gap size={26} />
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </Page>
    );
  }

  if (prs.length === 0) {
    return (
      <Page
        showBackButton={false}
        contentStyle={{ flex: 1 }}
        scrollable={false}
      >
        <PRHeader />
        <Gap size={26} />
        <View style={styles.centerContainer}>
          <Ionicons
            name="trophy-outline"
            size={64}
            color={Colors.text.tertiary}
          />
          <Gap size={16} />
          <Text style={styles.emptyTitle}>No Personal Records Yet</Text>
          <Text style={styles.emptyText}>
            Complete workouts to start tracking your PRs!
          </Text>
        </View>
      </Page>
    );
  }

  return (
    <Page showBackButton={false}>
      <PRHeader />
      <Gap size={26} />
      {prs.map((pr, index) => (
        <View key={pr.id || pr.exerciseId}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handlePRPress(pr.id || "")}
          >
            <View style={styles.prCard}>
              <View style={styles.cardContent}>
                <View style={styles.leftContent}>
                  <View style={styles.topLeft}>
                    <Text style={styles.exerciseName}>{pr.exerciseName}</Text>
                    <Text style={styles.date}>
                      {formatDate(parseFirebaseDate(pr.achievedAt))}
                    </Text>
                  </View>
                  <View style={styles.bottomLeft}>
                    {/* Empty section for future use */}
                  </View>
                </View>
                <View style={styles.rightContent}>
                  <View style={styles.topRight}>
                    <Text style={styles.improvement}>+5KG</Text>
                  </View>
                  <View style={styles.bottomRight}>
                    <Text style={styles.prValue}>
                      {formatPRValue(pr).value}
                      <Text style={styles.prUnit}>
                        {formatPRValue(pr).unit}
                      </Text>
                    </Text>
                  </View>
                </View>
                <View style={styles.chevronContainer}>
                  <Ionicons
                    name="chevron-forward"
                    size={24}
                    color={Colors.primary[500]}
                  />
                </View>
              </View>
            </View>
          </TouchableOpacity>
          {index < prs.length - 1 && <Gap size={12} />}
        </View>
      ))}
      <Gap size={24} />
    </Page>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
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
  emptyTitle: {
    fontSize: FontSizes.headingXL,
    fontFamily: FontFamilies.spartanBold,
    color: Colors.text.primary,
    textAlign: "center",
  },
  emptyText: {
    marginTop: 8,
    fontSize: FontSizes.bodyMD,
    fontFamily: FontFamilies.poppinsRegular,
    color: Colors.text.secondary,
    textAlign: "center",
  },
  prCard: {
    backgroundColor: Colors.secondary[500],
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.primary[500],
    padding: 20,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "stretch",
    flex: 1,
  },
  leftContent: {
    flex: 1.8,
    paddingRight: 16,
    flexDirection: "column",
  },
  rightContent: {
    flex: 1.2,
    flexDirection: "column",
  },
  topLeft: {
    flex: 1,
    justifyContent: "flex-start",
  },
  bottomLeft: {
    flex: 1,
    minHeight: 20,
  },
  topRight: {
    flexDirection: "column",
    flex: 0.3,
    justifyContent: "center",
    alignItems: "flex-end",
  },
  bottomRight: {
    flex: 0.7,
    justifyContent: "center",
    alignItems: "flex-end",
  },
  chevronContainer: {
    paddingLeft: 16,
    borderLeftWidth: 1,
    borderLeftColor: Colors.neutral[700],
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 16,
  },
  exerciseName: {
    fontSize: FontSizes.heading2XL,
    fontFamily: FontFamilies.poppinsBold,
    color: Colors.text.inverse,
    marginBottom: 4,
  },
  date: {
    fontSize: FontSizes.bodySM,
    fontFamily: FontFamilies.poppinsRegular,
    color: Colors.text.secondary,
  },
  improvement: {
    fontSize: FontSizes.headingMD,
    fontFamily: FontFamilies.spartanBold,
    color: Colors.success[500],
  },
  prValue: {
    fontSize: FontSizes.display2XL,
    fontFamily: FontFamilies.spartanBold,
    color: Colors.text.inverse,
  },
  prUnit: {
    fontSize: FontSizes.headingLG,
    fontFamily: FontFamilies.poppinsBold,
    color: Colors.text.inverse,
  },
});
