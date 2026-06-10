import { NextResponse } from "next/server";
import {
  getAirtableRecord,
  updateAirtableRecord,
} from "@/lib/airtable/client";
import { AIRTABLE_TABLES } from "@/lib/airtable/tables";
import type { StaffRole } from "@/types/volunteers";

type LinkedRecordIds = string[];

type AirtableStaffScheduleFields = {
  "FOH Staff"?: LinkedRecordIds;
  "Production Staff"?: LinkedRecordIds;
  staffPositionJSON?: string;
};

type AddStaffBody = {
  staffScheduleId?: string;
  staffId?: string;
  role?: StaffRole;
  position?: string;
};

function uniqueRecordIds(recordIds: string[]): string[] {
  return [...new Set(recordIds)];
}

function parseStaffPositionJSON(value?: string): Record<string, string> {
  if (!value?.trim()) {
    return {};
  }

  try {
    const parsed: unknown = JSON.parse(value);

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }

    const staffPositions: Record<string, string> = {};

    for (const [staffId, position] of Object.entries(parsed)) {
      if (typeof position === "string") {
        staffPositions[staffId] = position;
      }
    }

    return staffPositions;
  } catch {
    return {};
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AddStaffBody;

    if (!body.staffScheduleId || !body.staffId || !body.role) {
      return NextResponse.json(
        {
          error: "Missing staffScheduleId, staffId, or role.",
        },
        {
          status: 400,
        }
      );
    }

    const staffSchedule =
      await getAirtableRecord<AirtableStaffScheduleFields>(
        AIRTABLE_TABLES.staffSchedule!,
        body.staffScheduleId
      );

    const currentFohStaff = staffSchedule.fields["FOH Staff"] ?? [];
    const currentProductionStaff =
      staffSchedule.fields["Production Staff"] ?? [];

    const isAlreadyAssigned =
      currentFohStaff.includes(body.staffId) ||
      currentProductionStaff.includes(body.staffId);

    if (isAlreadyAssigned) {
      return NextResponse.json(
        {
          error: "This staff member is already assigned to this event.",
        },
        {
          status: 409,
        }
      );
    }

    const nextFohStaff = [...currentFohStaff];
    const nextProductionStaff = [...currentProductionStaff];

    if (body.role === "FOH") {
      nextFohStaff.push(body.staffId);
    }

    if (body.role === "Production") {
      nextProductionStaff.push(body.staffId);
    }

    const staffPositions = parseStaffPositionJSON(
      staffSchedule.fields.staffPositionJSON
    );
    if (body.position) {
      staffPositions[body.staffId] = body.position;
    } else {
      delete staffPositions[body.staffId];
    }

    const updatedStaffSchedule =
      await updateAirtableRecord<AirtableStaffScheduleFields>(
        AIRTABLE_TABLES.staffSchedule!,
        body.staffScheduleId,
        {
          "FOH Staff": uniqueRecordIds(nextFohStaff),
          "Production Staff": uniqueRecordIds(nextProductionStaff),
          staffPositionJSON: JSON.stringify(staffPositions, null, 2),
        }
      );

    return NextResponse.json({
      ok: true,
      staffSchedule: updatedStaffSchedule,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred.";

    return NextResponse.json(
      {
        error: message,
      },
      {
        status: 500,
      }
    );
  }
}