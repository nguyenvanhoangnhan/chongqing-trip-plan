import { auth } from "@/auth";
import type { PersonId } from "@/domain/people";
import {
  BlobGiftImageRepository,
  createGiftImageResponse,
} from "@/server/gift-images/service";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ filename: string }> },
) {
  const session = await auth();
  const { filename } = await context.params;
  const developmentPreviewPersonId: PersonId | null =
    process.env.NODE_ENV === "development" ? "traveler-2" : null;

  return createGiftImageResponse({
    authenticatedPersonId:
      session?.user?.personId ?? developmentPreviewPersonId,
    filename,
    repository: new BlobGiftImageRepository(),
  });
}
