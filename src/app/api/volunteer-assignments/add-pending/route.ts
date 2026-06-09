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

function uniqueRecordIds(ids: string[]) {
  return [...new Set(ids)];
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      assignmentId?: string;
      volunteerId?: string;
    };

    // console.log("ADD PENDING REQUEST", body);

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

    // console.log("ASSIGNMENT BEFORE UPDATE", assignment.fields);

    const currentPendingIds =
      assignment.fields["Pending Volunteers"] ?? [];

    const currentConfirmedIds =
      assignment.fields["Confirmed Volunteers"] ?? [];

    if (currentConfirmedIds.includes(body.volunteerId)) {
      return NextResponse.json(
        { error: "Volunteer is already confirmed for this assignment." },
        { status: 409 }
      );
    }

    if (currentPendingIds.includes(body.volunteerId)) {
      return NextResponse.json(
        { error: "Volunteer is already pending for this assignment." },
        { status: 409 }
      );
    }

    const updated = await updateAirtableRecord<AirtableAssignmentFields>(
      AIRTABLE_TABLES.assignments!,
      body.assignmentId,
      {
        "Pending Volunteers": uniqueRecordIds([
          ...currentPendingIds,
          body.volunteerId,
        ]),
      }
    );

    return NextResponse.json({
      ok: true,
      assignment: updated,
    });
  } catch (error) {
    console.error("ADD PENDING VOLUNTEER ERROR", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to add pending volunteer.";

    return NextResponse.json(
      {
        error: message,
      },
      { status: 500 }
    );
  }
}