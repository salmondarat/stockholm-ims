import { db } from "@stockholm/db";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
import { revalidatePath } from "next/cache";

async function updateTagsAction(formData: FormData) {
  "use server";
  const itemId = String(formData.get("itemId"));
  const raw = String(formData.get("tags") || "");
  const tags = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  await db.item.update({ where: { id: itemId }, data: { tags } });
  revalidatePath("/app/tags");
}

export default async function TagsPage() {
  const items = await db.item.findMany({
    orderBy: { updatedAt: "desc" },
    select: { id: true, name: true, tags: true },
    take: 50,
  });

  // Aggregate unique tags
  const freq = new Map<string, number>();
  for (const it of items) {
    const ts = Array.isArray(it.tags) ? (it.tags as unknown as string[]) : [];
    for (const t of ts) freq.set(t, (freq.get(t) || 0) + 1);
  }
  const unique = Array.from(freq.entries()).sort((a, b) => b[1] - a[1]);

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Tags</h1>
      <div className="rounded-xl border bg-white p-5">
        <div className="text-sm text-gray-600">
          Manage tags per item below. Edit a row and save.
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm min-w-[540px]">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left p-2">Item</th>
                <th className="text-left p-2">Tags (comma separated)</th>
                <th className="text-right p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => {
                const current = Array.isArray(it.tags)
                  ? (it.tags as unknown as string[])
                  : [];
                return (
                  <tr key={it.id} className="border-b align-top">
                    <td className="p-2 w-64">{it.name}</td>
                    <td className="p-2">
                      <form
                        action={updateTagsAction}
                        className="flex items-center gap-2"
                      >
                        <input type="hidden" name="itemId" value={it.id} />
                        <input
                          name="tags"
                          defaultValue={current.join(", ")}
                          placeholder="e.g. Urgent, Fragile"
                          className="w-full rounded-md border px-3 py-2"
                        />
                        <button className="px-3 py-2 rounded-md bg-[#280299] text-white">
                          Save
                        </button>
                      </form>
                    </td>
                    <td className="p-2 text-right">
                      <form action={updateTagsAction}>
                        <input type="hidden" name="itemId" value={it.id} />
                        <input type="hidden" name="tags" value="" />
                        <button className="px-3 py-2 rounded-md border">
                          Clear
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-5">
        <div className="font-medium mb-2">Tag Overview</div>
        {unique.length === 0 ? (
          <div className="text-sm text-gray-600">No tags yet.</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {unique.map(([t, n]) => (
              <span
                key={t}
                className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm"
              >
                <span>#{t}</span>
                <span className="text-gray-500">{n}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
