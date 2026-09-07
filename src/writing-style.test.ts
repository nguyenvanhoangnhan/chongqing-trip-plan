import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { describe, expect, test } from "vitest";

// Em dash and en dash, written as escapes so this guard does not itself trip.
const FORBIDDEN_DASH = /[\u2013\u2014]/;
const ROOTS = ["src", "data"];
const EXTENSIONS = new Set([".ts", ".tsx", ".json", ".css", ".md"]);

function sourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);

    if (statSync(path).isDirectory()) {
      return sourceFiles(path);
    }

    return EXTENSIONS.has(extname(path)) ? [path] : [];
  });
}

describe("writing style", () => {
  test("keeps em dashes and en dashes out of the source and the catalog", () => {
    const offenders = ROOTS.flatMap(sourceFiles).flatMap((path) =>
      readFileSync(path, "utf8")
        .split("\n")
        .flatMap((line, index) =>
          FORBIDDEN_DASH.test(line)
            ? [`${relative(".", path)}:${index + 1}: ${line.trim()}`]
            : [],
        ),
    );

    expect(offenders).toEqual([]);
  });
});

// The traveler slots are numbered so the public repository never names anyone.
// Only the id literals are checked: a name like "Nhân" also spells ordinary
// Vietnamese words, and guarding on those would fire on the gift catalog.
const RETIRED_SLOT_ID = /"(duy|nhan|minh)"/;

describe("traveler slots", () => {
  test("keeps the retired slot ids out of the source and the catalog", () => {
    const offenders = ROOTS.flatMap(sourceFiles).flatMap((path) =>
      readFileSync(path, "utf8")
        .split("\n")
        .flatMap((line, index) =>
          RETIRED_SLOT_ID.test(line)
            ? [`${relative(".", path)}:${index + 1}: ${line.trim()}`]
            : [],
        ),
    );

    expect(offenders).toEqual([]);
  });
});
