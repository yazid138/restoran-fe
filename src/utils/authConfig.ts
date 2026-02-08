import { DefaultSession, NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { axiosServices } from "./axios";
import axios from "axios";

declare module "next-auth" {
  interface User {
    id?: string;
    name?: string;
    email?: string;
    token?: string;
    role?: string;
  }

  interface Session {
    token?: string;
    user: {
      id?: string;
      name?: string;
      email?: string;
      role?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    token?: string;
    role?: string;
  }
}

interface LoginResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  message: string;
}

export const authConfig: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email dan password wajib diisi");
        }

        try {
          const { data } = await axiosServices.post<LoginResponse>(
            "/auth/login",
            {
              email: credentials.email,
              password: credentials.password,
            },
          );

          if (data.token && data.user) {
            return {
              id: data.user.id.toString(),
              name: data.user.name,
              email: data.user.email,
              role: data.user.role,
              token: data.token,
            };
          }

          return null;
        } catch (error) {
          console.error("Login error:", error);
          if (axios.isAxiosError(error)) {
            const errorMessage = error.response?.data?.message || "Login gagal";
            throw new Error(errorMessage);
          }
          throw new Error("Terjadi kesalahan saat login");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.token = user.token;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.token = token.token;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
};
