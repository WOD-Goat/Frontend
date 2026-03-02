// ─────────────────────────────────────────────────────────────────────────────
// Timer Feature — Public API
// Import everything you need from "@/features/timer"
// ─────────────────────────────────────────────────────────────────────────────

// Types
export type {
    AMRAPConfig,
    AudioEvent,
    CustomBlock,
    CustomConfig,
    DeathByConfig,
    EMOMConfig,
    EXMOMConfig,
    ForTimeConfig,
    SoundCueId,
    TabataConfig,
    TickResult,
    TimerPhase,
    TimerSnapshot,
    TimerState,
    TimerTheme,
    WODConfig,
    WODMode
} from "./types";

// Engine (for testing or advanced use only — prefer the store)
export { TimerEngine, timerEngine } from "./engine/TimerEngine";

// Audio service (for testing or advanced use only — prefer useTimer)
export { audioService } from "./services/AudioService";

// ViewModel / Store
export {
    selectIntervalTime,
    selectPrimaryTime,
    useTimerStore
} from "./viewmodels/timerStore";
export type { TimerStore } from "./viewmodels/timerStore";

// Hooks
export { useTimer } from "./hooks/useTimer";
export type { UseTimerReturn } from "./hooks/useTimer";
export { useTimerTheme } from "./hooks/useTimerTheme";

// Components
export { default as TimerActiveScreen } from "./components/TimerActiveScreen";
export { TimerControls } from "./components/TimerControls";
export { TimerDisplay } from "./components/TimerDisplay";
export { TimerModeSelector } from "./components/TimerModeSelector";
export { default as TimerSetupScreen } from "./components/TimerSetupScreen";
export { WODConfigForm } from "./components/WODConfigForm";

