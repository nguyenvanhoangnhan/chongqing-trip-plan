import "server-only";

import { createEmailPolicy } from "@/server/auth/email-policy";

export const travelerEmailPolicy = createEmailPolicy({
  "traveler-1": process.env.AUTH_EMAIL_1,
  "traveler-2": process.env.AUTH_EMAIL_2,
  "traveler-3": process.env.AUTH_EMAIL_3,
});
