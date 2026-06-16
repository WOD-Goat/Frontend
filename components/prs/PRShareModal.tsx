import { Colors, FontFamilies, FontSizes } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ViewShot from "react-native-view-shot";
import PRStickerOverlay, {
  PRStickerData,
  StickerVariant,
  VARIANT_ACCENTS,
} from "./PRStickerOverlay";

// ─── Carousel layout constants ─────────────────────────────────────────────

const STICKER_W = 300;
const STICKER_H = 340;
const { width: SCREEN_W } = Dimensions.get("window");

// Scale so the card fills the screen with 32px margins on each side
const PREVIEW_SCALE = Math.min((SCREEN_W - 64) / STICKER_W, 0.75);
const PREVIEW_W = Math.round(STICKER_W * PREVIEW_SCALE);
const PREVIEW_H = Math.round(STICKER_H * PREVIEW_SCALE);
// Translate to anchor scale to the top-left corner
const SCALE_TX = -((STICKER_W * (1 - PREVIEW_SCALE)) / 2);
const SCALE_TY = -((STICKER_H * (1 - PREVIEW_SCALE)) / 2);

const CARD_GAP = 20;
const SNAP_INTERVAL = PREVIEW_W + CARD_GAP;
// Left / right padding so the first and last cards are centred
const SIDE_OFFSET = (SCREEN_W - PREVIEW_W) / 2;
// The sticker root has borderRadius 20 — scale it to match the preview
const PREVIEW_BORDER_RADIUS = Math.round(20 * PREVIEW_SCALE);

// ─── Variant metadata ──────────────────────────────────────────────────────

type VariantMeta = { id: StickerVariant; label: string; description: string };

const VARIANTS: VariantMeta[] = [
  { id: "frost", label: "Frost", description: "Clean & Minimal" },
  { id: "gold", label: "Gold Rush", description: "Bold & Centered" },
  { id: "blaze", label: "Blaze", description: "Bold & Energetic" },
];
// ─── Component ─────────────────────────────────────────────────────────────

interface PRShareModalProps {
  visible: boolean;
  onClose: () => void;
  data: PRStickerData;
}

export default function PRShareModal({
  visible,
  onClose,
  data,
}: PRShareModalProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [capturing, setCapturing] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  /** Off-screen ViewShot — always renders the currently selected variant */
  const viewShotRef = useRef<ViewShot>(null);

  const activeVariant = VARIANTS[selectedIndex];
  const activeAccent = VARIANT_ACCENTS[activeVariant.id];

  // ── Scroll tracking ────────────────────────────────────────────────────

  const handleMomentumScrollEnd = (
    e: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const raw = e.nativeEvent.contentOffset.x;
    const idx = Math.max(
      0,
      Math.min(Math.round(raw / SNAP_INTERVAL), VARIANTS.length - 1),
    );
    setSelectedIndex(idx);
  };

  const scrollToIndex = (i: number) => {
    scrollRef.current?.scrollTo({ x: i * SNAP_INTERVAL, animated: true });
    setSelectedIndex(i);
  };

  // ── Capture ────────────────────────────────────────────────────────────

  const captureSticker = async (): Promise<string> => {
    if (!viewShotRef.current?.capture) {
      throw new Error("ViewShot ref not ready");
    }
    return viewShotRef.current.capture();
  };

  const handleDownload = async () => {
    try {
      setCapturing(true);
      const uri = await captureSticker();
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please allow access to your photo library to save the sticker.",
        );
        return;
      }
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert("Saved!", "Your PR sticker has been saved to your gallery.");
    } catch (err: any) {
      Alert.alert("Error", err?.message ?? "Failed to save sticker.");
    } finally {
      setCapturing(false);
    }
  };

  const handleShare = async () => {
    try {
      setCapturing(true);
      const uri = await captureSticker();
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert(
          "Sharing Unavailable",
          "Sharing is not available on this device.",
        );
        return;
      }
      await Sharing.shareAsync(uri, {
        mimeType: "image/png",
        dialogTitle: `My ${data.exerciseName} PR – ${data.value} ${data.unit}`,
        UTI: "public.png",
      });
    } catch (err: any) {
      if (!err?.message?.includes("cancel")) {
        Alert.alert("Error", err?.message ?? "Failed to share sticker.");
      }
    } finally {
      setCapturing(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        {/*
         * Off-screen ViewShot: invisible but fully rendered.
         * Always renders the selected variant at full 360×480 for capture.
         */}
        <View style={styles.offScreen} pointerEvents="none">
          <ViewShot
            ref={viewShotRef}
            options={{ format: "png", quality: 1 }}
            style={{ width: STICKER_W, height: STICKER_H }}
          >
            <PRStickerOverlay variant={activeVariant.id} data={data} />
          </ViewShot>
        </View>

        <View style={styles.sheet}>
          {/* ── Handle ── */}
          <View style={styles.handleRow}>
            <View style={styles.handle} />
          </View>

          {/* ── Header ── */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerTitle}>Share Your PR</Text>
              <Text style={styles.headerSubtitle}>
                Pick a design and show the world 🏆
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={styles.closeBtn}
            >
              <Ionicons name="close" size={22} color={Colors.text.primary} />
            </TouchableOpacity>
          </View>

          {/* ── Swipe hint ── */}
          <Text style={styles.swipeHint}>← Swipe to explore designs →</Text>

          {/* ── Carousel ── */}
          <ScrollView
            ref={scrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={SNAP_INTERVAL}
            decelerationRate="fast"
            contentContainerStyle={[
              styles.carouselContent,
              { paddingHorizontal: SIDE_OFFSET },
            ]}
            onMomentumScrollEnd={handleMomentumScrollEnd}
            style={styles.carousel}
          >
            {VARIANTS.map((v, i) => {
              const accent = VARIANT_ACCENTS[v.id];
              const isSelected = i === selectedIndex;
              return (
                <View
                  key={v.id}
                  style={[
                    styles.cardWrapper,
                    { marginRight: i < VARIANTS.length - 1 ? CARD_GAP : 0 },
                  ]}
                >
                  {/* Shadow host (overflow visible) */}
                  <View
                    style={[
                      styles.cardShadow,
                      {
                        shadowColor: accent,
                        shadowOpacity: isSelected ? 0.45 : 0.15,
                        elevation: isSelected ? 14 : 4,
                      },
                    ]}
                  >
                    {/* Clip container — matches the scaled visual area exactly */}
                    <View
                      style={[
                        styles.cardClip,
                        {
                          borderColor: isSelected ? accent : "transparent",
                        },
                      ]}
                    >
                      <View style={styles.cardScaled}>
                        <PRStickerOverlay variant={v.id} data={data} />
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* ── Dot indicators ── */}
          <View style={styles.dotsRow}>
            {VARIANTS.map((v, i) => (
              <TouchableOpacity
                key={v.id}
                onPress={() => scrollToIndex(i)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <View
                  style={[
                    styles.dot,
                    i === selectedIndex
                      ? [styles.dotActive, { backgroundColor: activeAccent }]
                      : styles.dotInactive,
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Action buttons ── */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnDownload]}
              onPress={handleDownload}
              disabled={capturing}
              activeOpacity={0.75}
            >
              {capturing ? (
                <ActivityIndicator size="small" color={Colors.text.primary} />
              ) : (
                <Ionicons
                  name="download-outline"
                  size={20}
                  color={Colors.text.primary}
                />
              )}
              <Text style={styles.actionBtnText}>Save to Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnShare]}
              onPress={handleShare}
              disabled={capturing}
              activeOpacity={0.75}
            >
              {capturing ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="share-social-outline" size={20} color="#fff" />
              )}
              <Text style={[styles.actionBtnText, styles.shareText]}>
                Share Now
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "flex-end",
  },

  /** Hidden but rendered — used for full-res capture */
  offScreen: {
    position: "absolute",
    opacity: 0,
    top: 100,
    left: 0,
  },

  sheet: {
    backgroundColor: Colors.background.secondary,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: 36,
  },

  /* Handle */
  handleRow: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 8,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.neutral[600],
  },

  /* Header */
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 24,
    paddingBottom: 4,
    marginBottom: 4,
  },
  headerTitle: {
    fontFamily: FontFamilies.poppinsBold,
    fontSize: FontSizes.headingXL,
    color: Colors.text.primary,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontFamily: FontFamilies.spartanRegular,
    fontSize: FontSizes.bodySM,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },

  swipeHint: {
    fontFamily: FontFamilies.spartanRegular,
    fontSize: FontSizes.bodyXS,
    color: Colors.text.secondary,
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: 0.3,
    opacity: 0.7,
  },

  /* Carousel */
  carousel: {
    flexShrink: 0,
  },
  carouselContent: {
    alignItems: "center",
    paddingVertical: 12,
  },
  cardWrapper: {
    width: PREVIEW_W,
    height: PREVIEW_H,
    position: "relative",
  },
  cardShadow: {
    borderRadius: PREVIEW_BORDER_RADIUS,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
  },
  /** Clips the scaled sticker to its visual bounds */
  cardClip: {
    width: PREVIEW_W,
    height: PREVIEW_H,
    overflow: "hidden",
    borderRadius: PREVIEW_BORDER_RADIUS,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  /** Scales sticker from its top-left corner to fit the preview area */
  cardScaled: {
    width: STICKER_W,
    height: STICKER_H,
    transform: [
      { translateX: SCALE_TX },
      { translateY: SCALE_TY },
      { scale: PREVIEW_SCALE },
    ],
  },

  /* Variant label */
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 12,
    marginBottom: 10,
  },
  variantName: {
    fontFamily: FontFamilies.poppinsBold,
    fontSize: FontSizes.headingMD,
    letterSpacing: 1,
  },
  variantDesc: {
    fontFamily: FontFamilies.spartanRegular,
    fontSize: FontSizes.bodySM,
    color: Colors.text.secondary,
  },

  /* Dots */
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 12,
    marginBottom: 20,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 22,
  },
  dotInactive: {
    width: 8,
    backgroundColor: Colors.neutral[600],
  },

  /* Action buttons */
  actions: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 24,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  actionBtnDownload: {
    backgroundColor: Colors.secondary[600],
    borderWidth: 1,
    borderColor: Colors.neutral[700],
  },
  actionBtnShare: {
    backgroundColor: Colors.primary[500],
  },
  actionBtnText: {
    fontFamily: FontFamilies.spartanBold,
    fontSize: FontSizes.labelMD,
    color: Colors.text.primary,
    letterSpacing: 0.3,
  },
  shareText: {
    color: "#ffffff",
  },
});
