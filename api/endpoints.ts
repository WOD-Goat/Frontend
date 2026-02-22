export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: "/api/users/register",
    LOGIN: "/api/users/login",
    REFRESH_TOKEN: "/api/users/refresh-token",
    LOGOUT: "/api/users/logout",
  },
  WORKOUTS: {
    CREATE: "/api/workouts",
    GET_ALL: "/api/workouts",
    GET_BY_ID: (id: string) => `/api/workouts/${id}`,
    MARK_AS_COMPLETED: (id: string) => `/api/workouts/${id}/complete`,
    UPDATE: (id: string) => `/api/workouts/${id}`,
    DELETE: (id: string) => `/api/workouts/${id}`,
  },
} as const;
