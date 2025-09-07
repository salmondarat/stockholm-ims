export default function HelpPage() {
  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Help Center</h1>
      <div className="rounded-xl border bg-white p-5">
        <p className="text-sm text-gray-600">
          Find answers and guides for common tasks.
        </p>
        <ul className="list-disc pl-5 text-sm mt-3 space-y-1 text-gray-700">
          <li>Creating items and categories</li>
          <li>Uploading media</li>
          <li>Exporting reports</li>
        </ul>
      </div>
    </main>
  );
}
