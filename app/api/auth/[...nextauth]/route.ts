import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import bcrypt from "bcrypt";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

const handler = NextAuth({
  providers: [
    // 🔐 EMAIL / PASSWORD LOGIN
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials: any) {
  console.log("LOGIN ATTEMPT:", credentials);

  if (!credentials?.email || !credentials?.password) {
    throw new Error("Missing credentials");
  }

  await connectDB();

  const user = await User.findOne({
    email: credentials.email,
  });

  console.log("DB USER:", user);

  if (!user) {
    throw new Error("User not found");
  }

  const isValid = await bcrypt.compare(
    credentials.password,
    user.passwordHash
  );

  console.log("PASSWORD MATCH:", isValid);

  if (!isValid) {
    throw new Error("Invalid password");
  }

  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
  };
}
    }),

    // 🌐 GOOGLE LOGIN
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // 🐙 GITHUB LOGIN
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    // 🔥 Save OAuth users to DB
    async signIn({ user, account }) {
      if (!account) return false; // ✅ FIX TS ERROR

      await connectDB();

      if (account.provider !== "credentials") {
        const existing = await User.findOne({
          email: user.email,
        });

        if (!existing) {
          await User.create({
            name: user.name,
            email: user.email,
            image: user.image,
            provider: account.provider,
          });
        }
      }

      return true;
    },

    // 🔥 Attach user id to token
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
      }
      return token;
    },

    // Attach user id to session
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
  return baseUrl; // always go to homepage
}

  },

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login", // ✅ custom login page
  },

  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };