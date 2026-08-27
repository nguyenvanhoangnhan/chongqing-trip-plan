import { scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

import { PEOPLE, type Person, type PersonId } from "@/domain/people";

const deriveKey = promisify(scrypt);

export type TravelerPasswordHashes = Partial<Record<PersonId, string>>;

export async function verifyPassword(
  password: string,
  encodedHash: string,
): Promise<boolean> {
  if (password.length === 0 || password.length > 128) {
    return false;
  }

  const [algorithm, encodedSalt, encodedKey] = encodedHash.split("$");

  if (algorithm !== "scrypt" || !encodedSalt || !encodedKey) {
    return false;
  }

  const salt = Buffer.from(encodedSalt, "base64url");
  const expectedKey = Buffer.from(encodedKey, "base64url");

  if (salt.length < 8 || expectedKey.length !== 32) {
    return false;
  }

  const actualKey = (await deriveKey(password, salt, 32)) as Buffer;

  return timingSafeEqual(actualKey, expectedKey);
}

export async function authenticateTraveler(
  credentials: Partial<Record<string, unknown>>,
  passwordHashes: TravelerPasswordHashes,
): Promise<Person | null> {
  const { personId, password } = credentials;

  if (typeof personId !== "string" || typeof password !== "string") {
    return null;
  }

  const person = PEOPLE.find((candidate) => candidate.id === personId);
  if (!person) {
    return null;
  }

  const passwordHash = passwordHashes[person.id];
  if (!passwordHash || !(await verifyPassword(password, passwordHash))) {
    return null;
  }

  return person;
}
