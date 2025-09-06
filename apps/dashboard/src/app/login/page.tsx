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

async function googleAction() {
  "use server";
  await signIn("google", { redirectTo: "/app" });
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await (searchParams ??
    Promise.resolve({} as Record<string, string | string[] | undefined>));
  const error = typeof params?.error === "string" ? params.error : undefined;
  const errorMsg = error
    ? error === "CredentialsSignin"
      ? "Invalid email or password. Please try again."
      : "Unable to sign in. Please try again."
    : undefined;
  const hasGoogle = Boolean(
    process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID,
  );

  return (
    <main className="min-h-dvh grid lg:grid-cols-2">
      {/* Left: form */}
      <section className="flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2">
            <span className="inline-block h-7 w-7 rounded bg-[#ef4444]"></span>
            <span className="text-lg font-semibold">Stockholm IMS</span>
          </div>
          <h1 className="mt-10 text-3xl sm:text-4xl font-semibold tracking-tight">
            Welcome back!
          </h1>
          <p className="mt-2 text-sm text-gray-600">Log in to your account.</p>

          {/* Social auth first (not nested inside credentials form) */}
          {hasGoogle && (
            <div className="mt-8 space-y-5">
              <form action={googleAction}>
                <button className="w-full inline-flex items-center justify-center gap-2 rounded-md border px-3 py-2 bg-white text-gray-900">
                  Sign in with Google
                </button>
              </form>
              <div className="relative text-center text-xs text-gray-500">
                <span className="px-3 bg-white relative z-10">OR</span>
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-gray-200" />
              </div>
            </div>
          )}

          <form action={loginAction} className="mt-8 space-y-5">
            {errorMsg && (
              <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
                {errorMsg}
              </div>
            )}
            <div className="space-y-1">
              <label htmlFor="email" className="block text-sm">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full border-b border-gray-300 focus:border-black outline-none px-0 py-2 bg-transparent"
                placeholder="you@company.com"
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm">
                  Password
                </label>
                <a className="text-xs text-sky-600 hover:underline" href="#">
                  Forgot password?
                </a>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full border-b border-gray-300 focus:border-black outline-none px-0 py-2 bg-transparent"
                placeholder="••••••••"
              />
            </div>

            <button className="w-full rounded-md px-3 py-2 bg-neutral-200 text-gray-900 hover:bg-neutral-300">
              Continue
            </button>

            <p className="text-center text-xs text-gray-600">
              New here?{" "}
              <a href="/signup" className="text-sky-600 hover:underline">
                Create an account
              </a>
            </p>
          </form>
        </div>
      </section>

      {/* Right: illustration */}
      <section className="hidden lg:flex items-center justify-center bg-gray-50 p-10">
        {/* Use a simple illustration from public assets */}
        {/* eslint-disable @next/next/no-img-element */}
        <img
          src="/window.svg"
          alt="Login illustration"
          className="max-w-[520px] w-4/5"
        />
      </section>
    </main>
  );
}
