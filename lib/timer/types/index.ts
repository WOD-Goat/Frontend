// ─────────────────────────────────────────────────────────────────────────────
// TIMER FEATURE — TYPE DEFINITIONS
// Single source of truth for every shape used by the engine, store, and UI.
// ─────────────────────────────────────────────────────────────────────────────

// ─── WOD Modes ───────────────────────────────────────────────────────────────

/**
 * All supported WOD timer modes.
 *
 * FOR_TIME   — Counts UP from 0. Athlete beats a target or just tracks elapsed.
 * AMRAP      — Counts DOWN from a cap. Athlete does as many rounds as possible.
 * EMOM       — Every Minute On the Minute: N work intervals, each 60 s.
 * EXMOM      — Every X Minutes On the Minute: custom interval length (e.g. 90 s).
 * TABATA     — Alternating work/rest rounds (default 20 s / 10 s × 8).
 * CUSTOM     — Builder lets the athlete compose unlimited interval blocks.
 * DEATH_BY   — Adds 1 rep/sec each round. Timer tracks per-minute cues only.
 */
export type WODMode =
  | "FOR_TIME"
  | "AMRAP"
  | "EMOM"
  | "EXMOM"
  | "TABATA"
  | "CUSTOM"
  | "DEATH_BY";

// ─── Timer Phase ─────────────────────────────────────────────────────────────

/**
 * The current logical phase of any running interval.
 * Used by UI to choose background color and sound cues.
 */
export type TimerPhase = "IDLE" | "COUNTDOWN" | "WORK" | "REST" | "COMPLETE";

// ─── Timer State (live) ───────────────────────────────────────────────────────

export interface TimerState {
  /** Whether the clock is actively ticking. */
  isRunning: boolean;
  /** Whether the session has been started at least once (distinguishes IDLE vs PAUSED). */
  hasStarted: boolean;
  /** Current phase for UI coloring / sound logic. */
  phase: TimerPhase;
  /** Elapsed seconds since the session started (ignoring pauses). */
  elapsedSeconds: number;
  /**
   * Seconds remaining in the current interval.
   * Undefined for modes that are purely count-up with no cap (FOR_TIME without cap).
   */
  remainingSeconds: number | undefined;
  /** 0-based index of the current round (AMRAP/EMOM/TABATA/CUSTOM). */
  currentRound: number;
  /** Total number of rounds, if finite. Undefined for open-ended modes. */
  totalRounds: number | undefined;
  /** Seconds remaining in the active interval block (EMOM / TABATA / CUSTOM). */
  intervalRemaining: number | undefined;
  /** Human-readable label for what is happening ("Work", "Rest", "Round 3", …). */
  label: string;
  /** Epoch timestamp (ms) when the current running period started — for drift correction. */
  startedAt: number | null;
  /** Accumulated milliseconds from previous running windows (used during pause/resume). */
  accumulatedMs: number;
}

// ─── Mode Configurations ─────────────────────────────────────────────────────

export interface ForTimeConfig {
  mode: "FOR_TIME";
  /** Optional hard cap in seconds (e.g. 20-min cap = 1200). Null = open. */
  timeCap: number | null;
  /** 3-2-1-Go countdown duration before clock starts. Default 10. */
  leadInSeconds: number;
}

export interface AMRAPConfig {
  mode: "AMRAP";
  /** Total duration in seconds (required). */
  durationSeconds: number;
  leadInSeconds: number;
}

export interface EMOMConfig {
  mode: "EMOM";
  /** How many minutes total (= number of rounds). */
  totalMinutes: number;
  leadInSeconds: number;
}

export interface EXMOMConfig {
  mode: "EXMOM";
  /** Length of each interval in seconds (e.g. 90). */
  intervalSeconds: number;
  /** Number of intervals to complete. */
  totalIntervals: number;
  leadInSeconds: number;
}

export interface TabataConfig {
  mode: "TABATA";
  /** Work period in seconds. Default 20. */
  workSeconds: number;
  /** Rest period in seconds. Default 10. */
  restSeconds: number;
  /** Number of rounds. Default 8. */
  rounds: number;
  leadInSeconds: number;
}

/** A single block inside a custom interval sequence. */
export interface CustomBlock {
  id: string;
  label: string;
  /** Duration of this block in seconds. */
  durationSeconds: number;
  phase: "WORK" | "REST";
  /** If true, the engine announces this block label via TTS. Default true. */
  announce: boolean;
}

export interface CustomConfig {
  mode: "CUSTOM";
  blocks: CustomBlock[];
  /** How many times to repeat the block list. 1 = once through. */
  cycles: number;
  leadInSeconds: number;
}

export interface DeathByConfig {
  mode: "DEATH_BY";
  /** Maximum minutes before the engine stops (safety cap). Default 30. */
  maxMinutes: number;
  leadInSeconds: number;
}

export type WODConfig =
  | ForTimeConfig
  | AMRAPConfig
  | EMOMConfig
  | EXMOMConfig
  | TabataConfig
  | CustomConfig
  | DeathByConfig;

// ─── Engine Tick Result ───────────────────────────────────────────────────────

/**
 * Returned from the engine's `tick()` method on every interval.
 * The store maps this directly to TimerState.
 */
export interface TickResult {
  phase: TimerPhase;
  elapsedSeconds: number;
  remainingSeconds: number | undefined;
  currentRound: number;
  totalRounds: number | undefined;
  intervalRemaining: number | undefined;
  label: string;
  isComplete: boolean;
  /** Sounds/TTS the engine wants fired this tick. */
  audioEvents: AudioEvent[];
}

// ─── Audio ───────────────────────────────────────────────────────────────────

export type SoundCueId =
  | "beep_countdown" // 3-2-1 each pip
  | "beep_go" // Final GO beep
  | "beep_warning" // 5-second warning single beep
  | "horn_start" // Round/interval start air horn
  | "horn_end" // Session complete air horn
  | "buzzer_transition"; // Work→Rest or Rest→Work transition

export interface AudioEvent {
  type: "SOUND" | "TTS";
  /** SoundCueId for SOUND type. */
  soundId?: SoundCueId;
  /** Text to speak for TTS type. */
  text?: string;
  /** Priority: higher = interrupt lower (TTS only). Default 0. */
  priority?: number;
}

// ─── Persistence ─────────────────────────────────────────────────────────────

/** Snapshot stored to AsyncStorage when app backgrounds mid-workout. */
export interface TimerSnapshot {
  config: WODConfig;
  timerState: Omit<TimerState, "isRunning" | "startedAt"> & {
    pausedAt: number; // epoch ms when snapshot was taken
  };
  version: number; // increment when shape changes
}

// ─── UI Theme ────────────────────────────────────────────────────────────────

export interface TimerTheme {
  background: string;
  primaryText: string;
  secondaryText: string;
  /** Flashing color for final 5 seconds. */
  flashColor: string;
}
