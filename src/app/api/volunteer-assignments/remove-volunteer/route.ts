import { NextResponse } from "next/server";
import {
  getAirtableRecord,
  updateAirtableRecord,
} from "@/lib/airtable/client";
import { AIRTABLE_TABLES } from "@/lib/airtable/tables";

type LinkedRecordIds = string[];

type AirtableAssignmentFields = {
  "Pending Volunteers"?: LinkedRecordIds;
  "Confirmed Volunteers"?: LinkedRecordIds;
};

function removeRecordId(ids: string[], idToRemove: string) {
  return ids.filter((id) => id !== idToRemove);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      assignmentId?: string;
      volunteerId?: string;
    };

    if (!body.assignmentId || !body.volunteerId) {
      return NextResponse.json(
        { error: "Missing assignmentId or volunteerId" },
        { status: 400 }
      );
    }

    const assignment = await getAirtableRecord<AirtableAssignmentFields>(
      AIRTABLE_TABLES.assignments!,
      body.assignmentId
    );

    const currentPendingIds = assignment.fields["Pending Volunteers"] ?? [];
    const currentConfirmedIds =
      assignment.fields["Confirmed Volunteers"] ?? [];

    const updated = await updateAirtableRecord<AirtableAssignmentFields>(
      AIRTABLE_TABLES.assignments!,
      body.assignmentId,
      {
        "Pending Volunteers": removeRecordId(
          currentPendingIds,
          body.volunteerId
        ),
        "Confirmed Volunteers": removeRecordId(
          currentConfirmedIds,
          body.volunteerId
        ),
      }
    );

    return NextResponse.json({
      ok: true,
      assignment: updated,
    });
  } catch (error) {
    console.error("REMOVE VOLUNTEER ERROR", error);

    const message =
      error instanceof Error ? error.message : "Failed to remove volunteer.";

    return NextResponse.json(
      {
        error: message,
      },
      { status: 500 }
    );
  }
}