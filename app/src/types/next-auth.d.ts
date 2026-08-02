import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ECOLE" | "SUPER_ADMIN";
      ecoleId?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: "ECOLE" | "SUPER_ADMIN";
    ecoleId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string;
    role: "ECOLE" | "SUPER_ADMIN";
  }
}
