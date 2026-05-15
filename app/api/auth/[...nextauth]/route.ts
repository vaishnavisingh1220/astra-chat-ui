import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";

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
      "http://127.0.0.1:5000/api/auth/login",
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
    async jwt({ token, user }) {
      if (user) {
        const u = user as { id?: string; accessToken?: string };
        (token as { id?: string; accessToken?: string }).id = u.id;
        (token as { id?: string; accessToken?: string }).accessToken = u.accessToken;
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