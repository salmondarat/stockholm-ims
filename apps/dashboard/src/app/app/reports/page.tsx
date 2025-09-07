export default function ReportsPage() {
  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Reports</h1>
      <div className="rounded-xl border bg-white p-5">
        <p className="text-sm text-gray-600">
          Export inventory reports as CSV or PDF.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            className="px-3 py-2 rounded-md border bg-white"
            href="/app/api/reports/csv"
          >
            Export CSV
          </a>
          <a
            className="px-3 py-2 rounded-md border bg-white"
            href="/app/api/reports/pdf"
          >
            Export PDF
          </a>
        </div>
      </div>
    </main>
  );
}
