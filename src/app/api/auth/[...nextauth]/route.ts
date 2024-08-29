import NextAuth from "next-auth";
import { authOptions } from "./options";

export const maxDuration = 300;

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
