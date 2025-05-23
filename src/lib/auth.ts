import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDatabase } from "./mongoose";
import Admin from "@/models/Admin";
import { AdminRole, ExtendedSession, ExtendedJWT } from "@/types";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          await connectToDatabase();
          
          // Find the admin user by email
          const admin = await Admin.findOne({ email: credentials.email, isActive: true });
          
          if (!admin) {
            return null;
          }
          
          // Check if password is correct
          const isPasswordValid = await admin.comparePassword(credentials.password);
          
          if (!isPasswordValid) {
            return null;
          }
          
          // Return user data (excluding password)
          return {
            id: admin._id.toString(),
            name: admin.name,
            email: admin.email,
            role: admin.role as AdminRole
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token as ExtendedJWT;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as AdminRole;
      }
      return session as ExtendedSession;
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key-change-in-production",
};
