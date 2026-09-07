export const PERSON_IDS = ["traveler-1", "traveler-2", "traveler-3"] as const;

export type PersonId = (typeof PERSON_IDS)[number];

/**
 * Whether a value is a slot this build knows. A session cookie issued before
 * the slots were numbered still carries the old id, and taking that on trust
 * bounces the traveler between the itinerary and the login page.
 */
export function isPersonId(value: unknown): value is PersonId {
  return (
    typeof value === "string" &&
    (PERSON_IDS as readonly string[]).includes(value)
  );
}

export type Person = {
  id: PersonId;
  displayName: string;
  accent: "chili" | "river" | "gold";
};

// The repository is public, so who travels is configuration rather than source.
// Next.js inlines these at build time, which needs the literal member access.
function configuredName(id: PersonId): string | undefined {
  switch (id) {
    case "traveler-1":
      return process.env.NEXT_PUBLIC_TRAVELER_NAME_1;
    case "traveler-2":
      return process.env.NEXT_PUBLIC_TRAVELER_NAME_2;
    case "traveler-3":
      return process.env.NEXT_PUBLIC_TRAVELER_NAME_3;
  }
}

/**
 * The configured name of a traveler, or the slot itself when nothing is set, so
 * a fresh checkout runs without anyone's name in it.
 */
export function resolveDisplayName(id: PersonId): string {
  const configured = configuredName(id)?.trim();

  return configured ? configured : `Traveler ${id.slice("traveler-".length)}`;
}

const ACCENTS: Record<PersonId, Person["accent"]> = {
  "traveler-1": "chili",
  "traveler-2": "river",
  "traveler-3": "gold",
};

export const PEOPLE: readonly Person[] = PERSON_IDS.map((id) => ({
  id,
  displayName: resolveDisplayName(id),
  accent: ACCENTS[id],
}));
