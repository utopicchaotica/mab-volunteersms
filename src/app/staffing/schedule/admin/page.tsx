import type { Metadata } from "next";
import { DailyVolunteerSchedule } from "@/components/volunteers/DailyVolunteerSchedule";
// import type { FestivalDay, VolunteerEventShift } from "@/types/volunteers";
import { getVolunteerScheduleData } from "@/lib/airtable/volunteer-schedule";

export const metadata: Metadata = {
  title: "MAB 2026 Summer Festival - Staffing",
};

export default async function VolunteerSchedulePage() {
  const { festivalDays, shifts } = await getVolunteerScheduleData();

  return (
    <DailyVolunteerSchedule
      days={festivalDays}
      shifts={shifts}
      isAdmin={true}
    />
  );
}