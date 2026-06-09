import { listAirtableRecords } from "@/lib/airtable/client";

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing ${name} in .env.local`);
  }

  return value;
}

const AIRTABLE_EVENTS_TABLE = getRequiredEnv("AIRTABLE_EVENTS_TABLE");

export type AirtableEventFields = {
  Name?: string;
  "Official Title"?: string;
  "Event Start Datetime"?: string;
  "Event End Datetime"?: string;
};

export async function getAirtableEvents() {
  return listAirtableRecords<AirtableEventFields>(AIRTABLE_EVENTS_TABLE, {
    sort: [
      {
        field: "Event Start Datetime",
        direction: "asc",
      },
    ],
  });
}