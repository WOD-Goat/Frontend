export const API_ENDPOINTS = {
  AI: {
    PARSE_WORKOUT: "/api/ai/parse-workout",
    FORMAT_WORKOUT: "/api/ai/format-workout",
  },
  AUTH: {
    REGISTER: "/api/users/register",
    LOGIN: "/api/users/login",
    REFRESH_TOKEN: "/api/users/refresh-token",
    LOGOUT: "/api/users/logout",
    UPDATE_PROFILE: "/api/users/profile",
    DELETE_PROFILE: "/api/users/profile",
    COACH_APPLICATION: "/api/users/coach-application",
  },
  WORKOUTS: {
    CREATE: "/api/workouts",
    GET_ALL: "/api/workouts",
    GET_HISTORY: "/api/workouts/history",
    GET_BY_ID: (id: string) => `/api/workouts/${id}`,
    MARK_AS_COMPLETED: (id: string) => `/api/workouts/${id}/complete`,
    UPDATE: (id: string) => `/api/workouts/${id}`,
    DELETE: (id: string) => `/api/workouts/${id}`,
  },
  PERSONAL_RECORDS: {
    CREATE: "/api/personal-records",
    GET_ALL: "/api/personal-records",
    GET_BY_EXERCISE: (exerciseId: string) =>
      `/api/personal-records/${exerciseId}`,
    UPDATE: (id: string) => `/api/personal-records/${id}`,
    DELETE: (id: string) => `/api/personal-records/${id}`,
  },

  NOTIFICATIONS: {
    REGISTER_TOKEN: "/api/notifications/token",
    DELETE_TOKEN: "/api/notifications/token",
  },
  GROUPS: {
    CREATE: "/api/groups",
    GET_MY_GROUPS: "/api/groups/my-groups",
    GET_MEMBER_GROUPS: "/api/groups/member-groups",
    GET_BY_ID: (id: string) => `/api/groups/${id}`,
    JOIN: "/api/groups/join",
    GENERATE_CODE: (id: string) => `/api/groups/${id}/generate-code`,
    GET_WORKOUTS: (id: string) => `/api/groups/${id}/workouts`,
    GET_WORKOUT_HISTORY: (id: string) => `/api/groups/${id}/workouts/history`,
    CREATE_WORKOUT: (id: string) => `/api/groups/${id}/workouts`,
    GET_WORKOUT: (groupId: string, workoutId: string) =>
      `/api/groups/${groupId}/workouts/${workoutId}`,
    SUBMIT_WORKOUT: (groupId: string, workoutId: string) =>
      `/api/groups/${groupId}/workouts/${workoutId}/submit`,
    LEADERBOARD: (groupId: string, workoutId: string) =>
      `/api/groups/${groupId}/workouts/${workoutId}/leaderboard`,
    UPDATE_WORKOUT: (groupId: string, workoutId: string) =>
      `/api/groups/${groupId}/workouts/${workoutId}`,
    DELETE_WORKOUT: (groupId: string, workoutId: string) =>
      `/api/groups/${groupId}/workouts/${workoutId}`,
    REMOVE_MEMBER: (groupId: string, userId: string) =>
      `/api/groups/${groupId}/members/${userId}`,
    GET_MEMBER_DETAIL: (groupId: string, userId: string) =>
      `/api/groups/${groupId}/members/${userId}`,
    SET_MEMBER_SUBSCRIPTION: (groupId: string, userId: string) =>
      `/api/groups/${groupId}/members/${userId}/subscription`,
    GET_MEMBER_SUBSCRIPTION: (groupId: string, userId: string) =>
      `/api/groups/${groupId}/members/${userId}/subscription`,
  },
  APP: {
    VERSION: '/api/app/version',
  },
} as const;
