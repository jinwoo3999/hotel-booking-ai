"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { MobileSidebar } from "./MobileSidebar";
import { LayoutDashboard, Hotel, History, Bot, Settings, LogOut, User, Sparkles, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut, useSession } from "next-auth/react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function TopNav() {
  const pathname = usePathname();
  const { data: session, status } = useSession(); 
  
  const navItems = [
    { title: "Trang Chủ", href: "/dashboard", icon: LayoutDashboard },
    { title: "Đặt Phòng", href: "/dashboard/booking", icon: Hotel },
    { title: "Lịch Sử", href: "/dashboard/history", icon: History },
    { title: "AI Trợ Lý", href: "/dashboard/ai-assistant", icon: Bot, highlight: true },
    { title: "Cài Đặt", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-white/80 backdrop-blur-md dark:bg-zinc-950/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        
        <div className="flex items-center gap-2 lg:gap-4">
          <MobileSidebar />
          <Link href="/dashboard" className="flex items-center gap-2 group shrink-0">
            <div className="h-8 w-8 rounded-lg bg-linear-to-tr from-indigo-600 to-purple-500 flex items-center justify-center shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
              <Sparkles className="h-5 w-5 text-white fill-white" />
            </div>
            <span className="text-xl font-extrabold tracking-tight hidden xl:block bg-linear-to-r from-indigo-700 via-purple-700 to-indigo-700 bg-clip-text text-transparent whitespace-nowrap">
              Lumina Stay
            </span>
          </Link>
        </div>

        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                  isActive 
                    ? "bg-indigo-50 bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-extrabold shadow-sm" 
                    : "text-muted-foreground hover:text-indigo-600 hover:bg-gray-100/50"
                )}
              >
                <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-indigo-600" : "currentColor")} />
                {item.title}
                {item.highlight && !isActive && (
                  <span className="ml-1 flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse shrink-0" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4 shrink-0">
           {status === "loading" ? (
             <div className="h-9 w-9 rounded-full bg-gray-200 animate-pulse" />
           ) : session?.user ? (
             <DropdownMenu>
               <DropdownMenuTrigger asChild>
                 <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1.5 rounded-full pr-2 xl:pr-3 transition-all select-none group">
                    {session.user.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={session.user.image} alt="Avatar" className="h-8 w-8 lg:h-9 lg:w-9 rounded-full object-cover border-2 border-indigo-200 group-hover:border-indigo-400 transition-colors shrink-0" />
                    ) : (
                        <div className="h-8 w-8 lg:h-9 lg:w-9 rounded-full bg-linear-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-md border-2 border-white shrink-0">
                            {session.user.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                    )}
                    <div className="hidden xl:block text-left max-w-30">
                        <p className="text-sm font-bold text-gray-800 leading-none truncate">
                            {session.user.name || "Khách hàng"}
                        </p>
                        <p className="text-[11px] text-indigo-600 font-semibold whitespace-nowrap">Thành viên Bạc</p>
                    </div>
                 </div>
               </DropdownMenuTrigger>
               
               <DropdownMenuContent align="end" className="w-64 p-2">
                 <DropdownMenuLabel className="font-bold text-gray-900">
                    <div className="flex flex-col">
                        <span>Tài khoản của tôi</span>
                        <span className="text-xs font-normal text-muted-foreground xl:hidden mt-1">{session.user.name}</span>
                    </div>
                 </DropdownMenuLabel>
                 <DropdownMenuSeparator />
                 <Link href="/dashboard/settings"><DropdownMenuItem className="cursor-pointer py-2.5 font-medium"><User className="mr-3 h-4 w-4 text-gray-500" /> Thông tin tài khoản</DropdownMenuItem></Link>
                 <Link href="/dashboard/history"><DropdownMenuItem className="cursor-pointer py-2.5 font-medium"><History className="mr-3 h-4 w-4 text-gray-500" /> Lịch sử đặt phòng</DropdownMenuItem></Link>
                 <Link href="/dashboard/vouchers"><DropdownMenuItem className="cursor-pointer py-2.5 font-medium"><Gift className="mr-3 h-4 w-4 text-gray-500" /> Ví Voucher & Ưu đãi</DropdownMenuItem></Link>
                 <DropdownMenuSeparator />
                 <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })} className="text-red-600 cursor-pointer py-2.5 font-bold focus:text-red-700 focus:bg-red-50">
                    <LogOut className="mr-3 h-4 w-4" /> Đăng xuất
                 </DropdownMenuItem>
               </DropdownMenuContent>
             </DropdownMenu>
           ) : (
             <div className="flex items-center gap-2 sm:gap-3">
                <Link href="/login" className="hidden sm:block"><Button variant="ghost" className="font-medium hover:text-indigo-600 hover:bg-indigo-50">Đăng nhập</Button></Link>
                <Link href="/register"><Button size="sm" className="bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 font-bold shadow-md border-0 whitespace-nowrap">Đăng ký</Button></Link>
             </div>
           )}
        </div>
      </div>
    </header>
  );
}