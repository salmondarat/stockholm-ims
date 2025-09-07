export default function NewsPage() {
  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Product News</h1>
      <div className="rounded-xl border bg-white p-5 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border p-4">
            <div className="font-medium">Release {i}</div>
            <div className="text-sm text-gray-600">
              Changelog and improvements.
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
