import type { PersonId } from "@/domain/people";
import type { PersonSelection, SelectionEntry } from "@/domain/selections";
import type { StoredSelection } from "@/server/selections/service";

type SelectionListResponse = {
  items: StoredSelection[];
};

export class SelectionApiError extends Error {
  constructor(
    public readonly code: string,
    public readonly status: number,
  ) {
    super(code);
  }
}

async function parseError(response: Response): Promise<SelectionApiError> {
  const body = (await response.json().catch(() => null)) as {
    error?: string;
  } | null;

  return new SelectionApiError(
    body?.error ?? "UNKNOWN_SELECTION_ERROR",
    response.status,
  );
}

export async function loadSelections(): Promise<StoredSelection[]> {
  const response = await fetch("/api/selections", {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw await parseError(response);
  }

  const body = (await response.json()) as SelectionListResponse;
  return body.items;
}

export async function saveSelection(
  personId: PersonId,
  entries: readonly SelectionEntry[],
  expectedEtag: string | null,
): Promise<{ selection: PersonSelection; etag: string | null }> {
  const response = await fetch(`/api/selections/${personId}`, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ entries, expectedEtag }),
  });

  if (!response.ok) {
    throw await parseError(response);
  }

  return response.json() as Promise<{
    selection: PersonSelection;
    etag: string | null;
  }>;
}
