import type { Metadata } from "next";
import { DailyVolunteerSchedule } from "@/components/volunteers/DailyVolunteerSchedule";
import { getVolunteerScheduleData } from "@/lib/airtable/volunteer-schedule";

export const metadata: Metadata = {
  title: "Volunteer Schedule",
};

export default async function VolunteerSchedulePage() {
  const { festivalDays, shifts } = await getVolunteerScheduleData();

  return (
    <DailyVolunteerSchedule
      days={festivalDays}
      shifts={shifts}
      isAdmin={false}
    />
  );
}