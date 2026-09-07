/**
 * Read, check and replace the private gift catalog.
 *
 *   node --env-file=.env.local scripts/catalog.ts pull [file]
 *   node --env-file=.env.local scripts/catalog.ts validate [file]
 *   node --env-file=.env.local scripts/catalog.ts push <file>
 *
 * The catalog is trip research: prices, shops and notes gathered by hand. It
 * lives only in Blob, so `pull` writes to the ignored tmp/ and `push` refuses
 * a document the schema rejects.
 */
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { get, put } from "@vercel/blob";

import { GiftCatalogSchema } from "../src/domain/gifts.ts";

const PATHNAME = process.env.CATALOG_BLOB_PATHNAME ?? "catalog/current.json";
const DEFAULT_FILE = "tmp/catalog.json";

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

function report(payload: unknown) {
  const parsed = GiftCatalogSchema.safeParse(payload);

  if (!parsed.success) {
    const lines = parsed.error.issues.map(
      (issue) => `  ${issue.path.join(".") || "(root)"}: ${issue.message}`,
    );
    fail(`${lines.length} vấn đề:\n${lines.join("\n")}`);
  }

  console.log(
    `Hợp lệ: ${parsed.data.gifts.length} món, ${parsed.data.locations.length} điểm mua.`,
  );
  return parsed.data;
}

const [command, file = DEFAULT_FILE] = process.argv.slice(2);

if (command === "pull") {
  const payload = await readBlob();
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`${PATHNAME} -> ${file}`);
  report(payload);
} else if (command === "validate") {
  report(
    process.argv.length >= 4
      ? JSON.parse(readFileSync(file, "utf8"))
      : await readBlob(),
  );
} else if (command === "push") {
  if (process.argv.length < 4) {
    fail("push cần đường dẫn file: scripts/catalog.ts push <file>");
  }

  const payload = report(JSON.parse(readFileSync(file, "utf8")));
  const result = await put(PATHNAME, JSON.stringify(payload), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 300,
    contentType: "application/json",
  });
  console.log(`${file} -> ${result.pathname}`);
} else {
  fail("Dùng: scripts/catalog.ts pull|validate|push [file]");
}
