import { ItinerarySchema, parseStopTime } from "../../src/domain/itinerary.ts";

// Baidu drops the whole route and lands on a blank map once an endpoint runs
// past 100 characters, without saying so. buildBaiduDirectionUrl truncates to
// keep the link alive, so the audit reads the names themselves: a name long
// enough to be cut is a name Baidu will not resolve.
const BAIDU_ROUTE_POINT_MAX_LENGTH = 100;

/**
 * Checks the private itinerary for the faults that produce a link which opens
 * but goes nowhere. Returns one line per problem, empty when the data is sound.
 */
export function auditItinerary(payload: unknown): string[] {
  const parsed = ItinerarySchema.safeParse(payload);

  if (!parsed.success) {
    return parsed.error.issues.map(
      (issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`,
    );
  }

  const problems: string[] = [];

  for (const day of parsed.data.days) {
    for (const item of day.items) {
      if (!parseStopTime(item.time)) {
        problems.push(
          `${item.id}: giờ "${item.time}" không đọc được, chặng sẽ không bao giờ được đánh dấu`,
        );
      }

      if (!item.route) {
        continue;
      }

      for (const key of ["origin", "destination"] as const) {
        const length = [...item.route[key].name].length;

        if (length > BAIDU_ROUTE_POINT_MAX_LENGTH) {
          problems.push(
            `${item.id}: ${key} dài ${length} ký tự, Baidu huỷ tuyến khi vượt ${BAIDU_ROUTE_POINT_MAX_LENGTH}`,
          );
        }
      }
    }
  }

  return problems;
}
