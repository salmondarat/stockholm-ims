import { auth, signOut } from "@/lib/auth";
import { db } from "@stockholm/db";

export default async function ProfilePage() {
  const session = await auth();
  const user = session?.user;

  async function logout() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  async function updateName(formData: FormData) {
    "use server";
    const name = String(formData.get("name") || "").trim();
    if (!session?.user?.email) return;
    await db.user.update({ where: { email: session.user.email }, data: { name } });
  }

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Your Profile</h1>
      <div className="rounded-xl border bg-white p-5 max-w-xl">
        <div className="flex items-center gap-4">
          {user?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt="avatar"
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <div className="h-12 w-12 rounded-full bg-gray-200 grid place-items-center text-gray-700 font-bold">
              {(user?.name || user?.email || "?").charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div className="font-medium">{user?.name ?? "Unnamed"}</div>
            <div className="text-sm text-gray-600">{user?.email ?? "-"}</div>
          </div>
        </div>
        <form action={updateName} className="mt-4 space-y-2">
          <label className="block text-sm">Display name</label>
          <input name="name" defaultValue={user?.name ?? ""} className="w-full rounded-md border px-3 py-2" />
          <button type="submit" className="px-3 py-2 rounded-md border">Save</button>
        </form>
        <form action={logout} className="mt-4">
          <button type="submit" className="px-4 py-2 rounded-md bg-[#280299] text-white">Log out</button>
        </form>
      </div>
    </main>
  );
}
