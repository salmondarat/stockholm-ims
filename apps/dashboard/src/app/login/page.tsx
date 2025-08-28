import { signIn } from "@/lib/auth";

export const metadata = { title: "Login — Stockholm IMS" };

async function loginAction(formData: FormData) {
  "use server";
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  await signIn("credentials", { redirectTo: "/app", email, password });
}

export default function LoginPage() {
  return (
    <main className="min-h-dvh flex items-center justify-center p-6">
      <form
        action={loginAction}
        className="w-full max-w-sm space-y-4 border rounded-xl p-6"
      >
        <h1 className="text-2xl font-semibold">Sign in</h1>
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
