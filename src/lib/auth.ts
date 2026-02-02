import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Thiếu thông tin đăng nhập');
        }
        const user = await prisma.user.findUnique({
          where: { email: (credentials as any)?.email || "" }
        });
        if (!user || !user.password) {
          throw new Error('Sai email hoặc mật khẩu');
        }
        const isCorrectPassword = await bcrypt.compare(
          (credentials as any)?.password || "",
          user.password
        );
        if (!isCorrectPassword) {
          throw new Error('Sai mật khẩu');
        }
        return user;
      }
    })
  ],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, token }: any) {
      if (session?.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  pages: { signIn: '/login' }
};