import { NextResponse } from "next/server";
import {
  getAirtableRecord,
  updateAirtableRecord,
} from "@/lib/airtable/client";
import { AIRTABLE_TABLES } from "@/lib/airtable/tables";
import { STAFF_POSITION_OPTIONS } from "@/lib/staffPositions";

type AirtableStaffScheduleFields = {
  staffPositionJSON?: string;
};

type ChangeStaffPositionBody = {
  staffScheduleId?: string;
  staffId?: string;
  position?: string;
};

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

function isAllowedStaffPosition(position: string): boolean {
  if (position === "") {
    return true;
  }

  return STAFF_POSITION_OPTIONS.some((option) => option === position);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ChangeStaffPositionBody;

    if (!body.staffScheduleId || !body.staffId) {
      return NextResponse.json(
        {
          error: "Missing staffScheduleId or staffId.",
        },
        {
          status: 400,
        }
      );
    }

    const nextPosition = body.position ?? "";

    if (!isAllowedStaffPosition(nextPosition)) {
      return NextResponse.json(
        {
          error: "Invalid staff position.",
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

    const staffPositions = parseStaffPositionJSON(
      staffSchedule.fields.staffPositionJSON
    );

    if (nextPosition) {
      staffPositions[body.staffId] = nextPosition;
    } else {
      delete staffPositions[body.staffId];
    }

    const updatedStaffSchedule =
      await updateAirtableRecord<AirtableStaffScheduleFields>(
        AIRTABLE_TABLES.staffSchedule!,
        body.staffScheduleId,
        {
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