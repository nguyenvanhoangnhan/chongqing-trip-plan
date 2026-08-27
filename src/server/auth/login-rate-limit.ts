const MAX_TRACKED_IPS = 10_000;

type AttemptWindow = {
  failures: number;
  startedAt: number;
};

type LoginRateLimiterOptions = {
  maxFailures: number;
  windowMs: number;
  now?: () => number;
};

export class LoginRateLimiter {
  private readonly attempts = new Map<string, AttemptWindow>();
  private readonly maxFailures: number;
  private readonly windowMs: number;
  private readonly now: () => number;

  constructor({ maxFailures, windowMs, now = Date.now }: LoginRateLimiterOptions) {
    this.maxFailures = maxFailures;
    this.windowMs = windowMs;
    this.now = now;
  }

  isBlocked(ip: string): boolean {
    const attemptWindow = this.currentWindow(ip, this.now());
    return Boolean(attemptWindow && attemptWindow.failures >= this.maxFailures);
  }

  recordFailure(ip: string): void {
    const now = this.now();
    const attemptWindow = this.currentWindow(ip, now);

    if (attemptWindow) {
      attemptWindow.failures += 1;
      return;
    }

    this.pruneIfFull(now);
    this.attempts.set(ip, { failures: 1, startedAt: now });
  }

  reset(ip: string): void {
    this.attempts.delete(ip);
  }

  private currentWindow(ip: string, now: number): AttemptWindow | null {
    const attemptWindow = this.attempts.get(ip);

    if (!attemptWindow) {
      return null;
    }

    if (now - attemptWindow.startedAt >= this.windowMs) {
      this.attempts.delete(ip);
      return null;
    }

    return attemptWindow;
  }

  private pruneIfFull(now: number): void {
    if (this.attempts.size < MAX_TRACKED_IPS) {
      return;
    }

    for (const [ip, attemptWindow] of this.attempts) {
      if (now - attemptWindow.startedAt >= this.windowMs) {
        this.attempts.delete(ip);
      }
    }

    if (this.attempts.size >= MAX_TRACKED_IPS) {
      const oldestIp = this.attempts.keys().next().value;
      if (oldestIp) {
        this.attempts.delete(oldestIp);
      }
    }
  }
}

function usableIp(value: string | null): string | null {
  const ip = value?.trim();
  return ip && ip.length <= 128 ? ip : null;
}

export function getClientIp(headers: Headers): string {
  const vercelForwardedIp = usableIp(
    headers.get("x-vercel-forwarded-for")?.split(",", 1)[0] ?? null,
  );
  const forwardedIp = usableIp(
    headers.get("x-forwarded-for")?.split(",", 1)[0] ?? null,
  );
  return (
    vercelForwardedIp ??
    forwardedIp ??
    usableIp(headers.get("x-real-ip")) ??
    "unknown"
  );
}

export const credentialsLoginRateLimiter = new LoginRateLimiter({
  maxFailures: 10,
  windowMs: 15 * 60 * 1_000,
});
