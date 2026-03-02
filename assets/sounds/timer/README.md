# Timer Sound Assets

Replace each placeholder `.wav` file with a real audio file before shipping.

| File | Description | Recommended duration |
|---|---|---|
| `beep_countdown.wav` | Single short pip (3-2-1 ticks) | ~100 ms |
| `beep_go.wav` | Go! signal (bright, ascending) | ~300 ms |
| `beep_warning.wav` | Warning tone (lower pitch) | ~200 ms |
| `horn_start.wav` | Air horn — round/interval start | ~500 ms |
| `horn_end.wav` | Air horn (double) — session complete | ~800 ms |
| `buzzer_transition.wav` | Sports buzzer — work↔rest transition | ~400 ms |

**Format**: Mono WAV or AAC, 44.1 kHz, under 100 KB each.

**Free sources**: [freesound.org](https://freesound.org), [zapsplat.com](https://zapsplat.com)

> The `AudioService` silently ignores load failures, so the timer works without sounds during development.
