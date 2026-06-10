"use client";

import { useMemo, useState } from "react";
import { DayNav } from "@/components/volunteers/DayNav";
import { EventShiftCard } from "@/components/volunteers/EventShiftCard";
import type { FestivalDay, VolunteerEventShift } from "@/types/volunteers";

type DailyVolunteerScheduleProps = {
  days: FestivalDay[];
  shifts: VolunteerEventShift[];
  isAdmin?: boolean;
};

export function DailyVolunteerSchedule({
  days,
  shifts,
  isAdmin = false,
}: DailyVolunteerScheduleProps) {
  const [selectedDate, setSelectedDate] = useState(days[0]?.date ?? "");

  const selectedDay = useMemo(() => {
    return days.find((day) => day.date === selectedDate) ?? days[0];
  }, [days, selectedDate]);

  const selectedDayShifts = useMemo(() => {
    return shifts.filter((shift) => shift.date === selectedDate);
  }, [shifts, selectedDate]);

  const afternoonShifts = selectedDayShifts.filter(
    (shift) => shift.timeBlock === "afternoon"
  );

  const eveningShifts = selectedDayShifts.filter(
    (shift) => shift.timeBlock === "evening"
  );

  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-8 text-neutral-100">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">
          {selectedDay?.dateLabel ?? "Festival Schedule"}{" "}
          {selectedDay && (
            <span className="text-neutral-400">
              (Day {selectedDay.dayNumber})
            </span>
          )}
        </h1>

        <p className="mt-2 text-sm text-neutral-400">
          {selectedDayShifts.length} total events
        </p>

        <DayNav
          days={days}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />
      </header>

      <ScheduleRow
        title="Afternoon Events"
        shifts={afternoonShifts}
        isAdmin={isAdmin}
      />

      <ScheduleRow
        title="Evening Events"
        shifts={eveningShifts}
        isAdmin={isAdmin}
      />
    </main>
  );
}

type ScheduleRowProps = {
  title: string;
  shifts: VolunteerEventShift[];
  isAdmin: boolean;
};

function ScheduleRow({ title, shifts, isAdmin }: ScheduleRowProps) {
  return (
    <section className="mb-10">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-400">
        {title}
      </h2>

      {shifts.length > 0 ? (
        <div className="flex gap-4 overflow-x-auto pb-3">
          {shifts.map((shift) => (
            <EventShiftCard
              key={shift.id}
              shift={shift}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-neutral-800 bg-neutral-900 p-6 text-sm text-neutral-500">
          No {title.toLowerCase()} scheduled for this day.
        </div>
      )}
    </section>
  );
}