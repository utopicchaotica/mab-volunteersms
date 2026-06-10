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

type RemoveStaffBody = {
  staffScheduleId?: string;
  staffId?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RemoveStaffBody;

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

    const staffSchedule =
      await getAirtableRecord<AirtableStaffScheduleFields>(
        AIRTABLE_TABLES.staffSchedule!,
        body.staffScheduleId
      );

    const currentFohStaff = staffSchedule.fields["FOH Staff"] ?? [];
    const currentProductionStaff =
      staffSchedule.fields["Production Staff"] ?? [];

    const updatedStaffSchedule =
      await updateAirtableRecord<AirtableStaffScheduleFields>(
        AIRTABLE_TABLES.staffSchedule!,
        body.staffScheduleId,
        {
          "FOH Staff": currentFohStaff.filter(
            (staffId) => staffId !== body.staffId
          ),
          "Production Staff": currentProductionStaff.filter(
            (staffId) => staffId !== body.staffId
          ),
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