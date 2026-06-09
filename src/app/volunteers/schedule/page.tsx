import type { Metadata } from "next";
import { DailyVolunteerSchedule } from "@/components/volunteers/DailyVolunteerSchedule";
// import type { FestivalDay, VolunteerEventShift } from "@/types/volunteers";
import { getVolunteerScheduleData } from "@/lib/airtable/volunteer-schedule";

export const metadata: Metadata = {
  title: "Volunteer Management System",
};

export default async function VolunteerSchedulePage() {
  const { festivalDays, shifts } = await getVolunteerScheduleData();

  return <DailyVolunteerSchedule days={festivalDays} shifts={shifts} />;
}