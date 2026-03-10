export const API_ENDPOINTS = {
  AI: {
    PARSE_WORKOUT: "/api/ai/parse-workout",
  },
  AUTH: {
    REGISTER: "/api/users/register",
    LOGIN: "/api/users/login",
    REFRESH_TOKEN: "/api/users/refresh-token",
    LOGOUT: "/api/users/logout",
    UPDATE_PROFILE: "/api/users/profile",
    DELETE_PROFILE: "/api/users/profile",
  },
  WORKOUTS: {
    CREATE: "/api/workouts",
    GET_ALL: "/api/workouts",
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
} as const;
