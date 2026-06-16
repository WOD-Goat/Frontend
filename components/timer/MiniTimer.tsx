import { Colors, FontFamilies, responsiveSize } from "@/constants";
import {
  selectPrimaryTime,
  useTimerStore,
} from "@/lib/timer/viewmodels/timerStore";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PHASE_COLORS: Record<string, string> = {
  IDLE: "#8E8E93",
  COUNTDOWN: "#FF6B2C",
  WORK: "#FF6B2C",
  REST: "#EBEBF0",
  COMPLETE: "#34C759",
};

interface MiniTimerProps {
  onExpand: () => void;
  onPlayPause: () => void;
  onStop: () => void;
}

export function MiniTimer({ onExpand, onPlayPause, onStop }: MiniTimerProps) {
  const primaryTime = useTimerStore(selectPrimaryTime);
  const phase = useTimerStore((s) => s.display.phase);
  const isRunning = useTimerStore((s) => s.isRunning);
  const isComplete = useTimerStore((s) => s.isComplete);
  const currentRound = useTimerStore((s) => s.display.currentRound);
  const totalRounds = useTimerStore((s) => s.display.totalRounds);
  const insets = useSafeAreaInsets();

  const showRound = currentRound > 0 && !isComplete;
  const roundLabel = totalRounds != null
    ? `Round ${currentRound}/${totalRounds}`
    : `Round ${currentRound}`;

  const phaseColor = PHASE_COLORS[phase] ?? "#FF6B2C";

  return (
    <TouchableOpacity
      style={[styles.pill, { bottom: insets.bottom + 90 }]}
      onPress={onExpand}
      activeOpacity={0.9}
    >
      <View style={styles.centerContent}>
        <Text style={styles.time}>{primaryTime}</Text>
        {showRound && (
          <Text style={styles.roundText}>{roundLabel}</Text>
        )}
      </View>

      {isComplete ? (
        <TouchableOpacity
          style={styles.doneBtn}
          onPress={(e) => { e.stopPropagation(); onStop(); }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.8}
        >
          <Ionicons name="checkmark" size={responsiveSize(18)} color="#000" />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.playPauseBtn, { backgroundColor: phaseColor }]}
          onPress={(e) => { e.stopPropagation(); onPlayPause(); }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isRunning ? "pause" : "play"}
            size={responsiveSize(14)}
            color="#000"
          />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: {
    position: "absolute",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#1C1C1E",
    borderRadius: 40,
    paddingVertical: 10,
    paddingHorizontal: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 12,
    borderWidth: 1,
    borderColor: "#3A3A3C",
  },
  centerContent: {
    alignItems: "center",
    gap: 2,
  },
  time: {
    fontFamily: FontFamilies.spartanBold,
    fontSize: responsiveSize(20),
    color: "#EBEBF0",
    letterSpacing: -0.5,
  },
  playPauseBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  roundText: {
    fontFamily: FontFamilies.spartanMedium,
    fontSize: responsiveSize(13),
    color: Colors.primary[500],
    letterSpacing: 0.6,
  },
  doneBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PHASE_COLORS.COMPLETE,
  },
});
