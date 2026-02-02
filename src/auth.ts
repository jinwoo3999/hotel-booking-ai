import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        });

        if (!user || !user.password) return null;

        const isMatch = await compare(credentials.password as string, user.password);
        if (!isMatch) return null;

        // Trả về user object với đầy đủ thông tin
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id || "";
        token.email = user.email || "";
        token.name = user.name || "";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      // Đảm bảo user tồn tại trong database
      if (user.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email }
        });
        
        if (!existingUser) {
          // Tạo user mới nếu chưa tồn tại
          await prisma.user.create({
            data: {
              email: user.email,
              name: user.name || "User",
              role: "USER",
              emailVerified: new Date(),
            }
          });
        }
      }
      return true;
    }
  },
  pages: {
    signIn: "/login"
  }
})