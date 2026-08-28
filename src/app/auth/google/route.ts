import { signIn } from "@/auth";

/**
 * Starts Google sign-in on the origin the traveler is already on, so the
 * session lands on that same domain. Every production domain must be listed
 * as an authorized redirect URI on the Google OAuth client:
 *   https://<domain>/api/auth/callback/google
 */
export async function GET(): Promise<Response> {
  await signIn("google", { redirectTo: "/" });

  return new Response(null, { status: 204 });
}
