#!/usr/bin/env node
/**
 * Generates 6 WAV sound files for the WODGoat timer.
 * Run once: node scripts/generateTimerSounds.js
 *
 * No dependencies — uses only Node.js built-ins.
 * Output: assets/sounds/timer/*.wav
 */

const fs = require("fs");
const path = require("path");

const OUT_DIR = path.join(__dirname, "../assets/sounds/timer");
const SAMPLE_RATE = 44100;

// ─── WAV writer ───────────────────────────────────────────────────────────────

/**
 * @param {Float32Array} samples  Normalised [-1, 1]
 * @param {number} sampleRate
 * @returns {Buffer}
 */
function buildWav(samples, sampleRate) {
  const numSamples = samples.length;
  const byteRate = sampleRate * 2; // 16-bit mono
  const dataSize = numSamples * 2;
  const buf = Buffer.alloc(44 + dataSize);

  // RIFF header
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + dataSize, 4);
  buf.write("WAVE", 8);

  // fmt chunk
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16); // chunk size
  buf.writeUInt16LE(1, 20); // PCM
  buf.writeUInt16LE(1, 22); // mono
  buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE(byteRate, 28);
  buf.writeUInt16LE(2, 32); // block align (16-bit mono)
  buf.writeUInt16LE(16, 34); // bits per sample

  // data chunk
  buf.write("data", 36);
  buf.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < numSamples; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    buf.writeInt16LE(Math.round(s * 32767), 44 + i * 2);
  }

  return buf;
}

// ─── Tone generators ──────────────────────────────────────────────────────────

/** Pseudo-random LCG for deterministic white noise (no Math.random variance). */
let _seed = 0x1337cafe;
function noise() {
  _seed = (_seed * 1664525 + 1013904223) & 0xffffffff;
  return _seed / 0x80000000 - 1.0;
}

/**
 * Punchy envelope: near-instant attack, exponential decay.
 * Feels like a hit, not a smooth tone.
 */
function punchyEnv(i, n, attackSamples = 32) {
  if (i < attackSamples) return i / attackSamples;
  return Math.exp((-4.5 * (i - attackSamples)) / (n - attackSamples));
}

/**
 * Electronic beep with punchy envelope + slight harmonic.
 */
function punchyBeep(freq, durationMs, amp = 0.72) {
  const n = Math.floor((durationMs / 1000) * SAMPLE_RATE);
  const samples = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    // Fundamental + 2nd harmonic for brightness
    const sig =
      Math.sin(2 * Math.PI * freq * t) * 0.75 +
      Math.sin(2 * Math.PI * freq * 2 * t) * 0.25;
    samples[i] = amp * punchyEnv(i, n, 8) * sig;
  }
  return samples;
}

/**
 * Air horn: detuned partials + noise layer → brassy, rough stadium sound.
 * detuneCents: spread partials slightly off-pitch for beating/roughness.
 */
function airHorn(fundamentalHz, durationMs, amp = 0.85, detuneCents = 8) {
  const n = Math.floor((durationMs / 1000) * SAMPLE_RATE);
  const samples = new Float32Array(n);
  const detune = Math.pow(2, detuneCents / 1200); // cents → ratio

  // Harmonic series: 1f 2f 3f 4f 5f with slight detuning on odd partials
  const partials = [
    { freq: fundamentalHz, amp: 0.38 },
    { freq: fundamentalHz * 2, amp: 0.28 },
    { freq: fundamentalHz * 3 * detune, amp: 0.18 },
    { freq: fundamentalHz * 4, amp: 0.1 },
    { freq: fundamentalHz * 5 * detune, amp: 0.06 },
  ];

  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    // Fast attack (2ms), slow exponential decay — classic horn shape
    const env = i < 88 ? i / 88 : Math.exp((-1.8 * (i - 88)) / (n - 88));

    let sig = 0;
    for (const p of partials) {
      sig += p.amp * Math.sin(2 * Math.PI * p.freq * t);
    }
    // Blend in 12% noise for breath/air texture
    sig += 0.12 * noise();

    // Soft clip for warmth (tanh-style with cheaper approx)
    const clipped = sig / (1 + Math.abs(sig) * 0.6);
    samples[i] = amp * env * clipped;
  }
  return samples;
}

/**
 * Sports buzzer via FM synthesis: harsh, aggressive, instantly recognisable.
 * carrier + modulator = the classic "BZZZT" locker-room sound.
 */
function buzzer(durationMs, amp = 0.82) {
  const n = Math.floor((durationMs / 1000) * SAMPLE_RATE);
  const samples = new Float32Array(n);
  const carrierHz = 160;
  const modulatorHz = 96;
  const modDepth = 280; // Hz — high depth = nastier buzz

  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    // Hard attack (1ms), decay plateau, sharp cut
    const env =
      i < 44
        ? i / 44
        : i < n * 0.7
          ? 1.0
          : Math.exp((-6 * (i - n * 0.7)) / (n * 0.3));

    // FM: carrier frequency is modulated by modulator
    const mod = Math.sin(2 * Math.PI * modulatorHz * t);
    const sig = Math.sin(2 * Math.PI * (carrierHz + modDepth * mod) * t);

    // Hard clip at 80% → square-wave character = buzzier
    const clipped = Math.max(-0.8, Math.min(0.8, sig));

    // Add sub-bass thump for impact
    const sub = Math.sin(2 * Math.PI * 60 * t) * 0.25;

    samples[i] = amp * env * (clipped * 0.8 + sub);
  }
  return samples;
}

/**
 * Concatenate multiple Float32Arrays.
 */
function concat(...arrays) {
  const total = arrays.reduce((s, a) => s + a.length, 0);
  const out = new Float32Array(total);
  let offset = 0;
  for (const a of arrays) {
    out.set(a, offset);
    offset += a.length;
  }
  return out;
}

/**
 * Silence block.
 */
function silence(ms) {
  return new Float32Array(Math.floor((ms / 1000) * SAMPLE_RATE));
}

// ─── Sound definitions ────────────────────────────────────────────────────────

const sounds = {
  /** Sharp 1400 Hz electronic pip — heard clearly over gym noise */
  beep_countdown: () => punchyBeep(1400, 150, 0.72),

  /** Long loud air horn blast — unmistakable BEEEEEEEEEP start signal */
  beep_go: () => airHorn(440, 1200, 0.95, 10),

  /** Urgent double-pip warning — lower than countdown so it reads differently */
  beep_warning: () =>
    concat(punchyBeep(900, 100, 0.7), silence(40), punchyBeep(900, 100, 0.7)),

  /** Air horn blast — round start, raised to 330 Hz for brightness */
  horn_start: () => airHorn(330, 500, 0.88, 10),

  /** Double air horn — session complete, raised to 330 Hz for clarity */
  horn_end: () =>
    concat(
      airHorn(330, 420, 0.85, 10),
      silence(90),
      airHorn(330, 600, 0.92, 12), // second blast = bigger
    ),

  /** FM buzzer — work↔rest phase transition */
  buzzer_transition: () => buzzer(400, 0.82),
};

// ─── Write files ──────────────────────────────────────────────────────────────

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

for (const [name, generate] of Object.entries(sounds)) {
  const filePath = path.join(OUT_DIR, `${name}.wav`);
  const samples = generate();
  const wav = buildWav(samples, SAMPLE_RATE);
  fs.writeFileSync(filePath, wav);
  const kb = (wav.length / 1024).toFixed(1);
  console.log(`✓  ${name}.wav  (${kb} KB)`);
}

console.log("\nAll 6 timer sounds generated in assets/sounds/timer/");
