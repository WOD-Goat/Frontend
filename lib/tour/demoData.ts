// ─────────────────────────────────────────────────────────────────────────────
// TOUR DEMO DATA
//
// Fixture PR shown to brand-new users (zero real PRs) during the tour, so the
// PR list / detail / share-sticker flow can be demoed with real components
// instead of an empty state. Shape matches the loose runtime shape the PRs
// screens actually consume (`exerciseId`/`actualPR`/`improvement`/`estimatedPR`/
// `date._seconds`), not the stricter `PersonalRecord` API type — same as
// `app/(tabs)/prs.tsx` and `app/pr/[id].tsx` already do.
// ─────────────────────────────────────────────────────────────────────────────

// Epley formula for estimated 1-rep max — mirrors app/pr/create.tsx.
function epley1RM(weight: number, reps: number): number {
  return reps === 1 ? weight : Math.round(weight * (1 + reps / 30));
}

export const DEMO_EXERCISE_ID = "back_squat";
export const DEMO_EXERCISE_NAME = "Back Squat";

const DEMO_WEIGHT = 100;
const DEMO_REPS = 5;
const DEMO_IMPROVEMENT = 5;

export const DEMO_PR = {
  exerciseId: DEMO_EXERCISE_ID,
  exerciseName: DEMO_EXERCISE_NAME,
  actualPR: DEMO_WEIGHT,
  improvement: DEMO_IMPROVEMENT,
  estimatedPR: epley1RM(DEMO_WEIGHT, DEMO_REPS),
  date: { _seconds: Math.floor(Date.now() / 1000), _nanoseconds: 0 },
};
