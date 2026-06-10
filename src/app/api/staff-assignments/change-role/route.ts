import { NextResponse } from "next/server";
import {
  getAirtableRecord,
  updateAirtableRecord,
} from "@/lib/airtable/client";
import { AIRTABLE_TABLES } from "@/lib/airtable/tables";

type LinkedRecordIds = string[];

type AirtableStaffScheduleFields = {
  "FOH Staff"?: LinkedRecordIds;
  "Production Staff"?: LinkedRecordIds;
};

type ChangeStaffRoleBody = {
  staffScheduleId?: string;
  staffId?: string;
  newRole?: "FOH" | "Production";
};

function uniqueRecordIds(recordIds: string[]): string[] {
  return [...new Set(recordIds)];
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ChangeStaffRoleBody;

    if (!body.staffScheduleId || !body.staffId || !body.newRole) {
      return NextResponse.json(
        {
          error: "Missing staffScheduleId, staffId, or newRole.",
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

    const nextFohStaff = currentFohStaff.filter(
      (staffId) => staffId !== body.staffId
    );

    const nextProductionStaff = currentProductionStaff.filter(
      (staffId) => staffId !== body.staffId
    );

    if (body.newRole === "FOH") {
      nextFohStaff.push(body.staffId);
    }

    if (body.newRole === "Production") {
      nextProductionStaff.push(body.staffId);
    }

    const updatedStaffSchedule =
      await updateAirtableRecord<AirtableStaffScheduleFields>(
        AIRTABLE_TABLES.staffSchedule!,
        body.staffScheduleId,
        {
          "FOH Staff": uniqueRecordIds(nextFohStaff),
          "Production Staff": uniqueRecordIds(nextProductionStaff),
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