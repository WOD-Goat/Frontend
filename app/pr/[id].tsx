import { personalRecordsService } from "@/api/services";
import type { PRStickerData } from "@/components";
import { Gap, Page, PRShareModal } from "@/components";
import { Colors, FontFamilies, FontSizes } from "@/constants";
import standardExercises from "@/constants/standardExercises.json";
import { useFeatureGuard } from "@/hooks/useFeatureGuard";
import { formatDate } from "@/utils";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type TrackingType =
  | "weight_reps"
  | "reps"
  | "time"
  | "distance"
  | "pace"
  | "calories";

const getTrackingType = (exerciseId: string): TrackingType => {
  const exercise = standardExercises.find((e) => e.id === exerciseId);
  return (exercise?.trackingType as TrackingType) || "weight_reps";
};

const formatPRValue = (
  value: number,
  trackingType: TrackingType,
): { display: string; unit: string } => {
  switch (trackingType) {
    case "weight_reps":
      return { display: `${value}`, unit: "KG" };
    case "reps":
      return { display: `${value}`, unit: "REPS" };
    case "time": {
      const mins = Math.floor(value / 60);
      const secs = value % 60;
      if (mins > 0) {
        return {
          display: `${mins}:${secs.toString().padStart(2, "0")}`,
          unit: "MIN",
        };
      }
      return { display: `${value}`, unit: "SEC" };
    }
    case "distance":
      return { display: `${value}`, unit: "M" };
    case "pace": {
      // value is seconds per meter; convert to seconds per km
      const secsPerKm = value * 1000;
      const mins = Math.floor(secsPerKm / 60);
      const secs = Math.round(secsPerKm % 60);
      if (mins > 0) {
        return {
          display: `${mins}:${secs.toString().padStart(2, "0")}`,
          unit: "MIN/KM",
        };
      }
      return {
        display: `${Math.round(secsPerKm)}`,
        unit: "SEC/KM",
      };
    }
    case "calories":
      return { display: `${value}`, unit: "CAL" };
    default:
      return { display: `${value}`, unit: "" };
  }
};

const getImprovementUnit = (trackingType: TrackingType): string => {
  switch (trackingType) {
    case "weight_reps":
      return "KG";
    case "reps":
      return "REPS";
    case "time":
      return "SEC";
    case "distance":
      return "M";
    case "pace":
      return "SEC/KM";
    case "calories":
      return "CAL";
    default:
      return "";
  }
};

const PERCENTAGES = [95, 90, 85, 80, 75, 70, 65, 60, 55, 50];

const computePercentageValue = (
  prValue: number,
  pct: number,
  type: TrackingType,
): number => {
  const raw = prValue * (pct / 100);
  if (type === "weight_reps") return Math.round(raw / 2.5) * 2.5;
  return Math.round(raw);
};

export default function PRDetailScreen() {
  const params = useLocalSearchParams();
  const { id, name } = params;

  const [prs, setPrs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const { guard } = useFeatureGuard();
  const [activeTab, setActiveTab] = useState<"history" | "percentages">(
    "history",
  );

  useEffect(() => {
    if (id && typeof id === "string") {
      loadPRs(id);
    }
  }, [id]);

  const loadPRs = async (exerciseId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response =
        await personalRecordsService.getPersonalRecordsByExercise(exerciseId);
      if (response.success && response.data) {
        setPrs(response.data);
      } else {
        console.error("Failed to load PRs:", response.message);
        setError(response.message || "Failed to load personal records");
      }
    } catch (err: any) {
      console.error("Error loading PRs:", err);
      setError(err.message || "Failed to load personal records");
    } finally {
      setLoading(false);
    }
  };

  const getFormattedDate = (date: any): string => {
    if (!date?._seconds) return "N/A";
    return formatDate(new Date(date._seconds * 1000));
  };

  // Latest PR is the first item
  const latestPR = prs[0];
  const historyPRs = prs.slice(1);
  const trackingType = useMemo(
    () =>
      typeof id === "string"
        ? getTrackingType(id)
        : ("weight_reps" as TrackingType),
    [id],
  );
  const improvementUnit = getImprovementUnit(trackingType);

  const stickerData: PRStickerData | null = useMemo(() => {
    if (!latestPR) return null;
    const formatted = formatPRValue(latestPR.actualPR, trackingType);
    return {
      exerciseName:
        typeof name === "string" ? name : (latestPR.exerciseName ?? "Exercise"),
      value: formatted.display,
      unit: formatted.unit,
      improvement: latestPR.improvement ?? null,
      improvementUnit,
      date: getFormattedDate(latestPR.date),
    };
  }, [latestPR, trackingType, name, improvementUnit]);

  if (loading) {
    return (
      <Page title="Personal Record" showBackButton contentStyle={{ flex: 1 }}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary[500]} />
          <Text style={styles.loadingText}>Loading PRs...</Text>
        </View>
      </Page>
    );
  }

  if (error || !prs || prs.length === 0) {
    return (
      <Page title="Personal Record" showBackButton contentStyle={{ flex: 1 }}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error || "No PRs found"}</Text>
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
      headerRight={
        <TouchableOpacity
          style={styles.shareBtn}
          onPress={() => guard("prShareSticker", () => setShareModalVisible(true))}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.7}
        >
          <Ionicons
            name="share-social-outline"
            size={20}
            color={Colors.primary[500]}
          />
          <Text style={styles.shareBtnText}>Share PR</Text>
        </TouchableOpacity>
      }
    >
      {/* Main PR Card */}
      <View style={styles.prCard}>
        <View style={styles.cardTopRow}>
          <View style={styles.cardTopLeft}>
            <Text style={styles.exerciseName}>
              {name || latestPR.exerciseName || "Exercise"}
            </Text>
            <Text style={styles.prDate}>{getFormattedDate(latestPR.date)}</Text>
          </View>
          {latestPR.improvement !== null && (
            <Text style={styles.improvement}>
              +{latestPR.improvement} {improvementUnit}
            </Text>
          )}
        </View>
        <View style={styles.cardCenter}>
          <Text style={styles.prValue}>
            {formatPRValue(latestPR.actualPR, trackingType).display}
            <Text style={styles.prUnit}>
              {" "}
              {formatPRValue(latestPR.actualPR, trackingType).unit}
            </Text>
            {trackingType === "weight_reps" && !!latestPR.reps && (
              <Text style={styles.prReps}>
                {" "}
                × {latestPR.reps} REPS
              </Text>
            )}
          </Text>
        </View>
        {latestPR.estimatedPR !== null &&
          latestPR.estimatedPR !== undefined &&
          latestPR.estimatedPR !== latestPR.actualPR && (
            <View style={styles.estimatedBadge}>
              <Ionicons name="sparkles" size={16} color={Colors.primary[500]} />
              <Text style={styles.estimatedLabel}>Next Estimated 1RM = </Text>
              <Text style={styles.estimatedValue}>
                {formatPRValue(latestPR.estimatedPR, trackingType).display}{" "}
                {formatPRValue(latestPR.estimatedPR, trackingType).unit}
              </Text>
            </View>
          )}
      </View>

      <Gap size={24} />

      {/* Tab Switcher — only shown for weight_reps */}
      {trackingType === "weight_reps" && (
        <>
          <View style={styles.tabSwitcher}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "history" && styles.tabActive]}
              onPress={() => setActiveTab("history")}
              activeOpacity={0.7}
            >
              <Ionicons
                name="time-outline"
                size={16}
                color={
                  activeTab === "history"
                    ? Colors.primary[500]
                    : Colors.text.secondary
                }
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === "history" && styles.tabTextActive,
                ]}
              >
                History
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "percentages" && styles.tabActive,
              ]}
              onPress={() => setActiveTab("percentages")}
              activeOpacity={0.7}
            >
              <Ionicons
                name="analytics-outline"
                size={16}
                color={
                  activeTab === "percentages"
                    ? Colors.primary[500]
                    : Colors.text.secondary
                }
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === "percentages" && styles.tabTextActive,
                ]}
              >
                % Calculator
              </Text>
            </TouchableOpacity>
          </View>
          <Gap size={16} />
        </>
      )}
      {trackingType !== "weight_reps" && <Gap size={16} />}

      {activeTab === "percentages" && trackingType === "weight_reps" ? (
        <View style={styles.percentagesList}>
          <View style={styles.percentagesNote}>
            <Ionicons
              name="information-circle-outline"
              size={14}
              color={Colors.text.tertiary}
            />
            <Text style={styles.percentagesNoteText}>
              Values rounded to nearest 2.5 kg (1.25 kg plate)
            </Text>
          </View>
          {PERCENTAGES.map((pct) => {
            const val = computePercentageValue(
              latestPR.actualPR,
              pct,
              trackingType,
            );
            const formatted = formatPRValue(val, trackingType);
            return (
              <View key={pct} style={styles.percentageRow}>
                <View style={styles.percentageLabelContainer}>
                  <Text style={styles.percentageLabel}>{pct}%</Text>
                  <View style={styles.percentageBarTrack}>
                    <View
                      style={[styles.percentageBarFill, { width: `${pct}%` }]}
                    />
                  </View>
                </View>
                <View style={styles.percentageValueContainer}>
                  <Text style={styles.percentageValue} numberOfLines={1}>
                    {formatted.display}{" "}
                    <Text style={styles.percentageUnit}>{formatted.unit}</Text>
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      ) : historyPRs.length === 0 ? (
        <View style={styles.emptyHistory}>
          <Ionicons
            name="barbell-outline"
            size={48}
            color={Colors.text.tertiary}
          />
          <Gap size={12} />
          <Text style={styles.emptyHistoryText}>No previous records yet</Text>
          <Text style={styles.emptyHistorySubtext}>
            Keep training to build your history!
          </Text>
        </View>
      ) : (
        <View style={styles.timeline}>
          {historyPRs.map((pr: any, idx: number) => (
            <View key={idx} style={styles.timelineRow}>
              {/* Timeline connector */}
              {historyPRs.length > 1 && (
                <View style={styles.timelineConnector}>
                  <View style={styles.timelineDot} />
                  {idx < historyPRs.length - 1 && (
                    <View style={styles.timelineLine} />
                  )}
                </View>
              )}
              {/* History card */}
              <View style={styles.historyCard}>
                <View style={styles.historyCardRow}>
                  <Text style={styles.historyWeight}>
                    {formatPRValue(pr.actualPR, trackingType).display}
                    <Text style={styles.historyUnit}>
                      {" "}
                      {formatPRValue(pr.actualPR, trackingType).unit}
                    </Text>
                    {trackingType === "weight_reps" && !!pr.reps && (
                      <Text style={styles.historyReps}> × {pr.reps} REPS</Text>
                    )}
                  </Text>
                  <View style={styles.historyRight}>
                    <View style={styles.rankBadge}>
                      <Text style={styles.rankText}>#{idx + 2}</Text>
                    </View>
                    <View style={styles.dateRow}>
                      <Ionicons
                        name="calendar-outline"
                        size={14}
                        color={Colors.text.secondary}
                      />
                      <Text style={styles.historyDate}>
                        {getFormattedDate(pr.date)}
                      </Text>
                    </View>
                    {pr.improvement !== null && (
                      <View style={styles.improvementBadge}>
                        <Ionicons
                          name="arrow-up"
                          size={12}
                          color={Colors.success[500]}
                        />
                        <Text style={styles.historyImprovement}>
                          {pr.improvement} {improvementUnit}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
      {/* PR Share Modal */}
      {stickerData && (
        <PRShareModal
          visible={shareModalVisible}
          onClose={() => setShareModalVisible(false)}
          data={stickerData}
        />
      )}
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
    fontFamily: FontFamilies.spartanRegular,
    color: Colors.text.secondary,
  },
  errorText: {
    fontSize: FontSizes.bodyMD,
    fontFamily: FontFamilies.spartanRegular,
    color: Colors.error[500],
    textAlign: "center",
  },
  // Main PR Card
  prCard: {
    backgroundColor: Colors.secondary[500],
    borderRadius: 16,
    padding: 24,
    width: "100%",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: Colors.primary[500],
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardTopLeft: {
    flex: 1,
  },
  cardTopRight: {
    alignItems: "flex-end",
    gap: 8,
  },
  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: Colors.primary[500] + "1A",
    borderWidth: 1,
    borderColor: Colors.primary[500] + "50",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  shareBtnText: {
    fontFamily: FontFamilies.spartanBold,
    fontSize: FontSizes.labelXS,
    color: Colors.primary[500],
    letterSpacing: 0.3,
  },
  exerciseName: {
    fontSize: FontSizes.headingLG,
    fontFamily: FontFamilies.poppinsBold,
    color: Colors.text.primary,
    flex: 1,
  },
  improvement: {
    fontSize: FontSizes.headingMD,
    fontFamily: FontFamilies.spartanBold,
    color: Colors.success[500],
  },
  cardCenter: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 24,
    paddingBottom: 16,
  },
  prValue: {
    fontSize: FontSizes.display3XL,
    fontFamily: FontFamilies.spartanBold,
    color: Colors.text.inverse,
  },
  prReps: {
    fontSize: FontSizes.headingXL,
    fontFamily: FontFamilies.spartanBold,
    color: Colors.text.secondary,
  },
  prUnit: {
    fontSize: FontSizes.headingXL,
    fontFamily: FontFamilies.spartanBold,
    color: Colors.text.inverse,
  },
  prDate: {
    fontSize: FontSizes.bodySM,
    fontFamily: FontFamilies.spartanRegular,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  // Estimated PR badge
  estimatedBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: Colors.primary[500] + "1A",
    borderWidth: 1,
    borderColor: Colors.primary[500] + "40",
    borderRadius: 50,
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 0,
  },
  estimatedLabel: {
    fontSize: FontSizes.bodySM,
    fontFamily: FontFamilies.spartanMedium,
    color: Colors.primary[500],
  },
  estimatedValue: {
    fontSize: FontSizes.bodyLG,
    fontFamily: FontFamilies.spartanBold,
    color: Colors.primary[500],
  },
  // Section header
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  sectionTitle: {
    fontSize: FontSizes.heading2XL,
    fontFamily: FontFamilies.poppinsBold,
    color: Colors.text.primary,
  },
  // Empty history
  emptyHistory: {
    alignItems: "center",
    paddingVertical: 40,
    backgroundColor: Colors.secondary[500],
    borderRadius: 16,
  },
  emptyHistoryText: {
    fontSize: FontSizes.bodyLG,
    fontFamily: FontFamilies.spartanMedium,
    color: Colors.text.secondary,
  },
  emptyHistorySubtext: {
    fontSize: FontSizes.bodySM,
    fontFamily: FontFamilies.spartanRegular,
    color: Colors.text.tertiary,
    marginTop: 4,
  },
  // Timeline
  timeline: {
    paddingLeft: 4,
  },
  timelineRow: {
    flexDirection: "row",
    marginBottom: 0,
  },
  timelineConnector: {
    alignItems: "center",
    width: 24,
    marginRight: 12,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary[500],
    marginTop: 20,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.primary[500] + "40",
  },
  // History card
  historyCard: {
    flex: 1,
    backgroundColor: Colors.secondary[500],
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary[500],
  },
  historyCardRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary[500] + "1A",
    borderWidth: 1,
    borderColor: Colors.primary[500] + "40",
    alignItems: "center",
    justifyContent: "center",
  },
  rankText: {
    fontSize: FontSizes.bodySM,
    fontFamily: FontFamilies.spartanBold,
    color: Colors.primary[500],
  },
  historyWeight: {
    fontSize: FontSizes.display2XL,
    fontFamily: FontFamilies.spartanBold,
    color: Colors.text.inverse,
  },
  historyUnit: {
    fontSize: FontSizes.headingMD,
    fontFamily: FontFamilies.spartanBold,
    color: Colors.text.inverse,
  },
  historyReps: {
    fontSize: FontSizes.headingMD,
    fontFamily: FontFamilies.spartanBold,
    color: Colors.text.secondary,
  },
  historyRight: {
    alignItems: "flex-end",
    gap: 6,
  },
  improvementBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.success[500] + "1A",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 50,
    gap: 4,
  },
  historyImprovement: {
    fontSize: FontSizes.bodySM,
    fontFamily: FontFamilies.spartanBold,
    color: Colors.success[500],
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  historyDate: {
    fontSize: FontSizes.bodySM,
    fontFamily: FontFamilies.spartanRegular,
    color: Colors.text.secondary,
  },
  // Tab switcher
  tabSwitcher: {
    flexDirection: "row",
    backgroundColor: Colors.secondary[500],
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: Colors.primary[500] + "20",
    borderWidth: 1,
    borderColor: Colors.primary[500] + "50",
  },
  tabText: {
    fontSize: FontSizes.bodySM,
    fontFamily: FontFamilies.spartanMedium,
    color: Colors.text.secondary,
  },
  tabTextActive: {
    color: Colors.primary[500],
    fontFamily: FontFamilies.spartanBold,
  },
  // Percentages
  percentagesList: {
    gap: 8,
  },
  percentagesNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 4,
    paddingBottom: 4,
  },
  percentagesNoteText: {
    fontSize: FontSizes.labelXS,
    fontFamily: FontFamilies.spartanRegular,
    color: Colors.text.tertiary,
  },
  percentageRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.secondary[500],
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary[500],
  },
  percentageLabelContainer: {
    flex: 1,
    gap: 6,
    marginRight: 16,
  },
  percentageLabel: {
    fontSize: FontSizes.headingLG,
    fontFamily: FontFamilies.spartanBold,
    color: Colors.primary[500],
  },
  percentageBarTrack: {
    height: 4,
    width: "100%",
    backgroundColor: Colors.primary[500] + "25",
    borderRadius: 2,
  },
  percentageBarFill: {
    height: "100%",
    backgroundColor: Colors.primary[500],
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
  percentageValueContainer: {
    flexShrink: 0,
    alignItems: "flex-end",
  },
  percentageValue: {
    fontSize: FontSizes.displayLG,
    fontFamily: FontFamilies.spartanBold,
    color: Colors.text.inverse,
  },
  percentageUnit: {
    fontSize: FontSizes.headingMD,
    fontFamily: FontFamilies.spartanBold,
    color: Colors.text.inverse,
  },
});
