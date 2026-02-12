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

// Service Icons
export const serviceIcons = {
  crossfit: require("./crossfit.png"),
  gym: require("./gym.png"),
  performance: require("./performance.png"),
  mobility: require("./mobility.png"),
  fitmax: require("./fitmax.png"),
};

// App Icons
export const appIcons = {
  logo: require("./logo.png"),
};

export const banners = {
  banner: require("./banner.png"),
};

// Export all images as a single object for convenience
export const images = {
  ...tabIcons,
  ...appIcons,
};

// Default export for easier importing
export default images;
