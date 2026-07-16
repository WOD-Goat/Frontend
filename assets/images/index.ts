// Tab Icons
export const tabIcons = {
  workout: require("./workout.png"),
  workoutSelected: require("./workout-selected.png"),
  pr: require("./pr.png"),
  prSelected: require("./pr-selected.png"),
  profile: require("./profile.png"),
  profileSelected: require("./profile-selected.png"),
  timer: require("./timer.png"),
  timerSelected: require("./timer-selected.png"),
  groups: require("./group.png"),
  groupsSelected: require("./group-selected.png"),
};

// App Icons
export const appIcons = {
  logo: require("./logo.png"),
};

export const mascotAssets = {
  premium: require("./premium.png"),
  standard: require("./standard.png"),
  coach: require("./coach.png"),
  community: require("./community.png"),
  egypt: require("./egypt.png"),
};

export const icons = {
  "active-streak": require("./active-streak.png"),
  "inactive-streak": require("./inactive-streak.png"),
  dumbell: require("./dumbell.png"),
  star: require("./star.png"),
  trophy: require("./trophy.png"),
  groups: require("./group.png"),
  groupsSelected: require("./group-selected.png"),
  add: require("./add.png"),
};

// Export all images as a single object for convenience
export const images = {
  ...tabIcons,
  ...appIcons,
  ...mascotAssets,
  ...icons,
};

// Default export for easier importing
export default images;
