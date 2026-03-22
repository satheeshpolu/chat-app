export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

export const AUTH_TOKEN = "super-secret-doodle-token";
export const POLL_INTERVAL_MS = 5000;
export const MAX_MESSAGE_LENGTH = 1000;
export const MESSAGES_PER_PAGE = 50;
export const QUERY_RETRY_COUNT = 1;
export const QUERY_STALE_TIME_MS = 0;
export const QUERY_GC_TIME_MS = 1000 * 60 * 5; // 5 minutes
