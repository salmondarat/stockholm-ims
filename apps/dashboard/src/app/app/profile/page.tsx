import { auth, signOut } from "@/lib/auth";

export default async function ProfilePage() {
  const session = await auth();
  const user = session?.user;

  async function logout() {
    "use server";
    await signOut({ redirectTo: "/" });
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
        <form action={logout} className="mt-4">
          <button
            type="submit"
            className="px-4 py-2 rounded-md bg-[#280299] text-white"
          >
            Log out
          </button>
        </form>
      </div>
    </main>
  );
}
