import { describe, expect, it } from "vitest";

import { toStrongEtag } from "@/server/blob/etag";

describe("toStrongEtag", () => {
  it("strips the weak marker a compressed download carries", () => {
    expect(toStrongEtag('W/"abc"')).toBe('"abc"');
  });

  it("leaves a strong etag alone", () => {
    expect(toStrongEtag('"abc"')).toBe('"abc"');
  });
});
