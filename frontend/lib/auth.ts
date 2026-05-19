import { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import API_BASE from "@/lib/api";

export const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      name: "Credentials",

      credentials: {
        email: {
          label: "Email",
          type: "text",
        },

        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials: { email?: string; password?: string } | undefined) {
        try {
          console.log("LOGIN ATTEMPT:", credentials);

          const res = await fetch(`${API_BASE}/api/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: credentials?.email,
              password: credentials?.password,
            }),
          });

    console.log("STATUS:", res.status);

    const text = await res.text();

    console.log("RAW RESPONSE:", text);

    const data = JSON.parse(text);

    console.log("PARSED DATA:", data);

    if (!res.ok || !data.success) {
      return null;
    }

    return {
      id: data.user._id,
      name: data.user.name,
      email: data.user.email,
      image: data.user.image || null,
      accessToken: data.token,
    };

  } catch (err) {
    console.error("AUTHORIZE ERROR:", err);
    return null;
  }
}
    }),

  ],

  callbacks: {
    async signIn({ account }) {
      if (!account) return false;
      return true;
    },

    async jwt({ token, user }) {
      // Runs during login
      if (user) {
        token.accessToken = user.accessToken;
      }

      return token;
    },

    async session({ session, token }) {
      // Send token to frontend
      session.accessToken = token.accessToken as string;

      return session;
    },
  },

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,
};