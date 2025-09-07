export default function SettingsPage() {
  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <div className="rounded-xl border bg-white p-5 space-y-4 max-w-3xl">
        <div>
          <div className="font-medium">Appearance</div>
          <div className="text-sm text-gray-600">
            Theme options coming soon.
          </div>
        </div>
        <div>
          <div className="font-medium">Storage</div>
          <div className="text-sm text-gray-600">Local / S3 configuration.</div>
        </div>
      </div>
    </main>
  );
}
