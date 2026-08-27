import type { TravelerEmailPolicy } from "@/server/auth/email-policy";
import {
  credentialsLoginRateLimiter,
  getClientIp,
  type LoginRateLimiter,
} from "@/server/auth/login-rate-limit";
import {
  authenticateTraveler,
  type TravelerPasswordHashes,
} from "@/server/auth/passwords";

type CredentialsAuthorizationOptions = {
  passwordHashes: TravelerPasswordHashes;
  emailPolicy: TravelerEmailPolicy;
  limiter?: LoginRateLimiter;
};

export async function authorizeTravelerCredentials(
  credentials: Partial<Record<string, unknown>>,
  request: Request,
  {
    passwordHashes,
    emailPolicy,
    limiter = credentialsLoginRateLimiter,
  }: CredentialsAuthorizationOptions,
) {
  const clientIp = getClientIp(request.headers);

  if (limiter.isBlocked(clientIp)) {
    return null;
  }

  const person = await authenticateTraveler(credentials, passwordHashes);

  if (!person) {
    limiter.recordFailure(clientIp);
    return null;
  }

  limiter.reset(clientIp);
  const email = emailPolicy.emailForPerson(person.id);

  if (!email) {
    return null;
  }

  return {
    id: person.id,
    name: person.displayName,
    email,
  };
}
