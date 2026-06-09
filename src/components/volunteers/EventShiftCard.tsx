"use client";

import { useState } from "react";
import { AddVolunteerDialog } from "@/components/volunteers/AddVolunteerDialog";
import { VolunteerTable } from "@/components/volunteers/VolunteerTable";
import type { VolunteerEventShift } from "@/types/volunteers";

type EventShiftCardProps = {
  shift: VolunteerEventShift;
};

export function EventShiftCard({ shift }: EventShiftCardProps) {
  const [isAddVolunteerOpen, setIsAddVolunteerOpen] = useState(false);

  return (
    <article className="min-w-[560px] max-w-[680px] rounded-2xl border border-neutral-800 bg-neutral-900 p-4 shadow-lg">
      <header className="mb-4 border-b border-neutral-800 pb-3 text-center">
        <h3 className="text-base font-semibold text-neutral-50">
          Arrival time: {shift.arrivalDate} | {shift.shiftStartTime} -{" "}
          {shift.shiftEndTime}
        </h3>

        <p className="mt-1 text-sm font-semibold text-neutral-400">{shift.venueName}</p>
      </header>

      <section className="mb-4 text-sm text-center font-semibold">
        <p className="text-neutral-100">{shift.eventName}</p>

        {shift.concertStartTime && (
          <p className="mt-1 text-neutral-400">
            Concert time: {shift.concertStartTime}
          </p>
        )}
      </section>

      <VolunteerTable
        volunteers={shift.volunteers}
        roleAssignments={shift.roleAssignments}
        onAddVolunteer={() => setIsAddVolunteerOpen(true)}
        interactiveOptions={{
          usePointerCursor: true,
        }}
      />

      {shift.shiftNotes && (
        <section className="mt-4 rounded-xl bg-neutral-950 p-3 text-sm text-neutral-300">
          <p className="mb-1 font-medium text-neutral-400">Shift notes</p>
          <p>{shift.shiftNotes}</p>
        </section>
      )}

      <AddVolunteerDialog
        isOpen={isAddVolunteerOpen}
        onClose={() => setIsAddVolunteerOpen(false)}
        shiftLabel={`${shift.eventName} • ${shift.shiftStartTime} - ${shift.shiftEndTime}`}
        availableVolunteers={shift.availableVolunteers}
        roleAssignments={shift.roleAssignments}
      />
    </article>
  );
}