# Timer Sound Assets

Sound effects played by `lib/timer/services/AudioService.ts`. Spoken cues live in `assets/audio/` (see `lib/timer/BLUEPRINT.md`, section 4).

| File               | Description                                                                   |
| ------------------ | ----------------------------------------------------------------------------- |
| `beep_go.wav`      | Go! signal at the end of the lead-in                                          |
| `beep_warning.wav` | Halfway / transition warning tone                                             |
| `horn_start.wav`   | Air horn, round/interval start                                                |
| `horn_end.wav`     | Air horn, session complete                                                    |
| `silence.wav`      | Inaudible loop played while the timer runs (background keep-alive). Keep as is |

**Format**: Mono WAV, under 100 KB each. Adding a new file also needs an entry in `SoundCueId` and `SOUND_ASSETS`.
