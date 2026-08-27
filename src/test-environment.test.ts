import { expect, test } from "vitest";

test("provides jsdom localStorage to browser-facing code", () => {
  expect(typeof window.localStorage.setItem).toBe("function");
  expect(typeof globalThis.localStorage.setItem).toBe("function");
  expect(globalThis.localStorage).toBe(window.localStorage);
});
