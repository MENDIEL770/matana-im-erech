import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID ?? process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );
        if (!valid) return null;

        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Google sign-in: create or update user automatically
      if (account?.provider === "google" && user.email) {
        let dbUser = await prisma.user.findUnique({ where: { email: user.email } });

        if (!dbUser) {
          // New user — create with CUSTOMER role
          dbUser = await prisma.user.create({
            data: {
              email: user.email,
              name: user.name ?? "",
              role: "CUSTOMER",
              customer: {
                create: {
                  email: user.email,
                  shaliachName: user.name ?? "",
                  chabadHouseName: "",
                  phone: "",
                },
              },
            },
          });
        }

        // Attach DB id + role to the token
        user.id = dbUser.id;
        (user as any).role = dbUser.role;
      }
      return true;
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.role = (user as any).role ?? "CUSTOMER";
        token.id = user.id;
      }
      // On Google sign-in, re-fetch role from DB
      if (account?.provider === "google" && token.email) {
        const dbUser = await prisma.user.findUnique({ where: { email: token.email } });
        if (dbUser) {
          token.role = dbUser.role;
          token.id = dbUser.id;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  trustHost: true,
});
