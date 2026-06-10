export const AIRTABLE_TABLES = {
  events: process.env.AIRTABLE_EVENTS_TABLE,
  shifts: process.env.AIRTABLE_SHIFTS_TABLE,
  assignments: process.env.AIRTABLE_ASSIGNMENTS_TABLE,
  volunteers: process.env.AIRTABLE_VOLUNTEERS_TABLE,
  staff: process.env.AIRTABLE_STAFF_TABLE,
  staffSchedule: process.env.AIRTABLE_STAFF_SCHEDULE_TABLE,
};

for (const [key, value] of Object.entries(AIRTABLE_TABLES)) {
  if (!value) {
    throw new Error(`Missing Airtable table env var for ${key}`);
  }
}