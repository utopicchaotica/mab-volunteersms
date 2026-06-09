const AIRTABLE_API_KEY = process.env.AIRTABLE_TOKEN;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

if (!AIRTABLE_API_KEY) {
  throw new Error("Missing AIRTABLE_API_KEY in .env.local");
}

if (!AIRTABLE_BASE_ID) {
  throw new Error("Missing AIRTABLE_BASE_ID in .env.local");
}

export type AirtableRecord<TFields> = {
  id: string;
  createdTime: string;
  fields: TFields;
};

type AirtableListResponse<TFields> = {
  records: AirtableRecord<TFields>[];
  offset?: string;
};

type ListRecordsOptions = {
  view?: string;
  filterByFormula?: string;
  sort?: {
    field: string;
    direction?: "asc" | "desc";
  }[];
  fields?: string[];
};

export async function listAirtableRecords<TFields>(
  tableName: string,
  options: ListRecordsOptions = {}
): Promise<AirtableRecord<TFields>[]> {
  const allRecords: AirtableRecord<TFields>[] = [];
  let offset: string | undefined;

  do {
    const url = new URL(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(
        tableName
      )}`
    );

    if (offset) {
      url.searchParams.set("offset", offset);
    }

    if (options.view) {
      url.searchParams.set("view", options.view);
    }

    if (options.filterByFormula) {
      url.searchParams.set("filterByFormula", options.filterByFormula);
    }

    options.sort?.forEach((sort, index) => {
      url.searchParams.set(`sort[${index}][field]`, sort.field);
      url.searchParams.set(
        `sort[${index}][direction]`,
        sort.direction ?? "asc"
      );
    });

    options.fields?.forEach((field) => {
      url.searchParams.append("fields[]", field);
    });

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(
        `Airtable request failed for "${tableName}": ${response.status} ${response.statusText}\n${errorText}`
      );
    }

    const data = (await response.json()) as AirtableListResponse<TFields>;

    allRecords.push(...data.records);
    offset = data.offset;
  } while (offset);

  return allRecords;
}

export async function getAirtableRecord<TFields>(
  tableName: string,
  recordId: string
): Promise<AirtableRecord<TFields>> {
  const url = new URL(
    `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(
      tableName
    )}/${recordId}`
  );

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_KEY}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Airtable get failed for "${tableName}": ${response.status} ${response.statusText}\n${errorText}`
    );
  }

  return response.json();
}

export async function updateAirtableRecord<TFields>(
  tableName: string,
  recordId: string,
  fields: Partial<TFields>
): Promise<AirtableRecord<TFields>> {
  const url = new URL(
    `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(
      tableName
    )}/${recordId}`
  );

  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fields,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Airtable update failed for "${tableName}": ${response.status} ${response.statusText}\n${errorText}`
    );
  }

  return response.json();
}