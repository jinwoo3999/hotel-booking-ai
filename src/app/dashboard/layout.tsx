import { TopNav } from "@/components/layouts/TopNav";
import { ChatWidget } from "@/features/ai-assistant/components/ChatWidget";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900">
      
      {/* 1. Thanh Menu Ngang nằm trên cùng */}
      <TopNav />

      {/* 2. Nội dung chính */}
      {/* Xóa class ml-64, thay bằng container mx-auto để căn giữa giống Booking */}
      <main className="container mx-auto p-4 lg:p-8">
        {/* Không cần Header cũ ở đây nữa vì đã có trên TopNav */}
        {children}
      </main>

      {/* Chat Widget vẫn giữ nguyên */}
      <ChatWidget />
    </div>
  );
}