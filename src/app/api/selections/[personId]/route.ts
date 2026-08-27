import { BlobPreconditionFailedError } from "@vercel/blob";
import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { PEOPLE, type PersonId } from "@/domain/people";
import { SelectionEntrySchema } from "@/domain/selections";
import {
  BlobSelectionRepository,
  prepareSelectionUpdate,
} from "@/server/selections/service";

const UpdateSelectionRequestSchema = z.object({
  entries: z.array(SelectionEntrySchema).max(100),
  expectedEtag: z.string().min(1).nullable(),
});

function isPersonId(value: string): value is PersonId {
  return PEOPLE.some((person) => person.id === value);
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ personId: string }> },
) {
  const session = await auth();

  if (!session?.user?.personId) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const { personId: requestedPersonId } = await context.params;

  if (!isPersonId(requestedPersonId)) {
    return NextResponse.json({ error: "PERSON_NOT_FOUND" }, { status: 404 });
  }

  if (session.user.personId !== requestedPersonId) {
    return NextResponse.json(
      { error: "FORBIDDEN_SELECTION_UPDATE" },
      { status: 403 },
    );
  }

  try {
    const requestBody = UpdateSelectionRequestSchema.parse(await request.json());
    const selection = prepareSelectionUpdate(
      session.user.personId,
      requestedPersonId,
      requestBody.entries,
    );
    const repository = new BlobSelectionRepository();
    const storedSelection = await repository.write(
      requestedPersonId,
      selection,
      requestBody.expectedEtag,
    );

    return NextResponse.json(storedSelection);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "INVALID_SELECTION", issues: error.issues },
        { status: 400 },
      );
    }

    if (error instanceof BlobPreconditionFailedError) {
      return NextResponse.json(
        { error: "SELECTION_CONFLICT" },
        { status: 409 },
      );
    }

    console.error("Failed to update selection", error);
    return NextResponse.json(
      { error: "SELECTION_STORAGE_UNAVAILABLE" },
      { status: 503 },
    );
  }
}
