// apps/dashboard/src/lib/auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import type { Provider } from "next-auth/providers";
import { z } from "zod";
import bcrypt from "bcryptjs";

import { db } from "@stockholm/db";

const CredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Build providers list conditionally to avoid requiring OAuth env in dev
const providers: Provider[] = [
  Credentials({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    authorize: async (raw) => {
      const parsed = CredentialsSchema.safeParse(raw);
      if (!parsed.success) return null;

      const { email, password } = parsed.data;

      // gunakan salah satu dari dua gaya query ini:
      const user = await db.user.findUnique({ where: { email } });

      if (!user) return null;

      const hash =
        typeof user.passwordHash === "string" && user.passwordHash
          ? user.passwordHash
          : typeof (user as { password?: string }).password === "string"
            ? (user as { password?: string }).password!
            : null;
      if (!hash) return null;

      const ok = await bcrypt.compare(password, hash);
      if (!ok) return null;

      return {
        id: String(user.id),
        email: user.email,
        name: user.name ?? null,
        role: (user as { role?: string }).role ?? "MEMBER",
      };
    },
  }),
];

const googleClientId = process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET;
if (googleClientId && googleClientSecret) {
  providers.push(Google({ clientId: googleClientId, clientSecret: googleClientSecret }));
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  providers,

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role ?? "MEMBER";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role =
          typeof token.role === "string" ? token.role : "MEMBER";
      }
      return session;
    },
  },
});
