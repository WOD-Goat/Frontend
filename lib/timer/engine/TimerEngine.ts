// ─────────────────────────────────────────────────────────────────────────────
// TIMER ENGINE
//
// Design principles:
//  1. DRIFT-FREE: every tick computes elapsed time from wall-clock difference,
//     not by accumulating interval counts. setInterval is only used as a
//     "wake-up" trigger, never as a source of truth.
//  2. PURE FUNCTION CORE: `tick()` is a pure computation given a timestamp.
//     The engine holds no mutable display state — the store owns that.
//  3. SINGLE ENGINE — all 6 WOD modes share the same tick pipeline.
//     Mode-specific logic lives in Strategy classes.
// ─────────────────────────────────────────────────────────────────────────────

import type { AudioEvent, SoundCueId, TickResult, WODConfig } from "../types";

// ─── Internal interval handle type ────────────────────────────────────────────

type TickCallback = (result: TickResult) => void;

// ─── Strategy Interface ────────────────────────────────────────────────────────

interface ModeStrategy {
  /**
   * Given total elapsed seconds, compute the current tick result.
   * Must be a pure computation — no side effects.
   */
  compute(elapsedSeconds: number, previousElapsed: number): TickResult;
  /** Total duration in seconds, or null if open-ended (FOR_TIME / DEATH_BY). */
  totalDuration: number | null;
  /**
   * True for strategies that cycle through internal intervals (EMOM, Tabata, Custom, DeathBy).
   * Used by LeadInStrategy to skip total-duration halfway (interval strategies fire it per interval).
   */
  hasIntervals: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function beep(id: SoundCueId): AudioEvent {
  return { type: "SOUND", soundId: id };
}

function tts(text: string, priority = 0): AudioEvent {
  return { type: "TTS", text, priority };
}

function crossedSecond(prev: number, curr: number): boolean {
  return Math.floor(curr) > Math.floor(prev);
}

function secondsToMMSS(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

// ─── LEAD-IN STRATEGY (shared 3-2-1-GO prefix) ────────────────────────────────

/**
 * Wraps any inner strategy with an initial countdown.
 * leadIn = 10 → engine counts from 10 down to 0, then delegates to inner.
 */
class LeadInStrategy implements ModeStrategy {
  constructor(
    private inner: ModeStrategy,
    private leadIn: number,
  ) {}

  get totalDuration(): number | null {
    const innerDuration = this.inner.totalDuration;
    if (innerDuration === null) return null;
    return this.leadIn + innerDuration;
  }

  compute(elapsedSeconds: number, previousElapsed: number): TickResult {
    if (elapsedSeconds < this.leadIn) {
      const remaining = this.leadIn - elapsedSeconds;
      const audioEvents: AudioEvent[] = [];

      // Say "Ready" on the very first tick to warm up TTS before 3-2-1
      if (previousElapsed === 0 && elapsedSeconds > 0) {
        audioEvents.push(tts("Get Ready", 6));
      }

      if (crossedSecond(previousElapsed, elapsedSeconds)) {
        const secInt = Math.ceil(remaining);
        if (secInt <= 3 && secInt >= 1) {
          audioEvents.push(tts(`${secInt}`, 8));
        }
      }

      return {
        phase: "COUNTDOWN",
        // Return actual elapsedSeconds so the display-throttle in the store
        // advances once per second and the countdown visually ticks down.
        elapsedSeconds,
        remainingSeconds: Math.ceil(remaining),
        currentRound: 0,
        totalRounds: undefined,
        intervalRemaining: undefined,
        label: "Get Ready",
        isComplete: false,
        audioEvents,
      };
    }

    // Delegate to inner strategy with adjusted elapsed
    const innerElapsed = elapsedSeconds - this.leadIn;
    const innerPrev = Math.max(0, previousElapsed - this.leadIn);
    const result = this.inner.compute(innerElapsed, innerPrev);

    // Fire the GO horn exactly once — the moment we cross the lead-in boundary.
    if (previousElapsed < this.leadIn) {
      result.audioEvents.push(beep("beep_go"));
    }

    // Half-time alert for non-interval modes (interval strategies fire it per interval).
    const innerDuration = this.inner.totalDuration;
    if (!this.inner.hasIntervals && innerDuration !== null && innerDuration > 0) {
      const half = innerDuration / 2;
      if (innerPrev < half && innerElapsed >= half) {
        result.audioEvents.push(beep("beep_warning"));
        result.audioEvents.push(tts("Halfway!", 7));
      }
    }

    return result;
  }
}

// ─── FOR TIME STRATEGY ────────────────────────────────────────────────────────

class ForTimeStrategy implements ModeStrategy {
  readonly hasIntervals = false;
  constructor(private cap: number | null) {}

  get totalDuration(): number | null {
    return this.cap;
  }

  compute(elapsedSeconds: number, previousElapsed: number): TickResult {
    const audioEvents: AudioEvent[] = [];

    if (this.cap !== null && elapsedSeconds >= this.cap) {
      if (Math.floor(previousElapsed) < this.cap) {
        audioEvents.push(beep("horn_end"));
        audioEvents.push(tts("Time cap! Great work!", 10));
      }
      return {
        phase: "COMPLETE",
        elapsedSeconds: this.cap,
        remainingSeconds: 0,
        currentRound: 1,
        totalRounds: undefined,
        intervalRemaining: undefined,
        label: "Time Cap!",
        isComplete: true,
        audioEvents,
      };
    }

    if (crossedSecond(previousElapsed, elapsedSeconds)) {
      if (this.cap !== null) {
        const remaining = this.cap - elapsedSeconds;
        const remInt = Math.ceil(remaining);
        if (remInt === 60) {
          audioEvents.push(tts("One minute remaining", 5));
        } else if (remInt === 10) {
          audioEvents.push(tts("10", 7));
        } else if (remInt <= 5 && remInt > 0) {
          audioEvents.push(tts(`${remInt}`, 8));
        }
      }
    }

    return {
      phase: "WORK",
      elapsedSeconds,
      remainingSeconds:
        this.cap !== null
          ? Math.max(0, Math.ceil(this.cap - elapsedSeconds))
          : undefined,
      currentRound: 1,
      totalRounds: undefined,
      intervalRemaining: undefined,
      label: "For Time",
      isComplete: false,
      audioEvents,
    };
  }
}

// ─── AMRAP STRATEGY ───────────────────────────────────────────────────────────

class AMRAPStrategy implements ModeStrategy {
  readonly hasIntervals = false;
  constructor(private durationSeconds: number) {}

  get totalDuration(): number {
    return this.durationSeconds;
  }

  compute(elapsedSeconds: number, previousElapsed: number): TickResult {
    const audioEvents: AudioEvent[] = [];
    const remaining = this.durationSeconds - elapsedSeconds;

    if (remaining <= 0) {
      if (Math.floor(previousElapsed) < this.durationSeconds) {
        audioEvents.push(beep("horn_end"));
        audioEvents.push(tts("Time! Stop where you are.", 10));
      }
      return {
        phase: "COMPLETE",
        elapsedSeconds: this.durationSeconds,
        remainingSeconds: 0,
        currentRound: 1,
        totalRounds: undefined,
        intervalRemaining: undefined,
        label: "AMRAP Complete",
        isComplete: true,
        audioEvents,
      };
    }

    if (crossedSecond(previousElapsed, elapsedSeconds)) {
      const remInt = Math.ceil(remaining);
      if (remInt === 60) audioEvents.push(tts("One minute remaining", 5));
      else if (remInt === 10) audioEvents.push(tts("10", 7));
      else if (remInt <= 5 && remInt > 0) audioEvents.push(tts(`${remInt}`, 8));
    }

    return {
      phase: "WORK",
      elapsedSeconds,
      remainingSeconds: Math.max(0, Math.ceil(remaining)),
      currentRound: 1,
      totalRounds: undefined,
      intervalRemaining: undefined,
      label: "AMRAP",
      isComplete: false,
      audioEvents,
    };
  }
}

// ─── EMOM / EXMOM STRATEGY ────────────────────────────────────────────────────

class EMOMStrategy implements ModeStrategy {
  readonly hasIntervals = true;
  constructor(
    private intervalSeconds: number, // 60 for EMOM, custom for EXMOM
    private totalIntervals: number,
  ) {}

  get totalDuration(): number {
    return this.intervalSeconds * this.totalIntervals;
  }

  compute(elapsedSeconds: number, previousElapsed: number): TickResult {
    const audioEvents: AudioEvent[] = [];
    const total = this.totalDuration;

    if (elapsedSeconds >= total) {
      if (Math.floor(previousElapsed) < total) {
        audioEvents.push(beep("horn_end"));
        audioEvents.push(tts("EMOM complete. Well done!", 10));
      }
      return {
        phase: "COMPLETE",
        elapsedSeconds: total,
        remainingSeconds: 0,
        currentRound: this.totalIntervals,
        totalRounds: this.totalIntervals,
        intervalRemaining: 0,
        label: "Complete",
        isComplete: true,
        audioEvents,
      };
    }

    const round = Math.floor(elapsedSeconds / this.intervalSeconds); // 0-based
    const intervalElapsed = elapsedSeconds % this.intervalSeconds;
    const intervalRemaining = this.intervalSeconds - intervalElapsed;

    const prevRound = Math.floor(previousElapsed / this.intervalSeconds);
    const isNewRound = round > prevRound;

    if (isNewRound) {
      audioEvents.push(beep("horn_start"));
      audioEvents.push(tts(`Round ${round + 1}`, 8));
    }

    // Per-interval halfway alert
    const prevIntervalElapsed = previousElapsed % this.intervalSeconds;
    const half = this.intervalSeconds / 2;
    if (!isNewRound && prevIntervalElapsed < half && intervalElapsed >= half) {
      audioEvents.push(beep("beep_warning"));
      audioEvents.push(tts("Halfway!", 6));
    }

    if (crossedSecond(previousElapsed, elapsedSeconds)) {
      const remInt = Math.ceil(intervalRemaining);
      if (remInt === 10 && !isNewRound) {
        audioEvents.push(tts("10", 7));
      } else if (remInt <= 5 && remInt > 0 && !isNewRound) {
        audioEvents.push(tts(`${remInt}`, 8));
      }
    }

    return {
      phase: "WORK",
      elapsedSeconds,
      remainingSeconds: Math.max(0, Math.ceil(total - elapsedSeconds)),
      currentRound: round + 1,
      totalRounds: this.totalIntervals,
      intervalRemaining: Math.max(0, Math.ceil(intervalRemaining)),
      label: `Round ${round + 1} / ${this.totalIntervals}`,
      isComplete: false,
      audioEvents,
    };
  }
}

// ─── TABATA STRATEGY ──────────────────────────────────────────────────────────

class TabataStrategy implements ModeStrategy {
  readonly hasIntervals = true;
  private intervalSeconds: number;

  constructor(
    private workSeconds: number,
    private restSeconds: number,
    private rounds: number,
  ) {
    this.intervalSeconds = workSeconds + restSeconds;
  }

  get totalDuration(): number {
    return this.intervalSeconds * this.rounds;
  }

  compute(elapsedSeconds: number, previousElapsed: number): TickResult {
    const audioEvents: AudioEvent[] = [];
    const total = this.totalDuration;

    if (elapsedSeconds >= total) {
      if (Math.floor(previousElapsed) < total) {
        audioEvents.push(beep("horn_end"));
        audioEvents.push(tts("Tabata complete!", 10));
      }
      return {
        phase: "COMPLETE",
        elapsedSeconds: total,
        remainingSeconds: 0,
        currentRound: this.rounds,
        totalRounds: this.rounds,
        intervalRemaining: 0,
        label: "Complete",
        isComplete: true,
        audioEvents,
      };
    }

    const round = Math.floor(elapsedSeconds / this.intervalSeconds); // 0-based
    const intervalElapsed = elapsedSeconds % this.intervalSeconds;
    const isWork = intervalElapsed < this.workSeconds;
    const phaseElapsed = isWork
      ? intervalElapsed
      : intervalElapsed - this.workSeconds;
    const phaseDuration = isWork ? this.workSeconds : this.restSeconds;
    const phaseRemaining = phaseDuration - phaseElapsed;

    // Detect phase transitions
    const prevIntervalElapsed = previousElapsed % this.intervalSeconds;
    const prevIsWork = prevIntervalElapsed < this.workSeconds;
    const prevRound = Math.floor(previousElapsed / this.intervalSeconds);

    const newRound = round > prevRound;
    const phaseChanged = isWork !== prevIsWork && !newRound;

    if (newRound || (prevIsWork && !isWork && round === prevRound)) {
      // Transition: REST→WORK (new round) or WORK→REST
    }

    if (newRound) {
      audioEvents.push(beep("horn_start"));
      audioEvents.push(tts(`Round ${round + 1}. Work!`, 8));
    } else if (phaseChanged && !isWork) {
      audioEvents.push(beep("beep_warning"));
      audioEvents.push(tts("Rest", 7));
    } else if (phaseChanged && isWork) {
      audioEvents.push(beep("horn_start"));
      audioEvents.push(tts("Work!", 8));
    }

    // Per-phase halfway alert
    const prevPhaseElapsed = prevIsWork
      ? prevIntervalElapsed
      : Math.max(0, prevIntervalElapsed - this.workSeconds);
    if (!newRound && !phaseChanged) {
      const half = phaseDuration / 2;
      if (prevPhaseElapsed < half && phaseElapsed >= half) {
        audioEvents.push(beep("beep_warning"));
        audioEvents.push(tts("Halfway!", 6));
      }
    }

    if (crossedSecond(previousElapsed, elapsedSeconds)) {
      const remInt = Math.ceil(phaseRemaining);
      if (remInt === 10 && !newRound && !phaseChanged) {
        audioEvents.push(tts("10", 7));
      } else if (remInt <= 3 && remInt > 0) {
        audioEvents.push(tts(`${remInt}`, 8));
      }
    }

    return {
      phase: isWork ? "WORK" : "REST",
      elapsedSeconds,
      remainingSeconds: Math.max(0, Math.ceil(total - elapsedSeconds)),
      currentRound: round + 1,
      totalRounds: this.rounds,
      intervalRemaining: Math.max(0, Math.ceil(phaseRemaining)),
      label: isWork ? "Work" : "Rest",
      isComplete: false,
      audioEvents,
    };
  }
}

// ─── CUSTOM STRATEGY ──────────────────────────────────────────────────────────

import type { CustomBlock } from "../types";

class CustomStrategy implements ModeStrategy {
  readonly hasIntervals = true;
  private flatBlocks: CustomBlock[];
  private cycleDuration: number;
  private _totalDuration: number;

  constructor(blocks: CustomBlock[], cycles: number) {
    this.flatBlocks = blocks;
    this.cycleDuration = blocks.reduce((sum, b) => sum + b.durationSeconds, 0);
    this._totalDuration = this.cycleDuration * cycles;
    this.flatBlocks = blocks;
  }

  get totalDuration(): number {
    return this._totalDuration;
  }

  private resolveBlock(elapsedSeconds: number): {
    block: CustomBlock;
    blockElapsed: number;
    blockRemaining: number;
    cycle: number;
  } {
    const cycleElapsed = elapsedSeconds % this.cycleDuration;
    const cycle = Math.floor(elapsedSeconds / this.cycleDuration);

    let acc = 0;
    for (const block of this.flatBlocks) {
      if (cycleElapsed < acc + block.durationSeconds) {
        return {
          block,
          blockElapsed: cycleElapsed - acc,
          blockRemaining: block.durationSeconds - (cycleElapsed - acc),
          cycle,
        };
      }
      acc += block.durationSeconds;
    }
    // Fallback to last block
    const lastBlock = this.flatBlocks[this.flatBlocks.length - 1];
    return {
      block: lastBlock,
      blockElapsed: lastBlock.durationSeconds,
      blockRemaining: 0,
      cycle,
    };
  }

  compute(elapsedSeconds: number, previousElapsed: number): TickResult {
    const audioEvents: AudioEvent[] = [];

    if (elapsedSeconds >= this._totalDuration) {
      if (Math.floor(previousElapsed) < this._totalDuration) {
        audioEvents.push(beep("horn_end"));
        audioEvents.push(tts("Workout complete!", 10));
      }
      const lastBlock = this.flatBlocks[this.flatBlocks.length - 1];
      return {
        phase: "COMPLETE",
        elapsedSeconds: this._totalDuration,
        remainingSeconds: 0,
        currentRound: 1,
        totalRounds: 1,
        intervalRemaining: 0,
        label: "Complete",
        isComplete: true,
        audioEvents,
      };
    }

    const { block, blockElapsed, blockRemaining, cycle } = this.resolveBlock(elapsedSeconds);
    const { block: prevBlock, blockElapsed: prevBlockElapsed } = this.resolveBlock(previousElapsed);

    if (block.id !== prevBlock.id) {
      audioEvents.push(beep("beep_warning"));
      if (block.announce) {
        audioEvents.push(tts(block.label, 8));
      }
    } else {
      // Per-block halfway alert
      const half = block.durationSeconds / 2;
      if (prevBlockElapsed < half && blockElapsed >= half) {
        audioEvents.push(beep("beep_warning"));
        audioEvents.push(tts("Halfway!", 6));
      }
    }

    if (crossedSecond(previousElapsed, elapsedSeconds)) {
      const remInt = Math.ceil(blockRemaining);
      if (remInt === 10 && block.id === prevBlock.id) {
        audioEvents.push(tts("10", 7));
      } else if (remInt <= 3 && remInt > 0 && block.id === prevBlock.id) {
        audioEvents.push(tts(`${remInt}`, 8));
      }
    }

    return {
      phase: block.phase,
      elapsedSeconds,
      remainingSeconds: Math.max(
        0,
        Math.ceil(this._totalDuration - elapsedSeconds),
      ),
      currentRound: cycle + 1,
      totalRounds: undefined,
      intervalRemaining: Math.max(0, Math.ceil(blockRemaining)),
      label: block.label,
      isComplete: false,
      audioEvents,
    };
  }
}

// ─── DEATH BY STRATEGY ────────────────────────────────────────────────────────

class DeathByStrategy implements ModeStrategy {
  readonly hasIntervals = true;
  constructor(private maxMinutes: number) {}

  get totalDuration(): null {
    return null; // open-ended
  }

  compute(elapsedSeconds: number, previousElapsed: number): TickResult {
    const audioEvents: AudioEvent[] = [];
    const currentMinute = Math.floor(elapsedSeconds / 60) + 1;
    const secondInMinute = elapsedSeconds % 60;
    const remaining = 60 - secondInMinute;

    if (currentMinute > this.maxMinutes) {
      if (Math.floor(previousElapsed / 60) < this.maxMinutes) {
        audioEvents.push(beep("horn_end"));
      }
      return {
        phase: "COMPLETE",
        elapsedSeconds,
        remainingSeconds: 0,
        currentRound: this.maxMinutes,
        totalRounds: this.maxMinutes,
        intervalRemaining: 0,
        label: "Complete",
        isComplete: true,
        audioEvents,
      };
    }

    const prevMinute = Math.floor(previousElapsed / 60) + 1;
    if (currentMinute > prevMinute) {
      audioEvents.push(beep("horn_start"));
      audioEvents.push(
        tts(`Minute ${currentMinute}. ${currentMinute} reps!`, 8),
      );
    }

    if (crossedSecond(previousElapsed, elapsedSeconds)) {
      const remInt = Math.ceil(remaining);
      if (remInt === 10 && currentMinute === prevMinute) {
        audioEvents.push(tts("10", 7));
      } else if (remInt <= 5 && remInt > 0 && currentMinute === prevMinute) {
        audioEvents.push(tts(`${remInt}`, 8));
      }
    }

    return {
      phase: "WORK",
      elapsedSeconds,
      remainingSeconds: undefined, // open-ended
      currentRound: currentMinute,
      totalRounds: this.maxMinutes,
      intervalRemaining: Math.max(0, Math.ceil(remaining)),
      label: `Minute ${currentMinute} — ${currentMinute} Reps`,
      isComplete: false,
      audioEvents,
    };
  }
}

// ─── STRATEGY FACTORY ─────────────────────────────────────────────────────────

function buildStrategy(config: WODConfig): ModeStrategy {
  let inner: ModeStrategy;

  switch (config.mode) {
    case "FOR_TIME":
      inner = new ForTimeStrategy(config.timeCap);
      break;
    case "AMRAP":
      inner = new AMRAPStrategy(config.durationSeconds);
      break;
    case "EMOM":
      inner = new EMOMStrategy(60, config.totalMinutes);
      break;
    case "EXMOM":
      inner = new EMOMStrategy(config.intervalSeconds, config.totalIntervals);
      break;
    case "TABATA":
      inner = new TabataStrategy(
        config.workSeconds,
        config.restSeconds,
        config.rounds,
      );
      break;
    case "CUSTOM":
      inner = new CustomStrategy(config.blocks, config.cycles);
      break;
    case "DEATH_BY":
      inner = new DeathByStrategy(config.maxMinutes);
      break;
  }

  return new LeadInStrategy(inner, config.leadInSeconds);
}

// ─────────────────────────────────────────────────────────────────────────────
// TIMER ENGINE CLASS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * TimerEngine is the single runtime instance for a WOD session.
 * It owns only the scheduling logic.
 * All state mutations go through the `onTick` callback → Zustand store.
 *
 * DRIFT CORRECTION:
 *   - On start/resume, record `startedAt = Date.now()`.
 *   - On every interval callback: `elapsedMs = Date.now() - startedAt + accumulatedMs`.
 *   - This means even if a garbage collection pause delays an interval callback
 *     by 200 ms, the next tick will immediately "catch up" to real wall time.
 *
 * INTERVAL FREQUENCY:
 *   - Default: 100 ms. Fine-grained enough to keep display accurate to ±1 frame,
 *     without burning CPU like a 16 ms loop would.
 *   - During the final 5 seconds of a phase, bumps to 50 ms for tighter beep timing.
 */
export class TimerEngine {
  private strategy: ModeStrategy | null = null;
  private config: WODConfig | null = null;

  private intervalId: ReturnType<typeof setInterval> | null = null;
  private startedAt: number | null = null;
  private accumulatedMs: number = 0;

  private previousElapsedSeconds: number = 0;
  private onTick: TickCallback = () => {};

  private readonly NORMAL_INTERVAL_MS = 100;
  private readonly FAST_INTERVAL_MS = 50;

  // ─── Public API ─────────────────────────────────────────────────────────────

  configure(config: WODConfig, onTick: TickCallback): void {
    this.stop();
    this.config = config;
    this.strategy = buildStrategy(config);
    this.accumulatedMs = 0;
    this.previousElapsedSeconds = 0;
    this.onTick = onTick;
  }

  /**
   * Resume from a snapshot (app returned from background mid-workout).
   * Pass accumulated ms so the engine restores the correct elapsed time.
   */
  resume(accumulatedMs: number, onTick: TickCallback): void {
    if (!this.config) return;
    this.onTick = onTick;
    this.accumulatedMs = accumulatedMs;
    this.previousElapsedSeconds = accumulatedMs / 1000;
    this.startedAt = Date.now();
    this._startInterval();
  }

  start(): void {
    if (!this.strategy) return;
    this.startedAt = Date.now();
    this._startInterval();
  }

  pause(): number {
    if (this.startedAt !== null) {
      this.accumulatedMs += Date.now() - this.startedAt;
    }
    this._stopInterval();
    this.startedAt = null;
    return this.accumulatedMs;
  }

  stop(): void {
    this._stopInterval();
    this.startedAt = null;
    this.accumulatedMs = 0;
    this.previousElapsedSeconds = 0;
  }

  /** Returns current accumulated ms without pausing. Useful for snapshotting. */
  getElapsedMs(): number {
    if (this.startedAt !== null) {
      return this.accumulatedMs + (Date.now() - this.startedAt);
    }
    return this.accumulatedMs;
  }

  dispose(): void {
    this.stop();
    this.strategy = null;
    this.config = null;
    this.onTick = () => {};
  }

  // ─── Private ─────────────────────────────────────────────────────────────────

  private _startInterval(intervalMs = this.NORMAL_INTERVAL_MS): void {
    this._stopInterval();
    this.intervalId = setInterval(() => this._tick(), intervalMs);
  }

  private _stopInterval(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private _tick(): void {
    if (!this.strategy || this.startedAt === null) return;

    const nowMs = Date.now();
    const totalElapsedMs = this.accumulatedMs + (nowMs - this.startedAt);
    const elapsedSeconds = totalElapsedMs / 1000;

    const result = this.strategy.compute(
      elapsedSeconds,
      this.previousElapsedSeconds,
    );
    this.previousElapsedSeconds = elapsedSeconds;

    this.onTick(result);

    if (result.isComplete) {
      this._stopInterval();
      return;
    }

    // Bump to faster interval during the final 5 seconds of any phase.
    // COUNTDOWN uses remainingSeconds; work/rest phases use intervalRemaining when
    // available, otherwise remainingSeconds.
    const relevantRemaining =
      result.intervalRemaining !== undefined
        ? result.intervalRemaining
        : result.remainingSeconds;
    const inFinalSeconds =
      relevantRemaining !== undefined && relevantRemaining <= 5;

    const wantsFast = inFinalSeconds;
    const currentlyFast =
      this.intervalId !== null &&
      // We track this by restarting at the right speed:
      false; // simplified — always restart if needed

    // Dynamically switch polling rate
    const targetMs = wantsFast
      ? this.FAST_INTERVAL_MS
      : this.NORMAL_INTERVAL_MS;
    // Only restart interval if we want a different rate (avoid churn every tick)
    // We track the current rate via a private field instead of the simplified flag above.
    if (this._currentIntervalMs !== targetMs) {
      this._currentIntervalMs = targetMs;
      this._startInterval(targetMs);
    }
  }

  private _currentIntervalMs: number = 100;
}

// ─── Singleton export ──────────────────────────────────────────────────────────
// The engine is shared app-wide via the store. One instance per active session.
export const timerEngine = new TimerEngine();
