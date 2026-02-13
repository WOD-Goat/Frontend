// Tab Icons
export const tabIcons = {
  home: require("./home.png"),
  homeSelected: require("./home-selected.png"),
  workout: require("./workout.png"),
  workoutSelected: require("./workout-selected.png"),
  pr: require("./pr.png"),
  prSelected: require("./pr-selected.png"),
  profile: require("./profile.png"),
  profileSelected: require("./profile-selected.png"),
  stopwatch: require("./stopwatch.png"),
};

// App Icons
export const appIcons = {
  logo: require("./logo.png"),
};

export const mascotAssets = {
  backsquat: require("./backsquat.png"),
  bike: require("./bike.png"),
  doctor: require("./doctor.png"),
  goatai: require("./goatai.png"),
  premium: require("./premium.png"),
  pushup: require("./pushup.png"),
  sledpush: require("./sledpush.png"),
  snatch: require("./snatch.png"),
  standard: require("./standard.png"),
  upcoming: require("./upcoming.png"),
  whistle: require("./whistle.png"),
};

// Export all images as a single object for convenience
export const images = {
  ...tabIcons,
  ...appIcons,
  ...mascotAssets,
};

// Default export for easier importing
export default images;
