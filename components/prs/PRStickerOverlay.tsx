import { appIcons } from "@/assets/images";
import { FontFamilies } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, View } from "react-native";

// ─── Public types ─────────────────────────────────────────────────────────────

export type StickerVariant = "blaze" | "gold" | "frost";

export const VARIANT_ACCENTS: Record<StickerVariant, string> = {
  blaze: "#FF6B2C",
  gold: "#FF6B2C",
  frost: "#FFFFFF",
};

export interface PRStickerData {
  exerciseName: string;
  value: string;
  unit: string;
  improvement: number | null;
  improvementUnit: string;
  date: string;
}

interface PRStickerOverlayProps {
  data: PRStickerData;
  variant?: StickerVariant;
}

const W = 300;
const H = 340;

// ─────────────────────────────────────────────────────────────────────────────
// BLAZE  —  Dark blocks, left-aligned, orange fire energy
// Layout: badge + divider → exercise name → giant value → improvement → date
//         branding footer strip at bottom
// ─────────────────────────────────────────────────────────────────────────────
function BlazeSticker({ data }: { data: PRStickerData }) {
  const { exerciseName, value, unit, improvement, improvementUnit } = data;
  return (
    <View style={b.root}>
      <View style={b.circle1} />
      <View style={b.circle2} />
      <View style={b.circle3} />
      <View style={b.topBar} />

      <View style={b.content}>
        <View style={b.badgeRow}>
          <View style={b.badge}>
            <Ionicons name="trophy" size={13} color="#1C1C1C" />
            <Text style={b.badgeText}>NEW PERSONAL RECORD</Text>
          </View>
        </View>
        <View style={b.brandMark}>
          <Image
            source={appIcons.logo}
            style={b.brandMarkLogo}
            resizeMode="contain"
          />
          <Text style={b.brandMarkName}>WODGOAT</Text>
        </View>
        <View style={b.divider} />
        <Text style={b.exerciseName} numberOfLines={2}>
          {exerciseName.toUpperCase()}
        </Text>
        <View style={b.valueBlock}>
          <Text style={b.value}>{value}</Text>
          <Text style={b.unit}>{unit}</Text>
        </View>
        {improvement !== null && improvement > 0 && (
          <View style={b.improvBadge}>
            <Ionicons name="arrow-up" size={13} color="#34C759" />
            <Text style={b.improvText}>
              +{improvement} {improvementUnit} IMPROVEMENT
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const b = StyleSheet.create({
  root: {
    width: W,
    height: H,
    backgroundColor: "#141414",
    borderRadius: 20,
    overflow: "hidden",
  },
  circle1: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "#FF6B2C",
    opacity: 0.07,
    top: -80,
    right: -60,
  },
  circle2: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FF8E5C",
    opacity: 0.09,
    bottom: 60,
    left: -30,
  },
  circle3: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFD60A",
    opacity: 0.06,
    top: 180,
    right: 20,
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 5,
    backgroundColor: "#FF6B2C",
  },
  content: {
    flex: 1,
    paddingTop: 16,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  badgeRow: { flexDirection: "row", marginBottom: 6 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF6B2C",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    gap: 6,
  },
  badgeText: {
    fontFamily: FontFamilies.spartanBold,
    fontSize: 11,
    color: "#1C1C1C",
    letterSpacing: 1.2,
  },
  divider: {
    height: 2,
    width: 48,
    backgroundColor: "#FF6B2C",
    borderRadius: 1,
    marginBottom: 10,
  },
  exerciseName: {
    fontFamily: FontFamilies.spartanBlack,
    fontSize: 20,
    color: "#E6EDF3",
    letterSpacing: 1,
    lineHeight: 24,
    marginBottom: 10,
  },
  valueBlock: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 10,
  },
  value: {
    fontFamily: FontFamilies.spartanBlack,
    fontSize: 68,
    color: "#FF6B2C",
    lineHeight: 68,
    letterSpacing: -2,
    includeFontPadding: false,
  },
  unit: {
    fontFamily: FontFamilies.spartanBold,
    fontSize: 22,
    color: "#FF9A6C",
    marginBottom: 6,
    marginLeft: 8,
    letterSpacing: 1,
  },
  improvBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(52,199,89,0.12)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: "flex-start",
    gap: 5,
    borderWidth: 1,
    borderColor: "rgba(52,199,89,0.25)",
  },
  improvText: {
    fontFamily: FontFamilies.spartanSemiBold,
    fontSize: 12,
    color: "#34C759",
    letterSpacing: 0.5,
  },
  brandMark: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 8,
  },
  brandMarkLogo: { width: 22, height: 22 },
  brandMarkName: {
    fontFamily: FontFamilies.spartanBlack,
    fontSize: 13,
    color: "#E6EDF3",
    letterSpacing: 0,
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// GOLD RUSH  —  Centered trophy card; branding at top; all content centered
// Layout: top branding → divider → centered: trophy icon, label, name,
//         value, unit, improvement, date → no footer
// ─────────────────────────────────────────────────────────────────────────────
function GoldSticker({ data }: { data: PRStickerData }) {
  const { exerciseName, value, unit, improvement, improvementUnit } = data;
  return (
    <View style={g.root}>
      <View style={g.glowTop} />
      <View style={g.glowBottom} />

      {/* ── Centered body ── */}
      <View style={g.center}>
        <Ionicons name="trophy" size={46} color="#FF6B2C" />
        <Text style={g.newPrText}>NEW PERSONAL RECORD</Text>
        <View style={g.brandMark}>
          <Image
            source={appIcons.logo}
            style={g.brandMarkLogo}
            resizeMode="contain"
          />
          <Text style={g.brandMarkName}>WODGOAT</Text>
        </View>
        <Text style={g.exerciseName} numberOfLines={2}>
          {exerciseName.toUpperCase()}
        </Text>
        <View style={g.centerDivider} />
        <Text style={g.value}>{value}</Text>
        <Text style={g.unit}>{unit}</Text>
        {improvement !== null && improvement > 0 && (
          <View style={g.improvBadge}>
            <Ionicons name="arrow-up" size={13} color="#34C759" />
            <Text style={g.improvText}>
              +{improvement} {improvementUnit} IMPROVEMENT
            </Text>
          </View>
        )}
      </View>

      {/* ── Bottom bar ── */}
      <View style={g.bottomBar} />
    </View>
  );
}

const g = StyleSheet.create({
  root: {
    width: W,
    height: H,
    backgroundColor: "#0D0805",
    borderRadius: 20,
    overflow: "hidden",
  },
  glowTop: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#FF6B2C",
    opacity: 0.08,
    top: -80,
    left: -40,
  },
  glowBottom: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#FF8E5C",
    opacity: 0.07,
    bottom: -40,
    right: -40,
  },
  brandMark: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 6,
    marginBottom: 2,
  },
  brandMarkLogo: { width: 22, height: 22 },
  brandMarkName: {
    fontFamily: FontFamilies.spartanBlack,
    fontSize: 13,
    color: "#FF6B2C",
    letterSpacing: 0,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  newPrText: {
    fontFamily: FontFamilies.spartanBold,
    fontSize: 11,
    color: "#FF6B2C",
    letterSpacing: 2.5,
    marginTop: 6,
  },
  exerciseName: {
    fontFamily: FontFamilies.spartanBlack,
    fontSize: 18,
    color: "#F0E0D6",
    letterSpacing: 0.5,
    textAlign: "center",
    marginTop: 4,
    lineHeight: 22,
  },
  centerDivider: {
    height: 1,
    width: 80,
    backgroundColor: "rgba(255,107,44,0.4)",
    marginVertical: 10,
  },
  value: {
    fontFamily: FontFamilies.spartanBlack,
    fontSize: 72,
    color: "#FFFFFF",
    letterSpacing: -2,
    lineHeight: 72,
    includeFontPadding: false,
  },
  unit: {
    fontFamily: FontFamilies.spartanBold,
    fontSize: 20,
    color: "#FF6B2C",
    letterSpacing: 2,
    marginTop: 2,
  },
  improvBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(52,199,89,0.12)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "rgba(52,199,89,0.2)",
  },
  improvText: {
    fontFamily: FontFamilies.spartanSemiBold,
    fontSize: 11,
    color: "#34C759",
  },
  bottomBar: { height: 4, backgroundColor: "#FF6B2C" },
});

const v = StyleSheet.create({
  root: {
    width: W,
    height: H,
    backgroundColor: "#0E0A1A",
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#9B5CFF",
  },
  topBanner: {
    backgroundColor: "#9B5CFF",
    paddingHorizontal: 28,
    paddingVertical: 11,
  },
  bannerText: {
    fontFamily: FontFamilies.spartanBold,
    fontSize: 11,
    color: "#FFFFFF",
    letterSpacing: 2.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 22,
    justifyContent: "center",
  },
  exerciseName: {
    fontFamily: FontFamilies.spartanBlack,
    fontSize: 28,
    color: "#E6E0F8",
    letterSpacing: 0.5,
    lineHeight: 32,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(155,92,255,0.4)",
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  statsLeft: {},
  value: {
    fontFamily: FontFamilies.spartanBlack,
    fontSize: 80,
    color: "#9B5CFF",
    lineHeight: 80,
    letterSpacing: -2,
    includeFontPadding: false,
  },
  unit: {
    fontFamily: FontFamilies.spartanBold,
    fontSize: 22,
    color: "#C49EFF",
    letterSpacing: 1,
    marginTop: 2,
  },
  statsRight: { paddingTop: 10, gap: 10, alignItems: "flex-end" },
  improvBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(52,199,89,0.12)",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "rgba(52,199,89,0.2)",
  },
  improvText: {
    fontFamily: FontFamilies.spartanSemiBold,
    fontSize: 12,
    color: "#34C759",
  },
  dateRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  dateText: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: 11,
    color: "#8E88A0",
  },
  bottomBrand: { paddingHorizontal: 28, paddingBottom: 22 },
  brandDivider: {
    height: 1,
    backgroundColor: "rgba(155,92,255,0.25)",
    marginBottom: 14,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  logo: { width: 22, height: 22 },
  brandName: {
    fontFamily: FontFamilies.spartanBlack,
    fontSize: 17,
    color: "#9B5CFF",
    letterSpacing: 6,
    opacity: 0.9,
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// FROST  —  Transparent frosted-glass card; centered branding + PR info
// Layout: logo + app name → divider → exercise name → value → improvement → date
// ─────────────────────────────────────────────────────────────────────────────
function FrostSticker({ data }: { data: PRStickerData }) {
  const { exerciseName, value, unit, improvement, improvementUnit } = data;
  return (
    <View style={fr.root}>
      {/* Diagonal transparent ribbon */}
      <View style={fr.ribbon} pointerEvents="none">
        <Text style={fr.ribbonText}>TRANSPARENT</Text>
      </View>

      {/* Body */}
      <View style={fr.body}>
        <View style={fr.brandMark}>
          <Image
            source={appIcons.logo}
            style={fr.brandMarkLogo}
            resizeMode="contain"
          />
          <Text style={fr.brandMarkName}>WODGOAT</Text>
        </View>
        <Text style={fr.label}>PERSONAL RECORD</Text>
        <Text style={fr.exerciseName} numberOfLines={2}>
          {exerciseName.toUpperCase()}
        </Text>
        <View style={fr.valueRow}>
          <Text style={fr.value}>{value}</Text>
          <Text style={fr.unit}>{unit}</Text>
        </View>
        {improvement !== null && improvement > 0 && (
          <View style={fr.improvBadge}>
            <Ionicons name="arrow-up" size={12} color="rgba(255,255,255,0.9)" />
            <Text style={fr.improvText}>
              +{improvement} {improvementUnit}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const fr = StyleSheet.create({
  root: {
    width: W,
    height: H,
    backgroundColor: "transparent",
    borderRadius: 20,
    overflow: "hidden",
  },
  ribbon: {
    position: "absolute",
    top: 30,
    right: -40,
    width: 160,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    transform: [{ rotate: "45deg" }],
    alignItems: "center",
    paddingVertical: 5,
    zIndex: 10,
  },
  ribbonText: {
    fontFamily: FontFamilies.spartanBold,
    fontSize: 8,
    color: "rgba(255,255,255,0.5)",
    letterSpacing: 2,
  },
  brandMark: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 10,
  },
  brandMarkLogo: { width: 22, height: 22 },
  brandMarkName: {
    fontFamily: FontFamilies.spartanBlack,
    fontSize: 13,
    color: "rgba(255,255,255,0.95)",
    letterSpacing: 0,
  },
  body: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  label: {
    fontFamily: FontFamilies.spartanBold,
    fontSize: 10,
    color: "rgba(255,255,255,0.65)",
    letterSpacing: 2.5,
    marginBottom: 6,
  },
  exerciseName: {
    fontFamily: FontFamilies.spartanBlack,
    fontSize: 20,
    color: "rgba(255,255,255,0.92)",
    letterSpacing: 0.5,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 12,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
    marginBottom: 12,
  },
  value: {
    fontFamily: FontFamilies.spartanBlack,
    fontSize: 76,
    color: "rgba(255,255,255,0.95)",
    lineHeight: 76,
    letterSpacing: -3,
    includeFontPadding: false,
  },
  unit: {
    fontFamily: FontFamilies.spartanBold,
    fontSize: 20,
    color: "rgba(255,255,255,0.75)",
    marginBottom: 8,
    letterSpacing: 1,
  },
  improvBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  improvText: {
    fontFamily: FontFamilies.spartanSemiBold,
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    letterSpacing: 0.5,
  },
});

// ─── Entry point ──────────────────────────────────────────────────────────────

export default function PRStickerOverlay({
  data,
  variant = "blaze",
}: PRStickerOverlayProps) {
  switch (variant) {
    case "gold":
      return <GoldSticker data={data} />;
    case "frost":
      return <FrostSticker data={data} />;
    default:
      return <BlazeSticker data={data} />;
  }
}
