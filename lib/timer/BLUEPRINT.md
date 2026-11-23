# WODGoat CrossFit Timer — Technical Blueprint

> Version 1.0 · March 2026  
> Stack: Expo ~53 · React Native 0.79 · TypeScript 5.8 · Zustand 5

---

## Table of Contents

1. [Feature Specification](#1-feature-specification)
2. [Timer Engine Design](#2-timer-engine-design)
3. [Background + Audio Configuration](#3-background--audio-configuration)
4. [Sound + Voice Strategy](#4-sound--voice-strategy)
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
- At the **start of every minute**: air horn + voice "Next Round".
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
- Voice on work: "Work!", on rest: "Rest", on new round: "Next Round".
- Background colour changes completely on phase transition (WORK = orange, REST = teal).
- Final 3 seconds: countdown beeps regardless of phase.

#### CUSTOM INTERVAL BUILDER

- Athlete defines an **ordered list of named blocks** (each: label, duration, phase type).
- Blocks repeat for N **cycles** (e.g. blocks × 5 cycles = full session).
- Each block can enable/disable its voice announcement.
- Audio: voice says "Work!" or "Rest" by block type on transition (never the label). Countdown beeps in final 3 seconds of each block.
- Use cases: "Squat 40s / Rest 20s / Pull-up 40s / Rest 20s" × 10.

#### DEATH BY

- The classic CrossFit ladder: perform N reps in minute N.
- Engine tracks **per-minute intervals**. At the start of each minute: horn + voice "Next Minute".
- 5-second warning beeps per minute.
- Engine does not automatically detect failure — athlete stops manually or hits the max-minutes safety cap.
- Clock display: current minute countdown (secondary), overall elapsed (primary).

---

### Lead-In Countdown (all modes)

- Configurable: 3–30 seconds. Default: **10 seconds**.
- Final 3 seconds: individual pip beeps (3...2...1).
- At zero: GO beep (`beep_go`).
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
npx expo install expo-audio
npx expo install expo-keep-awake
```

### Audio session (set once in `AudioService.init()`)

```typescript
await setAudioModeAsync({
  playsInSilentMode: true, // overrides the iOS ringer switch
  shouldPlayInBackground: true, // keeps audio alive when the screen locks
  interruptionMode: "mixWithOthers", // cues play over the user's music, no ducking
});
```

### app.json

The `expo-audio` plugin with `"enableBackgroundPlayback": true` adds the iOS `UIBackgroundModes: ["audio"]` entry and the Android foreground-service permissions. These are native settings: they only take effect in a dev/store build, **not** in Expo Go and not via OTA.

### Background reliability

`setInterval` is suspended when the app is backgrounded, so the timer never trusts it:

1. **Timestamp engine**: elapsed time is always `now - startedAt + accumulated`, never a tick count.
2. **Silent keep-alive loop**: `AudioService.startKeepAlive()` loops `assets/sounds/timer/silence.wav` (volume 0) while the timer runs, so the OS keeps JS alive. It mixes with other audio, so the user's music is not interrupted. It stops on pause, stop and completion, so a paused workout can never fire cues.
3. **Catch-up**: if a tick arrives more than 1.5 s late, `TimerEngine._tick` replays the skipped seconds and fires every cue crossed in between. Gaps over 10 s are treated as stale and dropped.

| Mechanism | Screen locked? |
| --- | --- |
| `setInterval` alone | ❌ Throttled or paused |
| Timestamp engine + keep-alive loop + catch-up | ✅ (verify on a real device; Android battery optimisation can still interfere) |
| `expo-task-manager` background fetch | ❌ Fires every ~15 min |

**For absolute reliability on Android**: consider a Foreground Service notification (V2).

### Screen Lock (Keep Awake)

```typescript
// In useTimer hook — expo-keep-awake
import { useKeepAwake } from "expo-keep-awake";
useKeepAwake(); // Prevents screen from dimming/locking while hook is rendered
```

Only render the component containing `useKeepAwake` while the timer is active. When the athlete finishes and navigates away, stop calling the hook so normal screen lock behaviour resumes.

---

## 4. Sound + Voice Strategy

There is **no device TTS**. Spoken cues are pre-generated MP3 clips in `assets/audio/`; sound effects are WAVs in `assets/sounds/timer/`.

### Sound effects (`SoundCueId`)

| ID | Fired by |
| --- | --- |
| `beep_go` | Go signal at the end of the lead-in |
| `beep_warning` | Halfway alerts, Tabata work→rest, Custom block change |
| `horn_start` | New EMOM/EXMOM/Death By round; Tabata new round or rest→work |
| `horn_end` | Session complete |

### Voice clips

The engine emits `TTS` events with fixed text. `AudioService` maps that exact text to a clip in `VOICE_ASSETS`. **Text with no clip is silent.** To add a cue: add the MP3 to `assets/audio/`, add one entry to `VOICE_ASSETS`, and emit the same text from the engine.

| Engine text | Clip |
| --- | --- |
| Get Ready, 1–5, 10, Rest | same-named file |
| Halfway! | Halfway There |
| One minute remaining | 1 min Remaining |
| Work! | Lets Go |
| Next Round / Next Minute | Next Round / Next Minute |
| Time cap! Great work! | Time Cap Well Done Champ |
| Time! Stop where you are. (AMRAP) | Time Out Well Done Champ |
| EMOM complete. Well done! | Time Up Catch Your Breath You Earned It |
| Tabata complete! / Workout complete! | Workout Completed |

### Playback rules

- All players are preloaded in `AudioService.init()`.
- Each player rewinds itself on `didJustFinish`, so the next `play()` starts instantly (avoids a seek/play race that made repeat cues silent).
- **Beeps**: per-sound 150 ms debounce.
- **Voice**: one clip at a time. A new cue of equal or higher priority interrupts; a lower priority cue is dropped, not queued. If several voice events land in one tick only the highest priority plays.
- **No ducking**: cues play over the user's music at full volume.
- `DEBUG_AUDIO` in `AudioService.ts` logs every play/skip (temporary; remove when stable).

---

## 5. MVVM Structure

```
features/timer/
├── types/
│   └── index.ts              ← All TypeScript interfaces (WODConfig, TimerState, TickResult…)
├── engine/
│   └── TimerEngine.ts        ← Pure timer logic. No React. No state. Just compute().
├── services/
│   └── AudioService.ts       ← expo-audio. Preload, play, voice queue, keep-alive.
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

- `AudioService` owns the `expo-audio` session, preloaded sounds, voice clips, and the background keep-alive loop.
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
npx expo install expo-audio
npx expo install expo-keep-awake
```

Already in `package.json` and ready to use:

- `zustand` ^5.0.11 ✅
- `expo-haptics` ~14.1.4 ✅
- `react-native-reanimated` ~3.17.4 ✅
- `@react-native-async-storage/async-storage` ^2.2.0 ✅

### app.json

Use the `expo-audio` plugin with `enableBackgroundPlayback: true` (see section 3). Background audio is a native setting: it needs a dev/store build, not Expo Go or OTA.

### Audio assets

- `assets/sounds/timer/`: `beep_go.wav`, `beep_warning.wav`, `horn_start.wav`, `horn_end.wav`, `silence.wav` (keep-alive loop).
- `assets/audio/`: the voice MP3s listed in section 4.

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
| expo-audio background audio (keep-alive loop + catch-up)               | ✅ Implemented |
| Pre-generated voice clips (no device TTS)                              | ✅ Implemented |
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

**Decision**: Rely on the expo-audio session plus a silent keep-alive loop and timestamp catch-up for background persistence.  
**Rationale**: `expo-task-manager` background fetch fires every 15 minutes — useless for workout timers. The audio session keep-alive is the right primitive for this use case. Verify on a real device with the screen locked (iOS and Android).
