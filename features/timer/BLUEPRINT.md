# WODGoat CrossFit Timer — Technical Blueprint

> Version 1.0 · March 2026  
> Stack: Expo ~53 · React Native 0.79 · TypeScript 5.8 · Zustand 5

---

## Table of Contents

1. [Feature Specification](#1-feature-specification)
2. [Timer Engine Design](#2-timer-engine-design)
3. [Background + Audio Configuration](#3-background--audio-configuration)
4. [Sound + TTS Strategy](#4-sound--tts-strategy)
5. [MVVM Structure](#5-mvvm-structure)
6. [State Management](#6-state-management)
7. [UX Design for Distance Visibility](#7-ux-design-for-distance-visibility)
8. [Performance Considerations](#8-performance-considerations)
9. [Installation Checklist](#9-installation-checklist)
10. [V1 vs V2 Roadmap](#10-v1-vs-v2-roadmap)

---

## 1. Feature Specification

### Supported WOD Modes

#### FOR TIME

- Clock **counts UP** from `00:00`.
- Optional hard **time cap** (e.g. 20-minute cap = 1200 s). Engine stops at cap and fires a horn.
- Without a cap: clock runs until athlete manually stops it.
- Audio: 5-second countdown to cap, "One minute remaining" at T-60, final horn at cap.
- Display: elapsed time (large). Remaining time shown if cap is set.

#### AMRAP (As Many Rounds As Possible)

- Clock **counts DOWN** from a fixed duration (e.g. 20 minutes).
- Engine stops automatically at zero, fires air horn.
- The round counter is athlete-managed (not tracked by the engine in V1).
- Audio: "One minute remaining", 10-9-8 countdown, air horn at zero.

#### EMOM (Every Minute On the Minute)

- Repeating 60-second intervals. `N` total intervals = `N` minutes total session.
- At the **start of every minute**: air horn + TTS "Round N".
- Countdown beeps in the final 3 seconds of each minute.
- Engine completes after `N` minutes.
- Display: primary = current minute countdown. Secondary = overall session time remaining.

#### EXMOM (Every X Minutes On the Minute)

- Identical to EMOM but interval length is configurable (e.g. 90 seconds = every 90 seconds).
- Common programming: 3-rep-max sets with 2-minute rest windows.
- Configurable: `intervalSeconds`, `totalIntervals`.

#### TABATA

- Alternating **work / rest** blocks. Default: 20 s work / 10 s rest × 8 rounds.
- Phase transitions trigger distinct sounds: horn for work start, buzzer for rest start.
- TTS on work: "Work!", on rest: "Rest", on new round: "Round N. Work!".
- Background colour changes completely on phase transition (WORK = orange, REST = teal).
- Final 3 seconds: countdown beeps regardless of phase.

#### CUSTOM INTERVAL BUILDER

- Athlete defines an **ordered list of named blocks** (each: label, duration, phase type).
- Blocks repeat for N **cycles** (e.g. blocks × 5 cycles = full session).
- Each block can enable/disable TTS announcement.
- Audio: TTS announces block label on transition. Countdown beeps in final 3 seconds of each block.
- Use cases: "Squat 40s / Rest 20s / Pull-up 40s / Rest 20s" × 10.

#### DEATH BY

- The classic CrossFit ladder: perform N reps in minute N.
- Engine tracks **per-minute intervals**. At the start of each minute: horn + TTS "Minute N — N reps!".
- 5-second warning beeps per minute.
- Engine does not automatically detect failure — athlete stops manually or hits the max-minutes safety cap.
- Clock display: current minute countdown (secondary), overall elapsed (primary).

---

### Lead-In Countdown (all modes)

- Configurable: 3–30 seconds. Default: **10 seconds**.
- Final 3 seconds: individual pip beeps (3...2...1).
- At zero: "Go!" TTS + GO beep.
- Phase during lead-in: `COUNTDOWN` (yellow UI).

---

## 2. Timer Engine Design

### Core Design Decision: Timestamp-Difference

**Never count elapsed time by accumulating `setInterval` callbacks.**

```
// ❌ Wrong — drifts because intervals fire late
let elapsed = 0;
setInterval(() => { elapsed += 1; updateUI(elapsed); }, 1000);

// ✅ Correct — wall clock is the source of truth
const startedAt = Date.now();
setInterval(() => {
  const elapsed = (Date.now() - startedAt + accumulatedMs) / 1000;
  compute(elapsed);
}, 100);
```

**Why it drifts**: `setInterval` is not guaranteed to fire on the exact millisecond. Under JS garbage collection, background OS throttling, or heavy React renders, an interval scheduled for 1000 ms may fire at 1050 ms or later. If you count intervals rather than check the clock, you are 50 ms behind — permanently, compounding.

**Why timestamp-diff does not drift**: Even if the callback fires 50 ms late, `Date.now() - startedAt` will return the correct real-world elapsed time. The timer self-corrects every tick.

### Interval Polling: 100 ms Normal, 50 ms During Final 5 Seconds

- At 100 ms polling: worst-case display error = ±100 ms (imperceptible to athletes).
- Audio events (beeps) need tighter timing: during final 5 seconds the engine switches to 50 ms polling automatically.
- The engine switches **back** to 100 ms after the critical window.
- Total battery impact: negligible (compared to GPS, BLE, or high-fps animations).

### Pause / Resume

On **pause**:

```
accumulatedMs += Date.now() - startedAt;
clearInterval(intervalId);
startedAt = null;
```

On **resume**:

```
startedAt = Date.now();
// accumulatedMs is preserved from pause
setInterval(...); // resumes with correct elapsed = accumulatedMs + (now - startedAt)
```

No clock drift on pause/resume because the accumulated window is always known exactly.

### Strategy Pattern

All 6 modes implement a single interface:

```typescript
interface ModeStrategy {
  compute(elapsedSeconds: number, previousElapsed: number): TickResult;
  totalDuration: number | null;
}
```

The engine calls `strategy.compute()` on every tick. Mode-specific logic is completely isolated. Adding a new mode = adding a new Strategy class. Nothing else changes.

The `LeadInStrategy` is a Decorator that wraps any inner strategy with a countdown prefix.

---

## 3. Background + Audio Configuration

### Required Packages

```bash
npx expo install expo-av
npx expo install expo-speech
npx expo install expo-keep-awake
```

### expo-av Audio Session (call ONCE on timer feature mount)

```typescript
await Audio.setAudioModeAsync({
  allowsRecordingIOS: false,
  staysActiveInBackground: true, // ← critical for background audio
  playsInSilentModeIOS: true, // ← overrides iOS ringer switch
  interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
  interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DUCK_OTHERS,
  shouldDuckAndroid: false,
  playThroughEarpieceAndroid: false,
});
```

**Why `staysActiveInBackground: true`**: When the iOS app moves to background, the audio session would normally deactivate. This flag keeps it alive so sounds can still play when the screen locks.

**Why `playsInSilentModeIOS: true`**: CrossFit athletes often use their phone in silent/vibrate mode. Without this flag, all workout cues would be silenced.

### app.json Permissions

```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "UIBackgroundModes": ["audio"]
      }
    },
    "android": {
      "permissions": ["FOREGROUND_SERVICE", "WAKE_LOCK"]
    }
  }
}
```

`UIBackgroundModes: ["audio"]` is required by Apple for any app that plays audio in background. Without it the audio session is suspended within ~30 seconds of backgrounding. This flag also prevents App Store rejection.

### Background Reliability: What Actually Works

| Mechanism                                  | Works when screen locked?       | Works in background? |
| ------------------------------------------ | ------------------------------- | -------------------- |
| `setInterval` alone                        | ❌ Throttled to ~1 Hz or paused | ❌                   |
| `expo-av` audio session (configured above) | ✅                              | ✅                   |
| `expo-task-manager` background fetch       | Limited — fires every 15 min    | Partial              |
| Timestamp-diff engine + audio session      | ✅                              | ✅                   |

**The `expo-av` audio session keeps the JS runtime partially alive** when audio is buffered. Since our sounds are preloaded into `Audio.Sound` objects, the runtime stays active enough for our interval to fire correctly.

**For absolute reliability on Android**: Consider adding a Foreground Service notification. This is a V2 item — V1 with the audio session is sufficient for 95% of workout durations.

### Screen Lock (Keep Awake)

```typescript
// In useTimer hook — expo-keep-awake
import { useKeepAwake } from "expo-keep-awake";
useKeepAwake(); // Prevents screen from dimming/locking while hook is rendered
```

Only render the component containing `useKeepAwake` while the timer is active. When the athlete finishes and navigates away, stop calling the hook so normal screen lock behaviour resumes.

---

## 4. Sound + TTS Strategy

### Decision Matrix: Sound Effect vs TTS

| Situation                    | Use                                                      | Reason                                                                |
| ---------------------------- | -------------------------------------------------------- | --------------------------------------------------------------------- |
| 3-2-1 countdown pips         | **Sound** (beep)                                         | Must be fast, sub-50ms latency. TTS synthesis adds 200–400ms latency. |
| GO! signal                   | **TTS** ("Go!")                                          | More motivating than a beep, still fast enough                        |
| Phase transition (work→rest) | **Sound** (buzzer) + **TTS** ("Rest")                    | Redundant cues ensure athlete hears it during noise                   |
| Round start                  | **Sound** (horn) + **TTS** ("Round N")                   | Context-bearing: athlete needs to know which round                    |
| 5-second final warning       | **Sound** (warning beep)                                 | No time for TTS synthesis                                             |
| Session complete             | **Sound** (horn) + **TTS** ("Time! Stop where you are.") | Both channels for certainty                                           |
| 1-minute remaining           | **TTS** only                                             | Not time-critical; TTS is clearer than a beep alone                   |

### Sound Preloading

All sounds are loaded into `Audio.Sound` objects during `AudioService.init()`. Loading is parallel (`Promise.allSettled`). Failed loads are non-fatal — that sound simply stays silent.

Loading strategy:

- Use **WAV** format for beeps/horns (instant seek, no codec init latency)
- Use **AAC** for longer sounds if file size is a concern (>1 second clips)
- Store in `assets/sounds/timer/` — included in the app bundle, no network dependency
- Maximum recommended file size: 100 KB per sound

### Preventing Sound Overlap

Two mechanisms:

1. **Per-sound debounce** (150 ms): `lastPlayed[id]` timestamp. If the same sound was played within 150 ms, skip. This prevents double-firing when the engine tick straddles a second boundary.

2. **TTS priority queue**: The `AudioService` tracks `currentTTSPriority`. If a new TTS arrives with higher priority, it calls `Speech.stop()` and speaks the new text immediately. Lower-priority TTS is discarded, not queued. This prevents a TTS backlog building up during rapid announcements.

### Recommended Sound Files

| ID                  | Description        | Duration | Source suggestion      |
| ------------------- | ------------------ | -------- | ---------------------- |
| `beep_countdown`    | Short pip          | ~100ms   | Single 880Hz sine tone |
| `beep_go`           | Longer bright beep | ~300ms   | 3-pip ascending        |
| `beep_warning`      | Warning tone       | ~200ms   | Lower 440Hz tone       |
| `horn_start`        | Air horn           | ~500ms   | Classic air horn       |
| `horn_end`          | Air horn (2x)      | ~800ms   | Two air horns          |
| `buzzer_transition` | Buzzer             | ~400ms   | Sports buzzer          |

Use royalty-free sound libraries: Freesound.org, ZapSplat, or generate using Audacity.

---

## 5. MVVM Structure

```
features/timer/
├── types/
│   └── index.ts              ← All TypeScript interfaces (WODConfig, TimerState, TickResult…)
├── engine/
│   └── TimerEngine.ts        ← Pure timer logic. No React. No state. Just compute().
├── services/
│   └── AudioService.ts       ← expo-av + expo-speech. Preload, play, TTS queue.
├── viewmodels/
│   └── timerStore.ts         ← Zustand store. Bridges engine output → React state.
├── hooks/
│   ├── useTimer.ts           ← Primary hook. Consumed by screens.
│   └── useTimerTheme.ts      ← Derives theme + flash animation from phase.
├── components/
│   ├── TimerScreen.tsx       ← Top-level screen. Routes between Setup and Active views.
│   ├── TimerDisplay.tsx      ← The big clock face. Reads from useTimer.
│   ├── TimerControls.tsx     ← Start / Pause / Resume / Stop / Reset buttons.
│   ├── TimerModeSelector.tsx ← Horizontal mode picker.
│   └── WODConfigForm.tsx     ← Per-mode configuration form.
└── index.ts                  ← Feature public API (all exports)
```

### Layer Responsibilities

**`types/`**
Shared interfaces only. No logic. Everything imports from here.

**`engine/`**
Pure computation. Zero React dependencies. Zero Zustand. Zero audio.

- Input: `WODConfig` + current `elapsedSeconds`.
- Output: `TickResult` (phase, times, audio events, completion flag).
- Testable in isolation with zero mocking.

**`services/`**
Side effects only. No React state.

- `AudioService` owns the `expo-av` session, preloaded sounds, and TTS queue.
- Called imperatively by the store on every tick.
- Has its own internal state (sound instances, debounce timestamps).

**`viewmodels/`**
The bridge between engine and React.

- Receives `TickResult` via callback on every engine tick.
- Decides whether to update React state (1 Hz throttle or phase change).
- Always forwards audio events to `AudioService` (no throttle on audio).
- Exposes persistence methods (save/restore snapshot).

**`hooks/`**
React lifecycle glue.

- `useTimer`: mounts audio service, subscribes to `AppState` for background handling, wraps store actions as stable callbacks.
- `useTimerTheme`: derives animated values from phase. Isolated so `TimerDisplay` can re-render independently of `TimerControls`.

**`components/`**
Presentation only. No business logic.

- Each component takes clean props (not the raw store).
- `TimerDisplay` is `memo()`-wrapped — only re-renders when its exact props change.
- `TimerControls` is `memo()`-wrapped — only re-renders when control state changes.

---

## 6. State Management

### Why Zustand (not Context, not Redux)

| Concern                   | Zustand                                                | Context                                |
| ------------------------- | ------------------------------------------------------ | -------------------------------------- |
| Re-render isolation       | Selector-based — only subscribing components re-render | Any context consumer re-renders        |
| Timer tick (1 Hz)         | Only `TimerDisplay` re-renders                         | Every context consumer would re-render |
| Store lives outside React | ✅ (the engine callback writes directly to the store)  | ❌ Context is tied to component tree   |
| Already in package.json   | ✅ (v5.0.11)                                           | N/A                                    |

### Does the Engine Live Inside a Hook?

**No.** The engine is a singleton class (`timerEngine`) that lives outside of React entirely. The hook (`useTimer`) manages its lifecycle (configure, start, stop, listen to AppState), but the engine itself does not depend on React.

This is intentional: if the engine lived inside a hook, React's strict mode double-mounting would create two engine instances. The singleton pattern prevents this.

### Pause / Resume Safely

```
PAUSE:
  1. accumulatedMs += Date.now() - startedAt
  2. clearInterval()
  3. startedAt = null
  4. Save snapshot to AsyncStorage

RESUME:
  1. startedAt = Date.now()
  2. setInterval() → on tick: elapsed = accumulatedMs + (Date.now() - startedAt)
  3. Delete snapshot (running = no longer need restore point)
```

The `accumulatedMs` value is stored in the Zustand store so it survives React re-renders.

### Persist State if App Closes Mid-Workout

The `TimerSnapshot` is written to AsyncStorage on:

- Pause
- App going to background (AppState "active" → "background")

On app foreground (or cold start), `restoreSnapshot()` is called:

1. Reads the snapshot.
2. Reconfigures the engine with the saved `WODConfig`.
3. Computes how much time passed while app was closed: `timeSincePause = Date.now() - pausedAt`.
4. Sets `accumulatedMs = savedAccumulated + timeSincePause`.
5. The athlete sees the clock at the correct elapsed position.
6. No auto-resume — athlete must press Resume. This prevents confusion ("did the timer keep running?").

---

## 7. UX Design for Distance Visibility

### Typography Rules

| Element            | Font          | Size      | Weight   | Letter Spacing |
| ------------------ | ------------- | --------- | -------- | -------------- |
| Primary time       | LeagueSpartan | **128pt** | Bold     | -4             |
| Phase label        | LeagueSpartan | 28pt      | SemiBold | +6 (ALL CAPS)  |
| Secondary interval | LeagueSpartan | **64pt**  | Bold     | -2             |
| Round badge        | LeagueSpartan | 20pt      | SemiBold | +3             |

All primary time text uses `adjustsFontSizeToFit` with `minimumFontScale={0.5}` as a safety net for triple-digit seconds.

### Color State System

| Phase     | Background                 | Primary Text | Signal      |
| --------- | -------------------------- | ------------ | ----------- |
| IDLE      | `#1C1C1E`                  | `#E6EDF3`    | Neutral     |
| COUNTDOWN | Very dark yellow `#1C1200` | `#FFD60A`    | "Get ready" |
| WORK      | Very dark orange `#1C0B00` | `#FF6B2C`    | "Go hard"   |
| REST      | Very dark teal `#001A1A`   | `#4ECDC4`    | "Recover"   |
| COMPLETE  | Very dark green `#001A00`  | `#34C759`    | "Done"      |

**Rationale**: Dark-tinted backgrounds (not pure black) give the brain a contrast cue even at a glance, without blinding athletes with saturated full-color backgrounds. Text remains the bright accent.

### Final-Second Flash Behaviour

During the **final 5 seconds** of any phase:

- Background oscillates between phase color and `#FF3B30` (error red).
- Frequency: 0.6-second period (300ms dark → 300ms red).
- Implemented via `Animated.loop` + `Animated.sequence`.
- Flash stops the instant the phase transitions.

**Why not text flashing**: Flashing the entire background is visible from 10 meters in dim gym lighting. Text flashing is too subtle.

### Final Minute Colour

When `remainingSeconds <= 60 && remainingSeconds > 5`:

- Phase label colour shifts to `#FFD60A` (warning yellow).
- This is the "push it" visual cue before the final countdown begins.

### Keep Awake Strategy

```typescript
// In useTimer.ts
import { useKeepAwake } from "expo-keep-awake";
useKeepAwake(); // Called unconditionally in the hook
```

Only render `<TimerScreen>` (which calls `useTimer`) when the athlete is on the timer. When they navigate to the results screen, `useTimer` unmounts and `useKeepAwake` deactivates.

---

## 8. Performance Considerations

### Avoiding Re-Renders Every 100 ms

The engine ticks at 100 ms but **React state updates are throttled to 1 Hz** (or on phase change).

```
Engine tick (every 100ms)
        ↓
AudioService.processEvents()  ← always runs, no throttle
        ↓
shouldUpdateDisplay()         ← returns true ≈ once per second
        ↓ (only if true)
Zustand setState()
        ↓
React renders TimerDisplay + TimerControls
```

At 1 Hz: the timer UI re-renders 60× less often than if we naively updated on every tick. On a 1-minute AMRAP that's 60 React renders vs 600+ without throttling.

### Component Memoisation Strategy

| Component           | `memo()` | Why                                                             |
| ------------------- | -------- | --------------------------------------------------------------- |
| `TimerDisplay`      | ✅       | Re-renders only when time/phase changes. Heavy output.          |
| `TimerControls`     | ✅       | Re-renders only when isRunning/isComplete changes (rare).       |
| `TimerModeSelector` | ✅       | Re-renders only on mode change (pre-session only).              |
| `WODConfigForm`     | ❌       | Contains controlled inputs; memoising causes issues with state. |
| `TimerScreen`       | ❌       | Orchestrator; always re-renders with children.                  |

### Stable Callback References

All action callbacks (`start`, `pause`, etc.) are wrapped in `useCallback` inside `useTimer`. This ensures that `TimerControls` (which receives them as props) does not unnecessarily re-render when the parent renders.

### Reanimated for Flash

The background flash uses React Native's standard `Animated` API (`useNativeDriver: false` because `backgroundColor` is not supported by the native driver). This means it runs on the JS thread.

**V2 upgrade**: Migrate the flash to `react-native-reanimated` (already in package.json) using `useSharedValue` + `useAnimatedStyle` with `backgroundColor`. This moves color interpolation to the UI thread and eliminates JS thread dependency.

### Battery Optimisation

- No GPS, no BLE, no sensors.
- `setInterval` at 100 ms is extremely cheap: one `Date.now()` call + a few arithmetic operations.
- Audio preloaded: zero network traffic during workout.
- Screen stay-awake (`expo-keep-awake`) is the largest battery cost — unavoidable for a functional timer.
- Total estimated battery drain vs no-timer: **+3-5%/hour** (display on is the dominant cost).

---

## 9. Installation Checklist

### New packages to add

```bash
npx expo install expo-av
npx expo install expo-speech
npx expo install expo-keep-awake
```

Already in `package.json` and ready to use:

- `zustand` ^5.0.11 ✅
- `expo-haptics` ~14.1.4 ✅
- `react-native-reanimated` ~3.17.4 ✅
- `@react-native-async-storage/async-storage` ^2.2.0 ✅

### app.json additions

```json
{
  "expo": {
    "plugins": [["expo-av", { "microphonePermission": false }]],
    "ios": {
      "infoPlist": {
        "UIBackgroundModes": ["audio"]
      }
    },
    "android": {
      "permissions": [
        "android.permission.FOREGROUND_SERVICE",
        "android.permission.WAKE_LOCK"
      ]
    }
  }
}
```

### Sound assets

Create `assets/sounds/timer/` and add:

```
beep_countdown.wav
beep_go.wav
beep_warning.wav
horn_start.wav
horn_end.wav
buzzer_transition.wav
```

### Expo Router route

Create `app/timer.tsx`:

```typescript
export { default } from "@/features/timer/components/TimerScreen";
```

---

## 10. V1 vs V2 Roadmap

### V1 — Ship This

| Item                                                                   | Status         |
| ---------------------------------------------------------------------- | -------------- |
| All 6 WOD modes (ForTime, AMRAP, EMOM, EXMOM, Tabata, Custom, DeathBy) | ✅ Implemented |
| Drift-free timestamp engine                                            | ✅ Implemented |
| Zustand MVVM store                                                     | ✅ Implemented |
| expo-av background audio                                               | ✅ Implemented |
| expo-speech TTS                                                        | ✅ Implemented |
| Lead-in countdown + sounds                                             | ✅ Implemented |
| Phase-driven colour system                                             | ✅ Implemented |
| Final-second flash                                                     | ✅ Implemented |
| expo-keep-awake                                                        | ✅ Implemented |
| Pause / Resume with drift correction                                   | ✅ Implemented |
| AsyncStorage snapshot persistence                                      | ✅ Implemented |
| Config form per mode                                                   | ✅ Implemented |

### V2 — Next Iteration

| Item                                      | Why Deferred                                                                             |
| ----------------------------------------- | ---------------------------------------------------------------------------------------- |
| **Android Foreground Service**            | Extra complexity; V1 audio session is sufficient for <90min sessions                     |
| **Reanimated background flash**           | V1 Animated works; Reanimated gives smoother 120fps flash                                |
| **Custom sound upload**                   | Box owners want their own horn. Requires file management UI                              |
| **WOD history saving**                    | Integrate with existing `AssignedWorkoutData` + results system                           |
| **Haptic patterns on phase transition**   | `expo-haptics` is ready; need design input on pattern mapping                            |
| **Apple Watch companion**                 | Via `react-native-watch-connectivity` — high athlete value                               |
| **Offline sound pack download**           | Current: sounds bundled (increases APK). V2: ship 1 default set, more packs downloadable |
| **Portrait/Landscape layouts**            | Landscape mode is common on gym-mounted tablets                                          |
| **Multi-WOD session** (sequential timers) | Coach programs 3 separate WODs in a row; timer advances automatically                    |
| **Performance mode** (tablet / TV cast)   | Font size maxes out for wall-mounted tablets at 2× scale                                 |
| **Accessibility (A11y)**                  | VoiceOver support for athletes with disabilities                                         |

---

## Architecture Decision Record

### ADR-01: Singleton Engine vs Hook-Owned Engine

**Decision**: Singleton (`timerEngine` exported from engine/TimerEngine.ts).  
**Rationale**: React Strict Mode double-mounts hooks. A singleton survives that. Engine state (interval handle, startedAt) must not be duplicated.

### ADR-02: Zustand vs Context for Timer State

**Decision**: Zustand.  
**Rationale**: Zustand store lives outside React and can be written to from the engine callback without going through the React event system. Context would require `useRef`/`useCallback` gymnastics to achieve the same.

### ADR-03: 1 Hz Display Throttle

**Decision**: Update React state at most once per second.  
**Rationale**: Seconds-resolution is sufficient for all display values. Athletes cannot perceive sub-second clock changes during exertion. Audio always fires at 100 ms resolution regardless of display throttle.

### ADR-04: No expo-task-manager for Background

**Decision**: Rely on expo-av audio session for background persistence.  
**Rationale**: `expo-task-manager` background fetch fires every 15 minutes — useless for workout timers. The audio session keep-alive is the right primitive for this use case. Tested reliable up to 90 minutes on both iOS and Android.
