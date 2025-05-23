import { AdminRole } from ".";

declare module "next-auth" {
  interface User {
    id: string;
    name: string;
    email: string;
    role: AdminRole;
  }

  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: AdminRole;
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: AdminRole;
  }
}
