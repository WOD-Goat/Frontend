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
  help: require("./help.png"),
  coach: require("./coach.png"),
  track: require("./track.png"),
  "hands-free": require("./hands-free.png"),
  rest: require("./rest.png"),
  female: require("./female.png"),
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
