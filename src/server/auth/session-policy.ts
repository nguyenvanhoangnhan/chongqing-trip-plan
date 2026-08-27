/**
 * Travelers stay signed in for two weeks of inactivity. @auth/core refreshes an
 * active session once a day, so the clock restarts on each visit and only a
 * fortnight away actually signs someone out.
 */
export const SESSION_MAX_AGE_SECONDS = 14 * 24 * 60 * 60;

export const sessionPolicy = {
  strategy: "jwt",
  maxAge: SESSION_MAX_AGE_SECONDS,
} as const;
