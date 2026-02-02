import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import AuthProvider from "@/providers/AuthProvider";
import { FloatingChat } from "@/features/ai/components/FloatingChat";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Lumina Stay",
  description: "Hệ thống đặt phòng khách sạn thông minh",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <FloatingChat />
          <Toaster position="top-center" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}