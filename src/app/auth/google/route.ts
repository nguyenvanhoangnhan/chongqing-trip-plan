import { signIn } from "@/auth";

const REGISTERED_PRODUCTION_HOST = "chongqing-gift-planner.vercel.app";
const REGISTERED_PRODUCTION_ORIGIN =
  `https://${REGISTERED_PRODUCTION_HOST}`;

export async function GET(request: Request): Promise<Response> {
  const requestUrl = new URL(request.url);
  const needsRegisteredOrigin =
    requestUrl.hostname.endsWith(".vercel.app") &&
    requestUrl.hostname !== REGISTERED_PRODUCTION_HOST;

  if (needsRegisteredOrigin) {
    return Response.redirect(
      `${REGISTERED_PRODUCTION_ORIGIN}/auth/google`,
      307,
    );
  }

  await signIn("google", { redirectTo: "/" });

  return new Response(null, { status: 204 });
}
