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

function removeRecordId(ids: string[], idToRemove: string) {
  return ids.filter((id) => id !== idToRemove);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      assignmentId?: string;
      volunteerId?: string;
      confirmed?: boolean;
    };

    if (!body.assignmentId || !body.volunteerId) {
      return NextResponse.json(
        { error: "Missing assignmentId or volunteerId" },
        { status: 400 }
      );
    }

    if (typeof body.confirmed !== "boolean") {
      return NextResponse.json(
        { error: "Missing confirmed boolean" },
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

    const nextPendingIds = body.confirmed
      ? removeRecordId(currentPendingIds, body.volunteerId)
      : uniqueRecordIds([...currentPendingIds, body.volunteerId]);

    const nextConfirmedIds = body.confirmed
      ? uniqueRecordIds([...currentConfirmedIds, body.volunteerId])
      : removeRecordId(currentConfirmedIds, body.volunteerId);

    const updated = await updateAirtableRecord<AirtableAssignmentFields>(
      AIRTABLE_TABLES.assignments!,
      body.assignmentId,
      {
        "Pending Volunteers": nextPendingIds,
        "Confirmed Volunteers": nextConfirmedIds,
      }
    );

    return NextResponse.json({
      ok: true,
      assignment: updated,
    });
  } catch (error) {
    console.error("TOGGLE CONFIRMED VOLUNTEER ERROR", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to update volunteer confirmation.";

    return NextResponse.json(
      {
        error: message,
      },
      { status: 500 }
    );
  }
}