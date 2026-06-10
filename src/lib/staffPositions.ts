export const STAFF_POSITION_OPTIONS = [
  "Box Office",
  "FOH Lead",
  "Usher",
  "Merch",
  "Artist Liaison",
  "Production Lead",
  "Lighting",
  "Sound",
  "Stagehand",
  "Runner",
  "Other",
] as const;

export type StaffPosition = (typeof STAFF_POSITION_OPTIONS)[number];