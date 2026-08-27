import { describe, expect, test } from "vitest";

import { isMobileUserAgent } from "./user-agent";

const IPHONE =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";
const IPAD =
  "Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";
const ANDROID =
  "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36";
const MAC =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const WINDOWS =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

describe("isMobileUserAgent", () => {
  test("knows the phones that can hand a link to a map app", () => {
    expect(isMobileUserAgent(IPHONE)).toBe(true);
    expect(isMobileUserAgent(ANDROID)).toBe(true);
    expect(isMobileUserAgent(IPAD)).toBe(true);
  });

  test("treats a laptop as a browser, not an app", () => {
    expect(isMobileUserAgent(MAC)).toBe(false);
    expect(isMobileUserAgent(WINDOWS)).toBe(false);
  });

  test("is not fooled by the Mac OS X inside an iPhone string", () => {
    // The iPhone user agent contains "Mac OS X", so matching on that alone
    // would send every phone down the desktop path.
    expect(IPHONE).toContain("Mac OS X");
    expect(isMobileUserAgent(IPHONE)).toBe(true);
  });

  test("falls back to the browser when the header is missing", () => {
    expect(isMobileUserAgent(null)).toBe(false);
    expect(isMobileUserAgent(undefined)).toBe(false);
    expect(isMobileUserAgent("")).toBe(false);
  });
});
