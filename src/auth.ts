import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

import type { PersonId } from "@/domain/people";
import { travelerEmailPolicy } from "@/server/auth/allowed-emails";
import { authorizeTravelerCredentials } from "@/server/auth/credentials-auth";
import type { TravelerPasswordHashes } from "@/server/auth/passwords";
import { sessionPolicy } from "@/server/auth/session-policy";

const travelerPasswordHashes: TravelerPasswordHashes = {
  duy: process.env.AUTH_PASSWORD_HASH_DUY,
  nhan: process.env.AUTH_PASSWORD_HASH_NHAN,
  minh: process.env.AUTH_PASSWORD_HASH_MINH,
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        personId: { label: "Person", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        return authorizeTravelerCredentials(credentials, request, {
          emailPolicy: travelerEmailPolicy,
          passwordHashes: travelerPasswordHashes,
        });
      },
    }),
    Google({
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: sessionPolicy,
  callbacks: {
    signIn({ account, profile, user }) {
      if (account?.provider === "google") {
        return travelerEmailPolicy.isAllowedGoogleProfile(
          profile as { email?: string | null; email_verified?: boolean | null },
        );
      }

      if (account?.provider === "credentials") {
        return Boolean(travelerEmailPolicy.personFromEmail(user.email));
      }

      return false;
    },
    jwt({ token, user }) {
      const person = travelerEmailPolicy.personFromEmail(
        user?.email ?? token.email,
      );

      if (person) {
        token.personId = person.id;
      }

      return token;
    },
    session({ session, token }) {
      if (token.personId) {
        session.user.personId = token.personId as PersonId;
      }

      return session;
    },
  },
});
