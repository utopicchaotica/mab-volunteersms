import { listAirtableRecords } from "@/lib/airtable/client";

const EVENTS_TABLE = process.env.AIRTABLE_EVENTS_TABLE;

if (!EVENTS_TABLE) {
  throw new Error("Missing AIRTABLE_EVENTS_TABLE in .env.local");
}

export type AirtableEventFields = {
  "Name"?: string;
  "Official Title"?: string;
  "Event Start Datetime"?: string;
  "Event End Datetime"?: string;
};

export async function getAirtableEvents() {
  return listAirtableRecords<AirtableEventFields>(EVENTS_TABLE, {
    sort: [
      {
        field: "Event Start Datetime",
        direction: "asc",
      },
    ],
  });
}