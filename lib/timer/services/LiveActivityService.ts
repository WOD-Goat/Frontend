// ─────────────────────────────────────────────────────────────────────────────
// LIVE ACTIVITY SERVICE
//
// Responsibilities:
//  - iOS: control expo-live-activity (Dynamic Island + Lock Screen widget)
//  - Android: control a notifee foreground service notification with a native
//    chronometer countdown — no JS updates needed for the ticking.
//
// Call start() when the timer starts, update() on each display tick (already
// throttled to 1 Hz by the store), pause() on pause, stop() on stop/complete.
//
// Never throws — failures must be silent so the timer keeps running.
// ─────────────────────────────────────────────────────────────────────────────

import notifee, {
  AndroidForegroundServiceType,
  AndroidImportance,
} from "@notifee/react-native";
import * as LiveActivity from "expo-live-activity";
import { Platform } from "react-native";
import type { WODConfig } from "../types";

// ─── Internal display shape (mirrors TimerDisplayState in the store) ──────────

interface DisplaySnapshot {
  phase: string;
  label: string;
  remainingSeconds: number | undefined;
  intervalRemaining: number | undefined;
  isComplete: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const NOTIFICATION_ID = "wodgoat_timer";
const CHANNEL_ID = "timer_live";

const MODE_LABELS: Record<string, string> = {
  FOR_TIME: "For Time",
  AMRAP: "AMRAP",
  EMOM: "EMOM",
  EXMOM: "EXMOM",
  TABATA: "Tabata",
  CUSTOM: "Custom",
  DEATH_BY: "Death By",
};

// ─── SERVICE CLASS ────────────────────────────────────────────────────────────

class LiveActivityService {
  private activityId: string | undefined;
  private channelCreated = false;

  // ─── Android channel (created once) ────────────────────────────────────────

  private async _ensureChannel(): Promise<void> {
    if (this.channelCreated) return;
    await notifee.createChannel({
      id: CHANNEL_ID,
      name: "Timer",
      importance: AndroidImportance.LOW,
      // No sound — the audio service handles all sounds
      sound: "",
    });
    this.channelCreated = true;
  }

  // ─── Public API ─────────────────────────────────────────────────────────────

  /** Call when the timer starts (or resumes). */
  async start(config: WODConfig, display: DisplaySnapshot): Promise<void> {
    try {
      if (Platform.OS === "ios") {
        // Stop any leftover activity before starting a new one
        if (this.activityId) {
          LiveActivity.stopActivity(this.activityId, this._buildLAState(config, display));
          this.activityId = undefined;
        }
        this.activityId =
          LiveActivity.startActivity(
            this._buildLAState(config, display),
            this._buildLAConfig(display),
          ) ?? undefined;
      } else if (Platform.OS === "android") {
        await this._ensureChannel();
        await this._showAndroid(config, display, false);
      }
    } catch (err) {
      console.warn("[LiveActivityService] start failed:", err);
    }
  }

  /**
   * Call on every throttled display update (1 Hz from the store).
   * On iOS this re-stamps the countdown end date so the native timer stays
   * accurate. On Android it updates the chronometer anchor timestamp.
   */
  async update(config: WODConfig, display: DisplaySnapshot): Promise<void> {
    if (display.isComplete) {
      await this.stop(config, display);
      return;
    }
    try {
      if (Platform.OS === "ios" && this.activityId) {
        LiveActivity.updateActivity(
          this.activityId,
          this._buildLAState(config, display),
        );
      } else if (Platform.OS === "android") {
        await this._showAndroid(config, display, false);
      }
    } catch (err) {
      console.warn("[LiveActivityService] update failed:", err);
    }
  }

  /** Call when the timer is paused. Shows a "Paused" state. */
  async pause(config: WODConfig, display: DisplaySnapshot): Promise<void> {
    try {
      const paused: DisplaySnapshot = {
        ...display,
        label: "Paused",
        // Clear countdowns so the native timer stops
        remainingSeconds: undefined,
        intervalRemaining: undefined,
      };
      if (Platform.OS === "ios" && this.activityId) {
        LiveActivity.updateActivity(
          this.activityId,
          this._buildLAState(config, paused),
        );
      } else if (Platform.OS === "android") {
        await this._showAndroid(config, paused, true);
      }
    } catch (err) {
      console.warn("[LiveActivityService] pause failed:", err);
    }
  }

  /** Call when the timer stops or completes. Ends the activity/notification. */
  async stop(config?: WODConfig | null, display?: DisplaySnapshot): Promise<void> {
    try {
      if (Platform.OS === "ios" && this.activityId) {
        LiveActivity.stopActivity(
          this.activityId,
          display && config
            ? this._buildLAState(config, display)
            : { title: "Done!" },
        );
        this.activityId = undefined;
      } else if (Platform.OS === "android") {
        await notifee.cancelNotification(NOTIFICATION_ID);
      }
    } catch (err) {
      console.warn("[LiveActivityService] stop failed:", err);
    }
  }

  // ─── iOS helpers ─────────────────────────────────────────────────────────────

  private _buildLAState(
    config: WODConfig,
    display: DisplaySnapshot,
  ): LiveActivity.LiveActivityState {
    const modeLabel = MODE_LABELS[config.mode] ?? config.mode;

    // Use the most granular countdown available.
    // progressBar.date = epoch ms when the current phase ends.
    // The iOS system renders this as a native live countdown — no JS polling.
    let progressBar: LiveActivity.LiveActivityState["progressBar"];
    if (
      display.intervalRemaining !== undefined &&
      display.intervalRemaining > 0
    ) {
      progressBar = { date: Date.now() + display.intervalRemaining * 1000 };
    } else if (
      display.remainingSeconds !== undefined &&
      display.remainingSeconds > 0
    ) {
      progressBar = { date: Date.now() + display.remainingSeconds * 1000 };
    }
    // For count-up modes (FOR_TIME no cap) there is no end date — omit progressBar.

    return {
      title: modeLabel,
      subtitle: display.label,
      progressBar,
    };
  }

  private _buildLAConfig(
    display: DisplaySnapshot,
  ): LiveActivity.LiveActivityConfig {
    return {
      backgroundColor: display.phase === "REST" ? "#1e3a5f" : "#7c2d12",
      titleColor: "#ffffff",
      subtitleColor: "#ffffffcc",
      progressViewTint: display.phase === "REST" ? "#60a5fa" : "#fb923c",
      progressViewLabelColor: "#ffffff",
      timerType: "digital",
      deepLinkUrl: "/timer",
    };
  }

  // ─── Android helpers ─────────────────────────────────────────────────────────

  private async _showAndroid(
    config: WODConfig,
    display: DisplaySnapshot,
    isPaused: boolean,
  ): Promise<void> {
    const modeLabel = MODE_LABELS[config.mode] ?? config.mode;

    // Anchor the chronometer to the phase end time so it counts down natively.
    // When paused or in count-up mode, no timestamp → chronometer counts up
    // from when the notification was first shown.
    let timestamp: number | undefined;
    let chronometerDirection: "up" | "down" = "up";

    if (!isPaused) {
      if (
        display.intervalRemaining !== undefined &&
        display.intervalRemaining > 0
      ) {
        timestamp = Date.now() + display.intervalRemaining * 1000;
        chronometerDirection = "down";
      } else if (
        display.remainingSeconds !== undefined &&
        display.remainingSeconds > 0
      ) {
        timestamp = Date.now() + display.remainingSeconds * 1000;
        chronometerDirection = "down";
      }
    }

    await notifee.displayNotification({
      id: NOTIFICATION_ID,
      title: `<b>${modeLabel}</b>`,
      body: display.label,
      android: {
        channelId: CHANNEL_ID,
        ongoing: true,
        asForegroundService: true,
        foregroundServiceTypes: [
          AndroidForegroundServiceType.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK,
        ],
        importance: AndroidImportance.LOW,
        showTimestamp: false,
        showChronometer: true,
        ...(timestamp !== undefined && {
          timestamp,
          chronometerDirection,
        }),
        pressAction: {
          id: "default",
          launchActivity: "default",
        },
      },
    });
  }
}

// ─── Singleton ────────────────────────────────────────────────────────────────

export const liveActivityService = new LiveActivityService();
