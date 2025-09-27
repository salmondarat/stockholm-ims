// apps/dashboard/src/lib/auth.ts
import "../../types/next-auth.d.ts";
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

const providers: Provider[] = [
  Credentials({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    authorize: async (raw) => {
      try {
        const parsed = CredentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
  
        const { email, password } = parsed.data;
  
        const user = await db.user.findUnique({ where: { email } });
  
        if (!user?.passwordHash) return null;
  
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;
  
        // Return user dengan explicit typing
        return {
          id: String(user.id),
          email: user.email,
          name: user.name ?? null,
          role: user.role ?? "MEMBER",
        };
      } catch (error) {
        console.error("Auth authorize error:", error);
        return null;
      }
    },
  }),
];

const googleClientId = process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET;

if (googleClientId && googleClientSecret) {
  providers.push(
    Google({ 
      clientId: googleClientId, 
      clientSecret: googleClientSecret,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: "MEMBER", // Default role untuk Google OAuth
        };
      },
    }),
  );
}

const authSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  providers,
  secret: authSecret || undefined,

  // Avoid decrypting any stale session token cookies from previous secrets
  // by using a custom cookie name (helps eliminate JWTSessionError noise in dev).
  cookies: {
    sessionToken: {
      name:
        process.env.AUTH_SESSION_COOKIE_NAME ||
        (process.env.NODE_ENV === "production"
          ? "__Secure-stk.session-token"
          : "stk.session-token"),
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },

  callbacks: {
    jwt({ token, user }) {
      if (user) {
        // Sekarang TypeScript mengenali user.role
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        // Sekarang TypeScript mengenali token.role dan session.user.role
        session.user.id = token.sub!;
        session.user.role = token.role;
      }
      return session;
    },
  },
});
