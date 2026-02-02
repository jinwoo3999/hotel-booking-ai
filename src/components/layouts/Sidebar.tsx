"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Hotel, 
  History, 
  Settings, 
  LogOut 
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar({ className }: React.HTMLAttributes<HTMLDivElement>) {
  const pathname = usePathname();

  const sidebarItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Đặt Phòng",
      href: "/dashboard/booking",
      icon: Hotel,
    },
    {
      title: "Lịch Sử",
      href: "/dashboard/history",
      icon: History,
    },
    {
      title: "Cài Đặt",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ];

  return (
    <aside className={cn("bg-background px-4 py-6 border-r h-full", className)}>
      <div className="mb-8 flex items-center gap-2 px-2">
        <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
           <span className="text-white font-bold">L</span>
        </div>
        <span className="text-xl font-bold tracking-tight text-foreground">
          Lumina Stay
        </span>
      </div>

      <nav className="flex flex-col gap-2">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-accent",
                isActive 
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-4 w-4", isActive && "text-indigo-600")} />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6">
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
          <LogOut className="h-4 w-4" />
          Đăng Xuất
        </button>
      </div>
    </aside>
  );
}