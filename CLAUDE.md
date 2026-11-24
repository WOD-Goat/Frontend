# Frontend — WODGoat mobile app
Shared rules: `../CLAUDE.md`. API contract: `../Backend/API_ENDPOINTS_SPEC.md`.

## Stack
Expo + React Native + expo-router (file-based), zustand, Firebase, RevenueCat (`react-native-purchases`), Reanimated, expo-notifications, expo-updates (EAS, see `eas.json`).

## Commands
- `npx expo start` (script `start` uses `--go`), `npm run lint`
- Typecheck: `npx tsc --noEmit`

## Structure
- `app/` routes: `(tabs)`, `auth`, `group`, `pr`, `program`, `timer`, `workout`.
- `api/client.ts` (ApiClient with token refresh) + `api/services/`.
- `components/ui` shared primitives (Button, Card, Input, Modal, BottomSheet, Toast, Skeleton...).
- `constants/` Colors, Typography, Layout, storage/global-state keys. `lib/timer` = timer engine. `lib/ai` = voice workout.

## Rules
- Use `components/ui` + `constants/Colors|Typography|Layout`; no inline hex values.
- API calls only through `api/services`; do not call fetch directly in screens.
- Test on device/emulator for native modules; Expo Go may not support everything (see `expo-dev-client`).
- `QA_Testing_Guide.md` lists manual test flows; update when flows change.

## OTA reminder (do not forget)
- Fixes ship via OTA (`expo-updates`) several times before the next store release. OTA only updates JS and assets; it cannot change native code.
- **Do NOT remove or add native packages or change native config** (`package.json` deps, `app.json` plugins) until the next store build, or OTA users on the released binary will crash or break.
- Known leftover to remove at the next store release: `expo-speech` (no longer imported; timer now plays pre-generated clips from `assets/audio`).
- Remind the user of this whenever a task touches `package.json` dependencies or `app.json` plugins.

## Env
See `.env.example`. API base URL comes from the env var; unset falls back to production.
