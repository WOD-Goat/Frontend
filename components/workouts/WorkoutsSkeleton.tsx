import { Colors, FontSizes, responsiveSize } from "@/constants";
import { StyleSheet, View } from "react-native";
import { HeaderSection } from "../home";
import Gap from "../ui/Gap";
import Page from "../ui/Page";
import Skeleton from "../ui/Skeleton";

export default function WorkoutsSkeleton({ userName, user }: { userName: string; user: any }) {
  return (
    <Page showBackButton={false}>
      <HeaderSection
        userName={userName}
        streakDays={user?.statsSummary.currentStreak}
      />
      <Gap size={12} />

      {/* Week strip — mirrors WeekStrip row + cell sizing exactly */}
      <View style={styles.strip}>
        {Array.from({ length: 7 }).map((_, i) => (
          <View key={i} style={styles.cell}>
            {/* dayLetter: fontSize 10 */}
            <Skeleton width={responsiveSize(20)} height={responsiveSize(10)} borderRadius={3} />
            {/* dayNum: fontSize 26, lineHeight 28 */}
            <Skeleton width={responsiveSize(26)} height={responsiveSize(28)} borderRadius={5} />
            {/* dot: 6×6 */}
            <Skeleton width={responsiveSize(6)} height={responsiveSize(6)} borderRadius={responsiveSize(3)} />
          </View>
        ))}
      </View>

      <Gap size={10} />

      {/* Eyebrow row — marginBottom 10 matches card's eyebrow */}
      <View style={styles.eyebrow}>
        {/* eyebrowDay: fontSize headingMD (16) */}
        <Skeleton width={responsiveSize(110)} height={FontSizes.headingMD} borderRadius={5} />
        {/* statusPill: bodyXS (12) + paddingVertical 4*2 = ~20h, width ~90 */}
        <Skeleton width={responsiveSize(90)} height={responsiveSize(20)} borderRadius={responsiveSize(20)} />
      </View>

      <Gap size={10} />

      {/* Day workout card — padding 20, gap 8 */}
      <View style={styles.card}>
        {/* title: fontSize 22, lineHeight 28 */}
        <Skeleton width="65%" height={responsiveSize(28)} borderRadius={6} />
        {/* subLine: fontSize 13 */}
        <Skeleton width={responsiveSize(120)} height={responsiveSize(13)} borderRadius={4} />

        {/* divider */}
        <View style={styles.divider} />

        {/* WOD row 1 */}
        <WodRowSkeleton />

        {/* WOD separator: marginVertical 10, marginLeft 52 */}
        <View style={styles.wodSep} />

        {/* WOD row 2 */}
        <WodRowSkeleton />

        {/* Footer: paddingTop 10, marginTop 2 */}
        <View style={styles.footer}>
          <Skeleton width={responsiveSize(72)} height={FontSizes.bodyXS} borderRadius={4} />
        </View>
      </View>
    </Page>
  );
}

function WodRowSkeleton() {
  return (
    <View style={styles.wodRow}>
      {/* wodNumeral: fontSize 32, lineHeight 36, width 44 */}
      <Skeleton width={responsiveSize(44)} height={responsiveSize(36)} borderRadius={5} />
      {/* wodBody: paddingTop 4, gap 4 */}
      <View style={styles.wodBody}>
        {/* wodName: fontSize 15 */}
        <Skeleton width="42%" height={responsiveSize(15)} borderRadius={4} />
        <Gap size={responsiveSize(4)} />
        {/* 3 body text lines: fontSize 13, lineHeight 20 */}
        <Skeleton width="92%" height={responsiveSize(13)} borderRadius={4} />
        <Gap size={responsiveSize(4)} />
        <Skeleton width="78%" height={responsiveSize(13)} borderRadius={4} />
        <Gap size={responsiveSize(4)} />
        <Skeleton width="60%" height={responsiveSize(13)} borderRadius={4} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // WeekStrip: paddingHorizontal 6, paddingVertical 6, gap 4, borderRadius 20
  strip: {
    flexDirection: "row",
    backgroundColor: Colors.secondary[700],
    borderRadius: responsiveSize(20),
    paddingHorizontal: responsiveSize(6),
    paddingVertical: responsiveSize(6),
    borderWidth: 1,
    borderColor: Colors.neutral[700],
    gap: responsiveSize(4),
  },
  // Cell: paddingVertical 8, paddingHorizontal 2, gap 3, borderWidth 1
  cell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: responsiveSize(8),
    paddingHorizontal: responsiveSize(2),
    gap: responsiveSize(3),
    borderWidth: 1,
    borderColor: "transparent",
  },
  // Eyebrow: paddingHorizontal 2, marginBottom 10
  eyebrow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: responsiveSize(2),
    marginBottom: responsiveSize(10),
  },
  // Card: padding 20, gap 8, borderRadius 22
  card: {
    backgroundColor: Colors.secondary[700],
    borderRadius: responsiveSize(22),
    borderWidth: 1,
    borderColor: Colors.neutral[700],
    padding: responsiveSize(20),
    gap: responsiveSize(8),
  },
  // Divider: height 1, marginVertical 4
  divider: {
    height: 1,
    backgroundColor: Colors.neutral[700],
    marginVertical: responsiveSize(4),
  },
  // WOD row: gap 8
  wodRow: {
    flexDirection: "row",
    gap: responsiveSize(8),
    alignItems: "flex-start",
  },
  // WOD body: paddingTop 4
  wodBody: {
    flex: 1,
    paddingTop: responsiveSize(4),
  },
  // WOD separator: height 1, marginVertical 10, marginLeft 52
  wodSep: {
    height: 1,
    backgroundColor: Colors.neutral[700] + "80",
    marginVertical: responsiveSize(10),
    marginLeft: responsiveSize(52),
  },
  // Footer: paddingTop 10, marginTop 2, borderTopWidth 1
  footer: {
    alignItems: "flex-end",
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[700],
    paddingTop: responsiveSize(10),
    marginTop: responsiveSize(2),
  },
});
