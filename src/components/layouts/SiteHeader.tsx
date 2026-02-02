"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  LayoutDashboard, 
  Ticket, 
  Hotel,
  Search
} from "lucide-react";
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

type SiteHeaderSession = {
  user?: {
    id?: string;
    name?: string;
    email?: string;
    image?: string;
    role?: string;
  };
};

export function SiteHeader({
  session,
  className,
}: {
  session: SiteHeaderSession | null;
  className?: string;
}) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // IMPORTANT: Hooks must not be conditional. We hide the header on /admin routes
  // after hooks have been registered to satisfy React rules-of-hooks.
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const headerClass = isScrolled || pathname !== "/"
    ? "bg-white text-gray-900 shadow-sm border-b border-gray-200"
    : "bg-transparent text-white";

  return (
    <header className={cn("fixed top-0 left-0 right-0 z-40 transition-all duration-300", headerClass, className)}>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* 1. LOGO */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-indigo-600 p-1.5 rounded-lg group-hover:bg-indigo-700 transition-colors">
            <Hotel className="w-5 h-5 text-white" />
          </div>
          <span className={cn("font-bold text-xl tracking-tight", 
            (isScrolled || pathname !== "/") ? "text-indigo-900" : "text-white"
          )}>
            Lumina Stay
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <NavLink href="/" label="Trang chủ" active={pathname === "/"} isScrolled={isScrolled || pathname !== "/"} />
          <NavLink href="/hotels" label="Khách sạn" active={pathname === "/hotels"} isScrolled={isScrolled || pathname !== "/"} />
          <NavLink href="/ai-assistant" label="AI Trợ lý" active={pathname === "/ai-assistant"} isScrolled={isScrolled || pathname !== "/"} />
          <NavLink href="/flights" label="Vé máy bay" active={pathname === "/flights"} isScrolled={isScrolled || pathname !== "/"} />
          <NavLink href="/blog" label="Cẩm nang" active={pathname === "/blog"} isScrolled={isScrolled || pathname !== "/"} />
        </nav>

        {/* 3. USER ACTIONS */}
        <div className="flex items-center gap-3">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className={cn(
              "hidden md:flex",
              (isScrolled || pathname !== "/") ? "text-gray-600 hover:bg-gray-100" : "text-white/80 hover:bg-white/20"
            )}
          >
            <Link href="/search">
              <Search className="w-5 h-5" />
            </Link>
          </Button>

          {session?.user ? (
            // --- ĐÃ ĐĂNG NHẬP ---
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-2 ring-indigo-100 p-0">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={session.user.image} alt={session.user.name} />
                    <AvatarFallback className="bg-indigo-600 text-white font-medium">
                      {session.user.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{session.user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{session.user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {(session.user.role === "ADMIN" || session.user.role === "PARTNER" || session.user.role === "SUPER_ADMIN") && (
                   <DropdownMenuItem asChild>
                     <Link href="/admin/dashboard" className="cursor-pointer text-indigo-600 font-medium">
                       <LayoutDashboard className="mr-2 h-4 w-4" />
                       Trang quản trị
                     </Link>
                   </DropdownMenuItem>
                )}
                
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" /> Thông tin tài khoản
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/history" className="cursor-pointer">
                    <Ticket className="mr-2 h-4 w-4" /> Lịch sử đặt phòng
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            // --- CHƯA ĐĂNG NHẬP ---
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" className={cn("font-medium",
                  (isScrolled || pathname !== "/") ? "text-gray-700 hover:bg-gray-100" : "text-white hover:bg-white/20"
                )}>
                  Đăng nhập
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-lg shadow-indigo-500/30">
                  Đăng ký
                </Button>
              </Link>
            </div>
          )}

          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
             {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className={cn("w-6 h-6", (isScrolled || pathname !== "/") ? "text-gray-900" : "text-white")} />}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 p-4 space-y-3 shadow-lg animate-in slide-in-from-top-5">
           <Link href="/" className="block py-2 text-gray-700 font-medium hover:text-indigo-600">Trang chủ</Link>
           <Link href="/hotels" className="block py-2 text-gray-700 font-medium hover:text-indigo-600">Khách sạn</Link>
           <Link href="/ai-assistant" className="block py-2 text-gray-700 font-medium hover:text-indigo-600">AI Trợ lý</Link>
           <Link href="/flights" className="block py-2 text-gray-700 font-medium hover:text-indigo-600">Vé máy bay</Link>
           <hr />
           {!session?.user && (
              <div className="grid grid-cols-2 gap-3 pt-2">
                  <Link href="/login" className="w-full"><Button variant="outline" className="w-full">Đăng nhập</Button></Link>
                  <Link href="/register" className="w-full"><Button className="w-full bg-indigo-600">Đăng ký</Button></Link>
              </div>
           )}
        </div>
      )}
    </header>
  );
}

function NavLink({
  href,
  label,
  active,
  isScrolled,
}: {
  href: string;
  label: string;
  active: boolean;
  isScrolled: boolean;
}) {
  return (
    <Link 
      href={href} 
      className={cn(
        "text-sm font-medium transition-all hover:-translate-y-0.5 relative py-1",
        active ? "font-bold" : "",
        isScrolled ? "text-gray-600 hover:text-indigo-600" : "text-white/90 hover:text-white"
      )}
    >
      {label}
      {active && (
         <span className={cn("absolute bottom-0 left-0 w-full h-0.5 rounded-full", isScrolled ? "bg-indigo-600" : "bg-white")}></span>
      )}
    </Link>
  );
}