import { BottomSheet } from "@/components/ui";
import {
    BorderRadius,
    Colors,
    FontFamilies,
    FontSizes,
    Spacing,
} from "@/constants";
import type { CreateWorkoutData, WODData } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

interface WorkoutVoiceReviewProps {
  visible: boolean;
  onClose: () => void;
  transcript: string;
  data: CreateWorkoutData;
  onConfirm: () => void;
  onRetryVoice: () => void;
}

function WODPreviewCard({ wod, index }: { wod: WODData; index: number }) {
  return (
    <View style={styles.wodCard}>
      <View style={styles.wodCardHeader}>
        <View style={styles.wodBadge}>
          <Text style={styles.wodBadgeText}>WOD {index + 1}</Text>
        </View>
        <Text style={styles.wodName} numberOfLines={1}>
          {wod.name || "Untitled WOD"}
        </Text>
      </View>
      {(wod.exercises ?? []).map((ex, i) => (
        <View key={i} style={styles.exerciseRow}>
          <View style={styles.exerciseDot} />
          <View style={styles.exerciseInfo}>
            <Text style={styles.exerciseName}>{ex.name}</Text>
            {!!ex.instructions && (
              <Text style={styles.exerciseInstructions} numberOfLines={2}>
                {ex.instructions}
              </Text>
            )}
            <View style={styles.trackingBadge}>
              <Text style={styles.trackingBadgeText}>
                {ex.trackingType.replace("_", " ")}
              </Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

export function WorkoutVoiceReview({
  visible,
  onClose,
  transcript,
  data,
  onConfirm,
  onRetryVoice,
}: WorkoutVoiceReviewProps) {
  const scheduledDate = data.scheduledFor
    ? new Date(data.scheduledFor).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Review Workout"
      maxHeight="88%"
    >
      {/* Transcript */}
      <View style={styles.transcriptCard}>
        <View style={styles.transcriptHeader}>
          <Ionicons
            name="volume-medium-outline"
            size={15}
            color={Colors.text.secondary}
          />
          <Text style={styles.transcriptLabel}>What WODGoat AI heard</Text>
        </View>
        <Text style={styles.transcriptText}>"{transcript}"</Text>
      </View>

      {/* Scheduled date */}
      {scheduledDate && (
        <View style={styles.metaRow}>
          <Ionicons
            name="calendar-outline"
            size={16}
            color={Colors.primary[500]}
          />
          <Text style={styles.metaText}>Scheduled for {scheduledDate}</Text>
        </View>
      )}

      {/* Notes */}
      {!!data.notes && (
        <View style={styles.metaRow}>
          <Ionicons
            name="document-text-outline"
            size={16}
            color={Colors.text.secondary}
          />
          <Text style={styles.metaText}>{data.notes}</Text>
        </View>
      )}

      {/* WOD previews */}
      <View style={styles.wodsContainer}>
        {(data.wods ?? []).map((wod, i) => (
          <WODPreviewCard key={i} wod={wod} index={i} />
        ))}
      </View>

      {/* Disclaimer */}
      <Text style={styles.disclaimer}>
        Review the workout below before saving. You can edit anything after
        confirming.
      </Text>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.confirmBtn}
          onPress={onConfirm}
          activeOpacity={0.85}
        >
          <Ionicons name="checkmark" size={18} color="#fff" />
          <Text style={styles.confirmText}>Looks good, fill form</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.retryBtn}
          onPress={onRetryVoice}
          activeOpacity={0.8}
        >
          <Ionicons name="mic-outline" size={16} color={Colors.primary[500]} />
          <Text style={styles.retryText}>Try again</Text>
        </TouchableOpacity>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  transcriptCard: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
    marginBottom: Spacing.base,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary[500],
  },
  transcriptHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  transcriptLabel: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.labelXS,
    color: Colors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  transcriptText: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodySM,
    color: Colors.text.secondary,
    fontStyle: "italic",
    lineHeight: FontSizes.bodySM * 1.5,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  metaText: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.bodySM,
    color: Colors.text.secondary,
  },
  wodsContainer: {
    gap: Spacing.sm,
    marginBottom: Spacing.base,
  },
  wodCard: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
  },
  wodCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  wodBadge: {
    backgroundColor: Colors.primary[500] + "22",
    borderRadius: BorderRadius.xs + 2,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  wodBadgeText: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.labelXS,
    color: Colors.primary[500],
  },
  wodName: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodySM,
    color: Colors.text.primary,
    flex: 1,
  },
  exerciseRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
    paddingLeft: Spacing.xs,
  },
  exerciseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary[400],
    marginTop: 6,
    flexShrink: 0,
  },
  exerciseInfo: {
    flex: 1,
    gap: 3,
  },
  exerciseName: {
    fontFamily: FontFamilies.poppinsMedium,
    fontSize: FontSizes.bodySM,
    color: Colors.text.primary,
  },
  exerciseInstructions: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.labelXS,
    color: Colors.text.secondary,
    lineHeight: FontSizes.labelXS * 1.5,
  },
  trackingBadge: {
    alignSelf: "flex-start",
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.xs,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  trackingBadgeText: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.labelXS,
    color: Colors.text.secondary,
    textTransform: "capitalize",
  },
  disclaimer: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: FontSizes.labelXS,
    color: Colors.text.secondary,
    opacity: 0.7,
    textAlign: "center",
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.base,
    lineHeight: FontSizes.labelXS * 1.6,
  },
  actions: {
    gap: Spacing.sm,
  },
  confirmBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.primary[500],
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.base,
  },
  confirmText: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodyMD,
    color: "#fff",
  },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.primary[500] + "60",
  },
  retryText: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: FontSizes.bodyMD,
    color: Colors.primary[500],
  },
});
