// ─────────────────────────────────────────────────────────────────────────────
// FIRST-LAUNCH TOUR — step config
//
// Content/order here is expected to change as the tour is iterated on. The
// mechanism it exercises (tab-hopping spotlight + demo-mode deep dive into
// the PR share flow) is the part that's meant to be stable.
// ─────────────────────────────────────────────────────────────────────────────

export type TabRoute = "index" | "groups" | "timer" | "prs" | "profile";

export const TAB_ROUTE_PATHS: Record<TabRoute, string> = {
  index: "/(tabs)",
  groups: "/(tabs)/groups",
  timer: "/(tabs)/timer",
  prs: "/(tabs)/prs",
  profile: "/(tabs)/profile",
};

export interface TourStep {
  id: string;
  /** Registered id (via TourTarget) of the element to spotlight. */
  targetId?: string;
  /** Switch to this tab before spotlighting targetId. */
  tabRoute?: TabRoute;
  /** OR push a nested route (e.g. a demo-flagged screen) instead of a tab switch. */
  pushRoute?: string;
  title: string;
  description: string;
  /** "next" (default) advances via the overlay's Next button. "targetPress" waits
   *  for the real element to be tapped (the screen calls notifyTargetPress itself). */
  advanceOn?: "next" | "targetPress";
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: "home-week",
    tabRoute: "index",
    targetId: "home-day-card",
    title: "Your training week",
    description: "See your plan for today, and swipe through the week to peek ahead.",
  },
  {
    id: "home-fab",
    tabRoute: "index",
    targetId: "tab-fab",
    title: "Log a workout",
    description: "Tap + anytime to log a new workout.",
  },
  {
    id: "groups-fab",
    tabRoute: "groups",
    targetId: "tab-fab",
    title: "Groups & coaching",
    description: "Join a community or start your own coaching group here.",
  },
  {
    id: "timer-fab",
    tabRoute: "timer",
    targetId: "tab-fab",
    title: "WOD Timer",
    description: "Launch a fully customizable WOD timer — rounds, intervals, and audio cues.",
  },
  {
    id: "prs-intro",
    tabRoute: "prs",
    targetId: "tab-fab",
    title: "Personal records",
    description: "Every PR you log lives here. Let's see one in action.",
  },
  {
    id: "pr-demo-share",
    pushRoute: "/pr/back_squat?tourDemo=1&name=Back%20Squat",
    targetId: "pr-share-button",
    title: "Share your PR",
    description: "Tap Share to turn any PR into a shareable card.",
    advanceOn: "targetPress",
  },
  {
    id: "pr-demo-sticker",
    targetId: "pr-sticker-carousel",
    title: "Pick a style",
    description: "Choose a design, then Save or Share.",
  },
  {
    id: "profile-plan",
    tabRoute: "profile",
    targetId: "profile-plan-badge",
    title: "Your plan",
    description: "Manage your plan and replay this tour anytime from here.",
  },
];
