import { PEOPLE, type Person, type PersonId } from "@/domain/people";

export type TravelerEmails = Partial<
  Record<PersonId, string | null | undefined>
>;

function normalizeEmail(email: string | null | undefined): string | null {
  const normalized = email?.trim().toLowerCase();
  return normalized ? normalized : null;
}

export function createEmailPolicy(emails: TravelerEmails) {
  const normalizedEmails = Object.fromEntries(
    PEOPLE.flatMap((person) => {
      const email = normalizeEmail(emails[person.id]);
      return email ? [[person.id, email]] : [];
    }),
  ) as Partial<Record<PersonId, string>>;

  function emailForPerson(personId: PersonId): string | null {
    return normalizedEmails[personId] ?? null;
  }

  function personFromEmail(
    email: string | null | undefined,
  ): Person | null {
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) {
      return null;
    }

    return (
      PEOPLE.find(
        (person) => normalizedEmails[person.id] === normalizedEmail,
      ) ?? null
    );
  }

  function isAllowedGoogleProfile(profile: {
    email?: string | null;
    email_verified?: boolean | null;
  } | null): boolean {
    return Boolean(
      profile?.email_verified === true && personFromEmail(profile.email),
    );
  }

  return {
    emailForPerson,
    isAllowedGoogleProfile,
    personFromEmail,
  };
}

export type TravelerEmailPolicy = ReturnType<typeof createEmailPolicy>;
