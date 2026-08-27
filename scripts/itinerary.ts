/**
 * Read, check and replace the private itinerary document.
 *
 *   node --env-file=.env.local scripts/itinerary.ts pull [file]
 *   node --env-file=.env.local scripts/itinerary.ts validate [file]
 *   node --env-file=.env.local scripts/itinerary.ts push <file>
 *
 * The document itself never enters the repository. `pull` writes to tmp/, which
 * is ignored, and `push` refuses a document the audit rejects.
 */
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { get, put } from "@vercel/blob";

import { auditItinerary } from "./lib/itinerary-audit.ts";

const PATHNAME = process.env.ITINERARY_BLOB_PATHNAME ?? "itinerary/current.json";
const DEFAULT_FILE = "tmp/itinerary.json";

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

async function readBlob(): Promise<unknown> {
  const result = await get(PATHNAME, { access: "private", useCache: false });

  if (!result?.stream) {
    fail(`Không đọc được ${PATHNAME}. Kiểm tra BLOB_READ_WRITE_TOKEN.`);
  }

  return new Response(result.stream).json();
}

function readFile(file: string): unknown {
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch (error) {
    fail(`Không đọc được ${file}: ${(error as Error).message}`);
  }
}

function report(payload: unknown): void {
  const problems = auditItinerary(payload);

  if (problems.length > 0) {
    fail(`${problems.length} vấn đề:\n  ${problems.join("\n  ")}`);
  }

  console.log("Hợp lệ: schema đúng, mọi điểm tuyến trong ngưỡng Baidu.");
}

const [command, file = DEFAULT_FILE] = process.argv.slice(2);

if (command === "pull") {
  const payload = await readBlob();
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`${PATHNAME} -> ${file}`);
  report(payload);
} else if (command === "validate") {
  report(command === "validate" && file ? readFile(file) : await readBlob());
} else if (command === "push") {
  if (file === DEFAULT_FILE && process.argv.length < 4) {
    fail("push cần đường dẫn file: scripts/itinerary.ts push <file>");
  }

  const payload = readFile(file);
  report(payload);
  const result = await put(PATHNAME, `${JSON.stringify(payload, null, 2)}\n`, {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 0,
    contentType: "application/json",
  });
  console.log(`${file} -> ${result.pathname}`);
} else {
  fail("Dùng: scripts/itinerary.ts pull|validate|push [file]");
}
