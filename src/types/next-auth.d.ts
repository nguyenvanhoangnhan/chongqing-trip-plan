import type { DefaultSession } from "next-auth";

import type { PersonId } from "@/domain/people";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      personId: PersonId;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    personId?: PersonId;
  }
}
