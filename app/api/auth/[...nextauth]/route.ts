import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import bcrypt from "bcryptjs";

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

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        await connectDB();

        const user = await User.findOne({
          email: credentials.email,
        });

        if (!user || !user.passwordHash) {
          throw new Error("User not found");
        }

        // 🔐 Compare hashed password
        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isValid) {
          throw new Error("Invalid password");
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.image || null,
        };
      },
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
      if (!account) return false;

      await connectDB();

      if (account.provider !== "credentials") {
        const existingUser = await User.findOne({
          email: user.email,
        });

        if (!existingUser) {
          await User.create({
            name: user.name,
            email: user.email,
            image: user.image,
            provider: account.provider,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        } else {
          // ✅ Optional: update existing user info
          existingUser.name = user.name || existingUser.name;
          existingUser.image = user.image || existingUser.image;
          existingUser.updatedAt = new Date();
          await existingUser.save();
        }
      }

      return true;
    },

    // 🔥 Attach user id to JWT
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
      }
      return token;
    },

    // 🔥 Attach user id to session
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
      }
      return session;
    },

    // 🔥 Control redirect after login
    async redirect({ baseUrl }) {
      return `${baseUrl}/`; // or "/chat" if you prefer
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