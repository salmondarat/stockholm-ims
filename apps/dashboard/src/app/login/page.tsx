import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

export const metadata = { title: "Login — Stockholm IMS" };

async function loginAction(formData: FormData) {
  "use server";
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  try {
    await signIn("credentials", { redirectTo: "/app", email, password });
  } catch (e) {
    if (e instanceof AuthError) {
      const type = e.type || "CredentialsSignin";
      return redirect(`/login?error=${encodeURIComponent(type)}`);
    }
    throw e;
  }
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await (searchParams ?? Promise.resolve({}));
  const error = typeof params?.error === "string" ? params.error : undefined;
  const errorMsg = error
    ? error === "CredentialsSignin"
      ? "Invalid email or password. Please try again."
      : "Unable to sign in. Please try again."
    : undefined;

  return (
    <main className="min-h-dvh flex items-center justify-center p-6">
      <form
        action={loginAction}
        className="w-full max-w-sm space-y-4 border rounded-xl p-6"
      >
        <h1 className="text-2xl font-semibold">Sign in</h1>
        {errorMsg && (
          <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMsg}
          </div>
        )}
        <div className="space-y-2">
          <label className="block text-sm">Email</label>
          <input
            name="email"
            type="email"
            required
            className="w-full rounded-md border px-3 py-2"
            placeholder="admin@stockholm.local"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm">Password</label>
          <input
            name="password"
            type="password"
            required
            className="w-full rounded-md border px-3 py-2"
            placeholder="••••••••"
          />
        </div>
        <button className="w-full rounded-md px-3 py-2 bg-black text-white">
          Login
        </button>
      </form>
    </main>
  );
}
