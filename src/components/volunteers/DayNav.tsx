"use client";

import type { FestivalDay } from "@/types/volunteers";

type DayNavProps = {
  days: FestivalDay[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
};

const WEEK_1_START = "2026-07-04";
const WEEK_1_END = "2026-07-10";
const WEEK_2_START = "2026-07-11";
const WEEK_2_END = "2026-07-17";

export function DayNav({ days, selectedDate, onSelectDate }: DayNavProps) {
  const weekOneDays = days.filter((day) => {
    return day.date >= WEEK_1_START && day.date <= WEEK_1_END;
  });

  const weekTwoDays = days.filter((day) => {
    return day.date >= WEEK_2_START && day.date <= WEEK_2_END;
  });

  return (
    <nav
      aria-label="Festival days"
      className="mt-5 flex justify-center overflow-x-auto pb-2"
    >
      <div className="flex flex-col gap-2 rounded-2xl border border-neutral-800 bg-neutral-900 p-2">
        <DayNavRow
          days={weekOneDays}
          selectedDate={selectedDate}
          onSelectDate={onSelectDate}
        />

        <DayNavRow
          days={weekTwoDays}
          selectedDate={selectedDate}
          onSelectDate={onSelectDate}
        />
      </div>
    </nav>
  );
}

type DayNavRowProps = {
  days: FestivalDay[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
};

function DayNavRow({ days, selectedDate, onSelectDate }: DayNavRowProps) {
  if (days.length === 0) {
    return null;
  }

  return (
    <div className="flex justify-center gap-2">
      {days.map((day) => {
        const isSelected = day.date === selectedDate;

        return (
          <button
            key={day.id}
            type="button"
            onClick={() => onSelectDate(day.date)}
            className={[
              "rounded-xl px-4 py-2 text-sm font-medium transition",
              isSelected
                ? "bg-neutral-100 text-neutral-950"
                : "text-neutral-300 hover:bg-neutral-800 hover:text-neutral-50",
            ].join(" ")}
          >
            {day.shortLabel}
          </button>
        );
      })}
    </div>
  );
}