export type PersonId = "duy" | "nhan" | "minh";

export type Person = {
  id: PersonId;
  displayName: string;
  accent: "chili" | "river" | "gold";
};

export const PEOPLE = [
  {
    id: "duy",
    displayName: "Duy",
    accent: "chili",
  },
  {
    id: "nhan",
    displayName: "Nhân",
    accent: "river",
  },
  {
    id: "minh",
    displayName: "Minh",
    accent: "gold",
  },
] as const satisfies readonly Person[];
