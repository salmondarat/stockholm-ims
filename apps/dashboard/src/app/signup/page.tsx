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

async function googleSignupAction() {
  "use server";
  await signIn("google", { redirectTo: "/app" });
}

export default function SignupPage() {
  return (
    <main className="min-h-dvh grid lg:grid-cols-2">
      {/* Left: copy + form */}
      <section className="flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <h1 className="text-3xl sm:text-4xl font-semibold leading-tight tracking-tight">
            Never lose track of an item again.
          </h1>
          <p className="mt-3 text-sm text-gray-600">
            Simple, fast, and powerful inventory software for businesses and teams to stay organized.
          </p>

          <div className="mt-8 space-y-6">
            {/* Google sign up (if configured) */}
            {Boolean(process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID) && (
              <>
                <form action={googleSignupAction}>
                  <button className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-[#3b82f6] text-white px-3 py-2 hover:opacity-95">
                    <span>Sign up with Google</span>
                  </button>
                </form>

                <div className="relative text-center text-xs text-gray-500">
                  <span className="px-3 bg-white relative z-10">OR</span>
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-gray-200" />
                </div>
              </>
            )}

            {/* Email sign up */}
            <form action={signupAction} className="space-y-5">
              <div className="space-y-1">
                <label htmlFor="name" className="block text-sm">Full Name</label>
                <input id="name" name="name" className="w-full border-b border-gray-300 focus:border-black outline-none px-0 py-2 bg-transparent" placeholder="Jane Doe" />
              </div>
              <div className="space-y-1">
                <label htmlFor="email" className="block text-sm">Work Email</label>
                <input id="email" name="email" type="email" required className="w-full border-b border-gray-300 focus:border-black outline-none px-0 py-2 bg-transparent" placeholder="you@company.com" />
              </div>
              <div className="space-y-1">
                <label htmlFor="password" className="block text-sm">Create Password</label>
                <input id="password" name="password" type="password" required className="w-full border-b border-gray-300 focus:border-black outline-none px-0 py-2 bg-transparent" placeholder="••••••••" />
              </div>
              <div className="space-y-1">
                <label htmlFor="phone" className="block text-sm">Phone Number (Optional)</label>
                <input id="phone" name="phone" className="w-full border-b border-gray-300 focus:border-black outline-none px-0 py-2 bg-transparent" placeholder="+1" />
              </div>

              <button className="w-full rounded-md px-3 py-2 bg-neutral-200 text-gray-900 hover:bg-neutral-300">
                Create account
              </button>

              <p className="text-[11px] text-gray-500">
                By clicking on "Create account" you agree to Stockholm's <a className="underline" href="#">Terms & Conditions</a> and <a className="underline" href="#">Privacy Policy</a>.
              </p>
              <p className="text-xs text-gray-600">
                Already have an account? <a className="text-sky-600 hover:underline" href="/login">Log in</a>
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* Right: testimonial / social proof */}
      <section className="hidden lg:flex flex-col items-center justify-center bg-gray-50 p-10 gap-10">
        <div className="max-w-md rounded-2xl border bg-white p-6 shadow-sm text-center">
          <div className="text-amber-500 text-lg">★★★★★</div>
          <blockquote className="mt-3 text-gray-700">
            “Simple to input inventory. Simple to use. Simple to customize. Our team adopted Stockholm very quickly.”
          </blockquote>
          <div className="mt-4 text-xs text-gray-500">Olivia C. — COO</div>
        </div>
        <div className="opacity-70 grid grid-cols-3 gap-8 items-center">
          {/* eslint-disable @next/next/no-img-element */}
          <img src="/next.svg" alt="Next.js" className="h-6 w-auto" />
          <img src="/vercel.svg" alt="Vercel" className="h-6 w-auto" />
          <img src="/globe.svg" alt="Partner" className="h-6 w-auto" />
          <img src="/file.svg" alt="Partner" className="h-6 w-auto" />
          <img src="/window.svg" alt="Partner" className="h-6 w-auto" />
          <img src="/next.svg" alt="Partner" className="h-6 w-auto" />
        </div>
      </section>
    </main>
  );
}
