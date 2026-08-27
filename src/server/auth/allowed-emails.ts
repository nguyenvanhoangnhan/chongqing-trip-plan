import "server-only";

import { createEmailPolicy } from "@/server/auth/email-policy";

export const travelerEmailPolicy = createEmailPolicy({
  duy: process.env.AUTH_EMAIL_DUY,
  nhan: process.env.AUTH_EMAIL_NHAN,
  minh: process.env.AUTH_EMAIL_MINH,
});
