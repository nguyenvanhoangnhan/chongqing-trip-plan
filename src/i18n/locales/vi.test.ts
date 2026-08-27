import { describe, expect, it } from "vitest";

import { vi as messages } from "@/i18n/locales/vi";

describe("public Vietnamese copy", () => {
  it("uses a generic city reference instead of lodging details", () => {
    expect(messages.login.location).toBe("Trùng Khánh · 重庆");
    expect(messages.header.location).toBe("Trùng Khánh · 重庆");
    expect(JSON.stringify(messages)).not.toMatch(/khách sạn|nơi ở|lưu trú/i);
  });
});
