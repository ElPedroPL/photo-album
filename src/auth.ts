import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "@/app/lib/db";
import UserModel from "@/app/models/user";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Logowanie",
      credentials: {
        username: { label: "Login", type: "text" },
        password: { label: "Hasło", type: "password" },
      },
      async authorize(credentials) {
        console.log("Próba logowania:", credentials?.username);
        
        if (!credentials?.username || !credentials?.password) {
          console.log("Brak credentials");
          return null;
        }

        try {
          await connectDB();
          console.log("Połączono z bazą danych");

          const user = await UserModel.findOne({ username: credentials.username });
          console.log("Znaleziony użytkownik:", user ? "TAK" : "NIE");

          if (!user) {
            console.log("Użytkownik nie istnieje");
            return null;
          }

          const isValid = await bcrypt.compare(credentials.password, user.password);
          console.log("Hasło poprawne:", isValid);

          if (!isValid) return null;

          return { id: user._id.toString(), name: user.username, email: user.email };
        } catch (error) {
          console.error("Błąd podczas logowania:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (token?.sub && session.user) {
        (session.user as any).id = token.sub;
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);
