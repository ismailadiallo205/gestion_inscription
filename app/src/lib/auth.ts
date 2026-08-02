import NextAuth, { type AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "./prisma";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Identifiants",
      credentials: {
        email: { label: "Email", type: "email" },
        motDePasse: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.motDePasse) {
          return null;
        }

        let ecole = await prisma.ecole.findUnique({
          where: { email: credentials.email },
        });

        if (ecole) {
          const motDePasseValide = await compare(credentials.motDePasse, ecole.motDePasseHash);
          if (!motDePasseValide) return null;
          return { id: ecole.id, email: ecole.email, name: ecole.nom, role: "ECOLE" };
        }

        const admin = await prisma.superAdmin.findUnique({
          where: { email: credentials.email },
        });

        if (admin) {
          const motDePasseValide = await compare(credentials.motDePasse, admin.motDePasseHash);
          if (!motDePasseValide) return null;
          return { id: admin.id, email: admin.email, name: "Super Admin", role: "SUPER_ADMIN" };
        }

        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.userId;
        (session.user as any).role = token.role;
        // Keep ecoleId for backward compatibility in the app
        if (token.role === "ECOLE") {
          (session.user as any).ecoleId = token.userId;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/connexion",
    newUser: "/inscription",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
