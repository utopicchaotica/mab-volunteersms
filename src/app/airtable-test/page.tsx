import { getAirtableEvents } from "@/lib/airtable/events";

export default async function AirtableTestPage() {
  const records = await getAirtableEvents();

  return (
    <main className="min-h-screen bg-neutral-950 p-8 text-neutral-100">
      <h1 className="mb-4 text-3xl font-semibold">Airtable Test</h1>

      <p className="mb-6 text-neutral-400">
        Found {records.length} event records.
      </p>

      <div className="space-y-4">
        {records.slice(0, 10).map((record) => (
          <article
            key={record.id}
            className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4"
          >
            <p className="text-sm text-neutral-500">{record.id}</p>

            <pre className="mt-2 overflow-x-auto text-sm text-neutral-200">
              {JSON.stringify(record.fields, null, 2)}
            </pre>
          </article>
        ))}
      </div>
    </main>
  );
}