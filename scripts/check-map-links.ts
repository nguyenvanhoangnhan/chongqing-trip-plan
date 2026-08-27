/**
 * Open every map link the itinerary can produce and report the ones that go
 * nowhere.
 *
 *   npm run itinerary:pull
 *   npm run maps:check
 *
 * Neither Baidu nor Amap returns an error for a request it cannot serve: it
 * redirects to its own home page, so a link that looks fine in the markup can
 * be dead. Two passes run. The first reads a rendered page, which catches a
 * component that stopped emitting links at all. The second builds the links
 * from the itinerary document for both maps, because the page only ever renders
 * the one the traveler picked.
 */
import { existsSync, readFileSync } from "node:fs";

import { ItinerarySchema } from "../src/domain/itinerary.ts";
import {
  classifyMapLink,
  collectMapLinks,
  extractMapLinks,
  type CollectedMapLink,
} from "./lib/map-links.ts";

const DEFAULT_PAGE = "http://localhost:3010/dev-preview/itinerary";
const DEFAULT_FILE = "tmp/itinerary.json";
const [page = DEFAULT_PAGE, file = DEFAULT_FILE] = process.argv.slice(2);

async function fromRenderedPage(): Promise<CollectedMapLink[]> {
  const response = await fetch(page).catch(() => null);

  if (!response?.ok) {
    console.warn(
      `Bỏ qua lượt đọc trang: ${page} không mở được. Chạy npm run dev để kiểm cả phần render.`,
    );
    return [];
  }

  return extractMapLinks(await response.text()).map((href) => ({
    href,
    label: "trang render",
  }));
}

function fromItineraryFile(): CollectedMapLink[] {
  if (!existsSync(file)) {
    console.warn(
      `Bỏ qua lượt dựng từ dữ liệu: không có ${file}. Chạy npm run itinerary:pull trước.`,
    );
    return [];
  }

  return collectMapLinks(
    ItinerarySchema.parse(JSON.parse(readFileSync(file, "utf8"))),
  );
}

const candidates = [...(await fromRenderedPage()), ...fromItineraryFile()];
const links = [...new Map(candidates.map((l) => [l.href, l])).values()];

if (links.length === 0) {
  console.error("Không có link nào để kiểm.");
  process.exit(1);
}

const results = await Promise.all(
  links.map(async ({ href, label }) => {
    const response = await fetch(href, { redirect: "manual" });
    const redirect = response.headers.get("location");
    return { href, label, verdict: classifyMapLink(href, redirect), redirect };
  }),
);

const counted = { routed: 0, dead: 0, unverifiable: 0 };

for (const { href, label, verdict, redirect } of results) {
  counted[verdict] += 1;

  if (verdict === "dead") {
    console.error(
      `CHẾT         ${label}\n             ${href}\n             -> ${redirect ?? "(không redirect)"}`,
    );
  }
}

const unverifiable = results.filter((r) => r.verdict === "unverifiable");

if (unverifiable.length > 0) {
  const hosts = [...new Set(unverifiable.map((r) => new URL(r.href).hostname))];
  console.warn(
    `KHÔNG KIỂM   ${unverifiable.length} link tới ${hosts.join(", ")} vẽ tuyến bằng JavaScript, HTTP không phân biệt được tuyến thật với bản đồ trắng. Phải mở tay trong trình duyệt.`,
  );
}

console.log(
  `\n${links.length} link: ${counted.routed} chạy, ${counted.dead} chết, ${counted.unverifiable} không kiểm được qua HTTP.`,
);

process.exit(counted.dead > 0 ? 1 : 0);
