// ─────────────────────────────────────────────────────────────────────────────
// TOUR STORE (Zustand)
//
// Single source of truth for the first-launch guided tour: which step is
// active, where each spotlighted element currently sits on screen, and
// whether the tour has already been completed (persisted so it never
// auto-replays). `isDemoMode` mirrors `isActive` — any screen can check it
// to decide whether to render fixture data instead of real (possibly empty)
// data while the tour is running.
// ─────────────────────────────────────────────────────────────────────────────

import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { create } from "zustand";
import { TAB_ROUTE_PATHS, TOUR_STEPS } from "@/constants/tourSteps";

const TOUR_STATE_KEY = "@wodgoat/tour_state";

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface TourStore {
  isActive: boolean;
  isDemoMode: boolean;
  currentStepIndex: number;
  targets: Record<string, Rect>;
  hasCompletedTour: boolean;
  hasCheckedTourCompletion: boolean;

  start: () => void;
  next: () => void;
  skip: () => void;
  finish: () => void;
  registerTarget: (id: string, rect: Rect) => void;
  /** Called by a real element's onPress when a step is advanceOn: "targetPress". */
  notifyTargetPress: (targetId: string) => void;
  loadCompletion: () => Promise<void>;
}

function navigateToStep(index: number) {
  const step = TOUR_STEPS[index];
  if (!step) return;
  if (step.tabRoute) {
    router.navigate(TAB_ROUTE_PATHS[step.tabRoute] as any);
  } else if (step.pushRoute) {
    router.push(step.pushRoute as any);
  }
}

export const useTourStore = create<TourStore>((set, get) => ({
  isActive: false,
  isDemoMode: false,
  currentStepIndex: 0,
  targets: {},
  hasCompletedTour: false,
  hasCheckedTourCompletion: false,

  start() {
    set({ isActive: true, isDemoMode: true, currentStepIndex: 0, targets: {} });
    navigateToStep(0);
  },

  next() {
    const nextIndex = get().currentStepIndex + 1;
    if (nextIndex >= TOUR_STEPS.length) {
      get().finish();
      return;
    }
    set({ currentStepIndex: nextIndex });
    navigateToStep(nextIndex);
  },

  skip() {
    get().finish();
  },

  finish() {
    set({ isActive: false, isDemoMode: false });
    AsyncStorage.setItem(TOUR_STATE_KEY, "completed").catch(() => {});
    set({ hasCompletedTour: true });
  },

  registerTarget(id, rect) {
    set((state) => ({ targets: { ...state.targets, [id]: rect } }));
  },

  notifyTargetPress(targetId) {
    const state = get();
    const step = TOUR_STEPS[state.currentStepIndex];
    if (state.isActive && step?.targetId === targetId && step?.advanceOn === "targetPress") {
      get().next();
    }
  },

  async loadCompletion() {
    try {
      const raw = await AsyncStorage.getItem(TOUR_STATE_KEY);
      set({ hasCompletedTour: raw === "completed" });
    } catch {
      // Default to "not completed" — worst case the tour runs an extra time.
    } finally {
      set({ hasCheckedTourCompletion: true });
    }
  },
}));
