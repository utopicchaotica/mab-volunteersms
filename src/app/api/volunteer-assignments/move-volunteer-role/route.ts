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
      oldAssignmentId?: string;
      newAssignmentId?: string;
      volunteerId?: string;
      confirmed?: boolean;
    };

    if (!body.oldAssignmentId || !body.newAssignmentId || !body.volunteerId) {
      return NextResponse.json(
        { error: "Missing oldAssignmentId, newAssignmentId, or volunteerId" },
        { status: 400 }
      );
    }

    if (typeof body.confirmed !== "boolean") {
      return NextResponse.json(
        { error: "Missing confirmed boolean" },
        { status: 400 }
      );
    }

    if (body.oldAssignmentId === body.newAssignmentId) {
      return NextResponse.json({ ok: true });
    }

    const [oldAssignment, newAssignment] = await Promise.all([
      getAirtableRecord<AirtableAssignmentFields>(
        AIRTABLE_TABLES.assignments!,
        body.oldAssignmentId
      ),
      getAirtableRecord<AirtableAssignmentFields>(
        AIRTABLE_TABLES.assignments!,
        body.newAssignmentId
      ),
    ]);

    const oldPendingIds = oldAssignment.fields["Pending Volunteers"] ?? [];
    const oldConfirmedIds = oldAssignment.fields["Confirmed Volunteers"] ?? [];

    const newPendingIds = newAssignment.fields["Pending Volunteers"] ?? [];
    const newConfirmedIds = newAssignment.fields["Confirmed Volunteers"] ?? [];

    await updateAirtableRecord<AirtableAssignmentFields>(
      AIRTABLE_TABLES.assignments!,
      body.oldAssignmentId,
      {
        "Pending Volunteers": removeRecordId(
          oldPendingIds,
          body.volunteerId
        ),
        "Confirmed Volunteers": removeRecordId(
          oldConfirmedIds,
          body.volunteerId
        ),
      }
    );

    await updateAirtableRecord<AirtableAssignmentFields>(
      AIRTABLE_TABLES.assignments!,
      body.newAssignmentId,
      body.confirmed
        ? {
            "Confirmed Volunteers": uniqueRecordIds([
              ...newConfirmedIds,
              body.volunteerId,
            ]),
            "Pending Volunteers": removeRecordId(
              newPendingIds,
              body.volunteerId
            ),
          }
        : {
            "Pending Volunteers": uniqueRecordIds([
              ...newPendingIds,
              body.volunteerId,
            ]),
            "Confirmed Volunteers": removeRecordId(
              newConfirmedIds,
              body.volunteerId
            ),
          }
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("MOVE VOLUNTEER ROLE ERROR", error);

    const message =
      error instanceof Error ? error.message : "Failed to update role.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}