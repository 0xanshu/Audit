import { type DefaultSession, type NextAuthConfig } from "next-auth";
import GitHubProvider from "next-auth/providers/github";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

export const authConfig = {
  // Only list providers that don't need DB access here.
  // The credentials provider (which needs bcrypt + DB) lives in auth/index.ts
  // so it's never imported by the middleware (edge runtime).
  providers: [GitHubProvider],
  callbacks: {
    jwt({ token, user }) {
      // On sign-in, `user` is populated — persist the DB id into the token
      if (user?.id) token.sub = user.id;
      return token;
    },
    session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub ?? "",
        },
      };
    },
  },
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
} satisfies NextAuthConfig;
