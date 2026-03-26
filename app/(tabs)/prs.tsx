import { personalRecordsService } from "@/api/services";
import { Gap, Page, PRHeader, PRsSkeleton } from "@/components";
import { Colors, FontFamilies, FontSizes, responsiveSize } from "@/constants";
import standardExercises from "@/constants/standardExercises.json";
import { formatShortDate } from "@/utils";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

const PR_PAGE_SIZE = 10;

const TRACKING_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  weight_reps: "barbell-outline",
  reps: "repeat-sharp",
  time: "timer-outline",
  distance: "footsteps-outline",
  pace: "speedometer-outline",
  calories: "flame-outline",
};

const TRACKING_COLORS: Record<string, string> = {
  weight_reps: Colors.primary[500],
  reps: Colors.fitness.strength,
  time: Colors.fitness.flexibility,
  distance: Colors.fitness.rest,
  pace: Colors.fitness.cardio,
  calories: Colors.fitness.cardio,
};

export default function PRsScreen() {
  const [prs, setPrs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PR_PAGE_SIZE);
  const searchInputRef = useRef<TextInput>(null);

  useEffect(() => {
    loadPRs();
  }, []);

  const loadPRs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await personalRecordsService.getAllPersonalRecords();
      console.log("PRsScreen: Load PRs response:", response.data);
      if (response.success && response.data) {
        const data = response.data as any[];
        const sortedPRs = data.sort((a, b) => {
          const dateA = a.date?._seconds || 0;
          const dateB = b.date?._seconds || 0;
          return dateB - dateA;
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
    value: number,
    trackingType: string,
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
        const secsPerKm = value * 1000;
        const mins = Math.floor(secsPerKm / 60);
        const secs = Math.round(secsPerKm % 60);
        if (mins > 0) {
          return {
            display: `${mins}:${secs.toString().padStart(2, "0")}`,
            unit: "MIN/KM",
          };
        }
        return { display: `${Math.round(secsPerKm)}`, unit: "SEC/KM" };
      }
      case "calories":
        return { display: `${value}`, unit: "CAL" };
      default:
        return { display: `${value}`, unit: "" };
    }
  };

  const formatImprovement = (value: number, trackingType: string): string => {
    switch (trackingType) {
      case "weight_reps":
        return `+${value} KG`;
      case "reps":
        return `+${value} REPS`;
      case "time": {
        const mins = Math.floor(value / 60);
        const secs = value % 60;
        if (mins > 0) {
          return `-${mins}:${secs.toString().padStart(2, "0")} MIN`;
        }
        return `-${value} SEC`;
      }
      case "distance":
        return `+${value} M`;
      case "pace": {
        const secsPerKm = Math.round(value * 1000);
        const mins = Math.floor(secsPerKm / 60);
        const secs = secsPerKm % 60;
        if (mins > 0) {
          return `-${mins}:${secs.toString().padStart(2, "0")} MIN/KM`;
        }
        return `-${secsPerKm} SEC/KM`;
      }
      case "calories":
        return `+${value} CAL`;
      default:
        return `+${value}`;
    }
  };

  const getExerciseInfo = (exerciseId: string) => {
    const exercise = standardExercises.find((e) => e.id === exerciseId);
    const trackingType = exercise?.trackingType || "weight_reps";
    let unit = "KG";
    switch (trackingType) {
      case "weight_reps":
        unit = "KG";
        break;
      case "reps":
        unit = "REPS";
        break;
      case "time":
        unit = "SEC";
        break;
      case "distance":
        unit = "M";
        break;
      case "pace":
        unit = "/KM";
        break;
      case "calories":
        unit = "CAL";
        break;
    }
    return {
      unit,
      trackingType,
      icon: TRACKING_ICONS[trackingType] || "barbell-outline",
      color: TRACKING_COLORS[trackingType] || Colors.fitness.strength,
    };
  };

  const handlePRPress = useCallback(
    (exerciseId: string, exerciseName: string) => {
      router.push({
        pathname: `/pr/${exerciseId}`,
        params: { name: exerciseName },
      } as any);
    },
    [],
  );

  // Filter PRs by search query using exerciseId.includes (id is close to name)
  const filteredPRs = useMemo(() => {
    if (!searchQuery.trim()) return prs;
    const q = searchQuery.toLowerCase();
    return prs.filter(
      (pr) =>
        pr.exerciseId?.toLowerCase().includes(q) ||
        pr.exerciseName?.toLowerCase().includes(q),
    );
  }, [prs, searchQuery]);

  // Paginated slice of filtered results
  const visiblePRs = useMemo(
    () => filteredPRs.slice(0, visibleCount),
    [filteredPRs, visibleCount],
  );
  const hasMorePRs = visibleCount < filteredPRs.length;

  // Reset pagination when search changes
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    setVisibleCount(PR_PAGE_SIZE);
  };

  // Find the best/most recent PR for the hero card
  const bestPR = useMemo(() => {
    if (filteredPRs.length === 0) return null;
    return filteredPRs[0];
  }, [filteredPRs]);

  const remainingPRs = useMemo(() => {
    if (visiblePRs.length <= 1) return [];
    return visiblePRs.slice(1);
  }, [visiblePRs]);

  // Summary stats
  const stats = useMemo(() => {
    const totalPRs = prs.length;
    const withImprovement = prs.filter(
      (pr) => pr.improvement !== null && pr.improvement > 0,
    ).length;
    return { totalPRs, withImprovement };
  }, [prs]);

  if (loading) {
    return <PRsSkeleton />;
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
      <Page showBackButton={false} contentStyle={{ flex: 1 }} scrollable={false}>
        <PRHeader />
        <Gap size={24} />

        <View style={styles.emptyHeroCard}>
          <View style={styles.emptyHeroGlow} />
          <View style={styles.emptyHeroRing}>
            <Ionicons name="trophy-outline" size={48} color={Colors.primary[500]} />
          </View>
          <Gap size={18} />
          <Text style={styles.emptyHeroTitle}>No Records Yet</Text>
          <Text style={styles.emptyHeroSubtitle}>
            Your personal bests will appear here as you complete workouts.
          </Text>
        </View>

        <Gap size={24} />

        {([
          { icon: "barbell-outline", label: "Complete a workout", desc: "Log any exercise through a WOD" },
          { icon: "checkmark-circle-outline", label: "Record gets saved", desc: "Your best effort is tracked automatically" },
          { icon: "trending-up-outline", label: "Watch it grow", desc: "See your improvements over time" },
        ] as const).map((step, i) => (
          <View key={i} style={styles.emptyStepRow}>
            <View style={styles.emptyStepIcon}>
              <Ionicons name={step.icon} size={18} color={Colors.primary[500]} />
            </View>
            <View style={styles.emptyStepText}>
              <Text style={styles.emptyStepLabel}>{step.label}</Text>
              <Text style={styles.emptyStepDesc}>{step.desc}</Text>
            </View>
          </View>
        ))}

        <Gap size={32} />

        <TouchableOpacity
          style={styles.emptyCtaButton}
          onPress={() => router.push("/(tabs)/" as any)}
          activeOpacity={0.85}
        >
          <View style={styles.emptyCtaGlow} />
          <Ionicons name="barbell-outline" size={20} color="#0D0D14" />
          <Text style={styles.emptyCtaText}>Go to Workouts</Text>
        </TouchableOpacity>

        <Gap size={160} />
      </Page>
    );
  }

  return (
    <Page showBackButton={false}>
      <PRHeader />
      {/* Search Input */}
      <Pressable
        style={styles.searchContainer}
        onPress={() => searchInputRef.current?.focus()}
      >
        <Ionicons
          name="search"
          size={responsiveSize(18)}
          color={Colors.text.tertiary}
          style={styles.searchIcon}
        />
        <TextInput
          ref={searchInputRef}
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={handleSearchChange}
          placeholder="Search by exercise name..."
          placeholderTextColor={Colors.text.tertiary}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
      </Pressable>

      <Gap size={24} />

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <View
            style={[
              styles.statIconBg,
              { backgroundColor: Colors.primary[500] + "20" },
            ]}
          >
            <Ionicons name="trophy" size={responsiveSize(18)} color={Colors.primary[500]} />
          </View>
          <Text style={styles.statValue}>{stats.totalPRs}</Text>
          <Text style={styles.statLabel}>Total PRs</Text>
        </View>
        <View style={styles.statCard}>
          <View
            style={[
              styles.statIconBg,
              { backgroundColor: Colors.success[500] + "20" },
            ]}
          >
            <Ionicons
              name="trending-up"
              size={responsiveSize(18)}
              color={Colors.success[500]}
            />
          </View>
          <Text style={styles.statValue}>{stats.withImprovement}</Text>
          <Text style={styles.statLabel}>Improved</Text>
        </View>
        <View style={styles.statCard}>
          <View
            style={[
              styles.statIconBg,
              { backgroundColor: Colors.fitness.flexibility + "20" },
            ]}
          >
            <Ionicons
              name="flame"
              size={responsiveSize(18)}
              color={Colors.fitness.flexibility}
            />
          </View>
          <Text style={styles.statValue}>
            {prs.length > 0
              ? formatShortDate(new Date(prs[0].date?._seconds * 1000))
              : "-"}
          </Text>
          <Text style={styles.statLabel}>Latest</Text>
        </View>
      </View>

      <Gap size={20} />

      {filteredPRs.length === 0 && searchQuery.length > 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons
            name="search-outline"
            size={responsiveSize(48)}
            color={Colors.text.tertiary}
          />
          <Gap size={12} />
          <Text style={styles.emptyTitle}>No Results</Text>
          <Text style={styles.emptyText}>No PRs found for "{searchQuery}"</Text>
        </View>
      ) : (
        <>
          {/* Hero Card — Latest PR */}
          {bestPR && (
            <>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
              >
                <Ionicons name="star" size={responsiveSize(18)} color={Colors.primary[500]} />
                <Text style={styles.sectionTitle}>Latest Record</Text>
              </View>
              <Gap size={10} />
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() =>
                  handlePRPress(bestPR.exerciseId, bestPR.exerciseName)
                }
              >
                <View style={styles.heroCard}>
                  <View style={styles.heroAccent} />
                  <View style={styles.heroBody}>
                    <View style={styles.heroTop}>
                      <View style={styles.heroInfo}>
                        <View style={styles.heroNameRow}>
                          <View
                            style={[
                              styles.heroTypeBadge,
                              {
                                backgroundColor:
                                  getExerciseInfo(bestPR.exerciseId).color +
                                  "25",
                              },
                            ]}
                          >
                            <Ionicons
                              name={
                                getExerciseInfo(bestPR.exerciseId)
                                  .icon as keyof typeof Ionicons.glyphMap
                              }
                              size={responsiveSize(14)}
                              color={getExerciseInfo(bestPR.exerciseId).color}
                            />
                          </View>
                          <Text style={styles.heroName} numberOfLines={1}>
                            {bestPR.exerciseName}
                          </Text>
                        </View>
                        <View style={styles.heroDateRow}>
                          <Ionicons
                            name="calendar-outline"
                            size={responsiveSize(12)}
                            color={Colors.text.secondary}
                          />
                          <Text style={styles.heroDate}>
                            {formatShortDate(
                              new Date(bestPR.date?._seconds * 1000),
                            )}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.heroValueContainer}>
                        <Text style={styles.heroValue}>
                          {
                            formatPRValue(
                              bestPR.actualPR,
                              getExerciseInfo(bestPR.exerciseId).trackingType,
                            ).display
                          }
                        </Text>
                        <Text style={styles.heroUnit}>
                          {
                            formatPRValue(
                              bestPR.actualPR,
                              getExerciseInfo(bestPR.exerciseId).trackingType,
                            ).unit
                          }
                        </Text>
                      </View>
                    </View>
                    {bestPR.improvement !== null && bestPR.improvement > 0 && (
                      <View style={styles.heroImprovementRow}>
                        <View style={styles.heroImprovementPill}>
                          <Ionicons
                            name="arrow-up"
                            size={responsiveSize(12)}
                            color={Colors.success[500]}
                          />
                          <Text style={styles.heroImprovementText}>
                            {formatImprovement(
                              bestPR.improvement,
                              getExerciseInfo(bestPR.exerciseId).trackingType,
                            )}
                          </Text>
                        </View>
                        <Text style={styles.heroImprovementLabel}>
                          from previous best
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.heroChevron}>
                    <Ionicons
                      name="chevron-forward"
                      size={responsiveSize(20)}
                      color={Colors.primary[400]}
                    />
                  </View>
                </View>
              </TouchableOpacity>
              <Gap size={24} />
            </>
          )}

          {/* All PRs List */}
          {remainingPRs.length > 0 && (
            <>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
              >
                <Ionicons name="list" size={responsiveSize(16)} color={Colors.text.secondary} />
                <Text style={styles.sectionTitle}>All Records</Text>
              </View>
              <Gap size={10} />
              {remainingPRs.map((pr, index) => {
                const info = getExerciseInfo(pr.exerciseId);
                return (
                  <View key={pr.exerciseName + pr.date?._seconds}>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() =>
                        handlePRPress(pr.exerciseId, pr.exerciseName)
                      }
                    >
                      <View style={styles.prCard}>
                        {/* Left accent */}
                        <View
                          style={[
                            styles.cardAccent,
                            { backgroundColor: info.color },
                          ]}
                        />
                        {/* Icon */}
                        <View
                          style={[
                            styles.cardIconContainer,
                            { backgroundColor: info.color + "18" },
                          ]}
                        >
                          <Ionicons
                            name={info.icon as keyof typeof Ionicons.glyphMap}
                            size={responsiveSize(20)}
                            color={info.color}
                          />
                        </View>
                        {/* Content */}
                        <View style={styles.cardBody}>
                          <Text style={styles.cardName} numberOfLines={1}>
                            {pr.exerciseName}
                          </Text>
                          <View style={styles.cardMeta}>
                            <Ionicons
                              name="calendar-outline"
                              size={responsiveSize(11)}
                              color={Colors.text.secondary}
                            />
                            <Text style={styles.cardDate}>
                              {formatShortDate(
                                new Date(pr.date?._seconds * 1000),
                              )}
                            </Text>
                            {pr.improvement !== null && pr.improvement > 0 && (
                              <View style={styles.cardImprovementPill}>
                                <Ionicons
                                  name="arrow-up"
                                  size={responsiveSize(10)}
                                  color={Colors.success[500]}
                                />
                                <Text style={styles.cardImprovementText}>
                                  {formatImprovement(
                                    pr.improvement,
                                    info.trackingType,
                                  )}
                                </Text>
                              </View>
                            )}
                          </View>
                        </View>
                        {/* Value */}
                        <View style={styles.cardValueContainer}>
                          <Text style={styles.cardValue}>
                            {
                              formatPRValue(pr.actualPR, info.trackingType)
                                .display
                            }
                          </Text>
                          <Text style={styles.cardUnit}>
                            {formatPRValue(pr.actualPR, info.trackingType).unit}
                          </Text>
                        </View>
                        {/* Chevron */}
                        <View style={styles.cardChevron}>
                          <Ionicons
                            name="chevron-forward"
                            size={responsiveSize(18)}
                            color={Colors.neutral[600]}
                          />
                        </View>
                      </View>
                    </TouchableOpacity>
                    {index < remainingPRs.length - 1 && <Gap size={10} />}
                  </View>
                );
              })}
            </>
          )}

          {/* Load More */}
          {hasMorePRs && (
            <>
              <Gap size={16} />
              <TouchableOpacity
                style={styles.loadMoreButton}
                onPress={() => setVisibleCount((c) => c + PR_PAGE_SIZE)}
                activeOpacity={0.75}
              >
                <Ionicons
                  name="chevron-down"
                  size={responsiveSize(16)}
                  color={Colors.primary[500]}
                />
                <Text style={styles.loadMoreText}>Load More</Text>
              </TouchableOpacity>
            </>
          )}
        </> // closes filteredPRs.length === 0 else branch
      )}
      <Gap size={24} />
    </Page>
  );
}

const styles = StyleSheet.create({
  // ── Loading / Error / Empty ───────────────────────────
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
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary[500] + "15",
    borderWidth: 2,
    borderColor: Colors.primary[500] + "30",
    alignItems: "center",
    justifyContent: "center",
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

  // ── PR Empty state ────────────────────────────────────
  emptyHeroCard: {
    backgroundColor: Colors.secondary[600],
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.primary[500] + "25",
    overflow: "hidden",
  },
  emptyHeroGlow: {
    position: "absolute",
    top: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.primary[500] + "18",
  },
  emptyHeroRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.primary[500] + "15",
    borderWidth: 1.5,
    borderColor: Colors.primary[500] + "40",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyHeroTitle: {
    fontFamily: FontFamilies.spartanBold,
    fontSize: FontSizes.headingXL,
    color: Colors.text.primary,
    textAlign: "center",
    marginBottom: 10,
  },
  emptyHeroSubtitle: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodyMD,
    color: Colors.text.secondary,
    textAlign: "center",
    lineHeight: 22,
  },
  emptyStepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[700] + "60",
  },
  emptyStepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary[500] + "15",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  emptyStepText: {
    flex: 1,
  },
  emptyStepLabel: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodySM,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  emptyStepDesc: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodyXS,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
  emptyCtaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: Colors.primary[500],
    borderRadius: 16,
    paddingVertical: 16,
    overflow: "hidden",
  },
  emptyCtaGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 30,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  emptyCtaText: {
    fontFamily: FontFamilies.poppinsBold,
    fontSize: FontSizes.bodyMD,
    color: "#0D0D14",
  },

  // ── Stats Row ─────────────────────────────────────────
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.secondary[600],
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    gap: 6,
  },
  statIconBg: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    fontSize: FontSizes.bodySM,
    fontFamily: FontFamilies.spartanSemiBold,
    color: Colors.text.inverse,
  },
  statLabel: {
    fontSize: FontSizes.bodyXS,
    fontFamily: FontFamilies.poppinsRegular,
    color: Colors.text.secondary,
  },

  // ── Section Header ────────────────────────────────────
  sectionTitle: {
    fontSize: FontSizes.headingLG,
    fontFamily: FontFamilies.poppinsSemiBold,
    color: Colors.text.primary,
    letterSpacing: 0.5,
  },

  // ── Hero Card (Latest PR) ────────────────────────────
  heroCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.secondary[500],
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.primary[500] + "50",
  },
  heroAccent: {
    width: 5,
    alignSelf: "stretch",
    backgroundColor: Colors.primary[500],
  },
  heroBody: {
    flex: 1,
    padding: 18,
    gap: 12,
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  heroInfo: {
    flex: 1,
    gap: 6,
    marginRight: 12,
  },
  heroNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  heroTypeBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  heroName: {
    fontSize: FontSizes.headingXL,
    fontFamily: FontFamilies.poppinsBold,
    color: Colors.text.inverse,
    flex: 1,
  },
  heroDateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginLeft: 36,
  },
  heroDate: {
    fontSize: FontSizes.bodyXS,
    fontFamily: FontFamilies.poppinsRegular,
    color: Colors.text.secondary,
  },
  heroValueContainer: {
    alignItems: "flex-end",
  },
  heroValue: {
    fontSize: FontSizes.displayXL,
    fontFamily: FontFamilies.spartanBold,
    color: Colors.primary[500],
    lineHeight: FontSizes.displayXL * 1.05,
  },
  heroUnit: {
    fontSize: FontSizes.bodySM,
    fontFamily: FontFamilies.poppinsBold,
    color: Colors.text.secondary,
    marginTop: -2,
  },
  heroImprovementRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginLeft: 36,
  },
  heroImprovementPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: Colors.success[500] + "18",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  heroImprovementText: {
    fontSize: FontSizes.bodyXS,
    fontFamily: FontFamilies.spartanBold,
    color: Colors.success[500],
  },
  heroImprovementLabel: {
    fontSize: FontSizes.bodyXS,
    fontFamily: FontFamilies.poppinsRegular,
    color: Colors.text.secondary,
  },
  heroChevron: {
    paddingRight: 14,
  },

  // ── PR Cards (All Records) ───────────────────────────
  prCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.secondary[600],
    borderRadius: 14,
    overflow: "hidden",
  },
  cardAccent: {
    width: 4,
    alignSelf: "stretch",
  },
  cardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 14,
  },
  cardBody: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    gap: 4,
  },
  cardName: {
    fontSize: FontSizes.headingMD,
    fontFamily: FontFamilies.poppinsSemiBold,
    color: Colors.text.inverse,
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  cardDate: {
    fontSize: FontSizes.bodyXS,
    fontFamily: FontFamilies.poppinsRegular,
    color: Colors.text.secondary,
  },
  cardImprovementPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: Colors.success[500] + "15",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 6,
  },
  cardImprovementText: {
    fontSize: responsiveSize(10),
    fontFamily: FontFamilies.spartanBold,
    color: Colors.success[500],
  },
  cardValueContainer: {
    alignItems: "flex-end",
    marginRight: 4,
  },
  cardValue: {
    fontSize: FontSizes.heading2XL,
    fontFamily: FontFamilies.spartanBold,
    color: Colors.text.inverse,
  },
  cardUnit: {
    fontSize: FontSizes.bodyXS,
    fontFamily: FontFamilies.poppinsBold,
    color: Colors.text.secondary,
    marginTop: -4,
  },
  cardChevron: {
    paddingHorizontal: 10,
  },

  // ── Search ─────────────────────────────────────────────
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.secondary[600],
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 10,
    borderWidth: 0.5,
    borderColor: Colors.primary[400],
  },
  searchIcon: {
    flexShrink: 0,
  },
  searchInput: {
    flex: 1,
    fontFamily: FontFamilies.spartanMedium,
    fontSize: FontSizes.bodyMD,
    color: Colors.text.inverse,
    padding: 0,
  },

  // ── Load More ──────────────────────────────────────────
  loadMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.primary[500] + "40",
    backgroundColor: Colors.secondary[600],
  },
  loadMoreText: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodyMD,
    color: Colors.primary[500],
  },
});
