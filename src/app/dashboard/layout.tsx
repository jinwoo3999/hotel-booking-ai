import { TopNav } from "@/components/layouts/TopNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900">
      {/* Thanh menu ngang giữ nguyên UI hiện có */}
      <TopNav />

      <main className="container mx-auto p-4 lg:p-8">
        {children}
      </main>

    </div>
  );
}