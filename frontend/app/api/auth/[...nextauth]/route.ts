import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import API_BASE from "@/lib/api";

const handler = NextAuth({
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

      async authorize(credentials) {
  try {
    console.log("LOGIN ATTEMPT:", credentials);

    const res = await fetch(
  `${API_BASE}/api/auth/login`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },

        body: JSON.stringify({
          email: credentials?.email,
          password: credentials?.password,
        }),
      }
    );

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

    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        const u = user as { id?: string; accessToken?: string; email?: string; name?: string; image?: string };
        (token as { id?: string; accessToken?: string }).id = u.id;

        // Prefer any existing accessToken on the user (Credentials flow).
        let appToken = u.accessToken;

        console.log("[NEXTAUTH jwt] sign-in detected. account:", account ? { provider: account.provider, has_access_token: !!account.access_token } : null, "user:", { id: u.id, email: u.email });

        // If this is an OAuth sign-in, exchange the provider profile for an app JWT.
        if (!appToken && account?.provider) {
          try {
            console.log("[NEXTAUTH jwt] attempting oauth exchange for user:", u.email, "provider:", account.provider);
            const resp = await fetch(`${API_BASE}/api/auth/oauth`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: u.email,
                name: u.name,
                image: u.image,
                provider: account.provider,
              }),
            });

            const json = await resp.json().catch(() => ({}));
            console.log("[NEXTAUTH jwt] oauth exchange response:", resp.status, json?.success ? 'ok' : json?.message || json);
            if (json?.token) appToken = json.token as string;
          } catch (err) {
            console.error("[NEXTAUTH jwt] OAuth exchange error:", err);
          }
        }

        (token as { id?: string; accessToken?: string }).accessToken = appToken as string;
        const finalAccessToken = (token as { accessToken?: string }).accessToken;
        console.log("[NEXTAUTH jwt] final appToken present?:", !!finalAccessToken);
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = (token as { id?: string }).id;
      }

      (session as { accessToken?: string }).accessToken = (token as { accessToken?: string }).accessToken;

      return session;
    },

    async redirect({ baseUrl }) {
      return `${baseUrl}/`;
    },
  },

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };