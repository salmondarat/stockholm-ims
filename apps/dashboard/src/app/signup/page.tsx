import { db } from "@stockholm/db";
import { signIn } from "@/lib/auth";
import bcrypt from "bcryptjs";

export const metadata = { title: "Sign up — Stockholm IMS" };

async function signupAction(formData: FormData) {
  "use server";
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return;

  const hash = await bcrypt.hash(password, 10);
  try {
    await db.user.create({
      data: { email, name: name || null, passwordHash: hash },
    });
  } catch {
    // Ignore if user already exists; we'll attempt sign-in below
  }
  await signIn("credentials", { redirectTo: "/app", email, password });
}

export default function SignupPage() {
  return (
    <main className="min-h-dvh flex items-center justify-center p-6">
      <form action={signupAction} className="w-full max-w-sm space-y-4 border rounded-xl p-6">
        <h1 className="text-2xl font-semibold">Create your account</h1>
        <div className="space-y-2">
          <label className="block text-sm">Name</label>
          <input name="name" className="w-full rounded-md border px-3 py-2" placeholder="Jane Doe" />
        </div>
        <div className="space-y-2">
          <label className="block text-sm">Email</label>
          <input name="email" type="email" required className="w-full rounded-md border px-3 py-2" placeholder="you@example.com" />
        </div>
        <div className="space-y-2">
          <label className="block text-sm">Password</label>
          <input name="password" type="password" required className="w-full rounded-md border px-3 py-2" placeholder="••••••••" />
        </div>
        <button className="w-full rounded-md px-3 py-2 bg-black text-white">Sign up</button>
        <p className="text-xs text-gray-600">Already have an account? <a className="underline" href="/login">Log in</a></p>
      </form>
    </main>
  );
}

