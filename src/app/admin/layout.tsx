import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, 
  CalendarDays, 
  Hotel, 
  Users, 
  TicketPercent, 
  Settings, 
  BookOpen,
  MapPin,
  Package,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // 1. Check quyền: Phải là ADMIN hoặc SUPER_ADMIN mới được vào
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "PARTNER" && session.user.role !== "SUPER_ADMIN")) {
     redirect("/"); 
  }

  // 2. Logic Menu: Super Admin thấy hết, Partner thấy ít hơn
  const isSuperAdmin = session.user.role === "SUPER_ADMIN";

  const menuItems = [
    { href: "/admin", label: "📊 Dashboard & Báo cáo", icon: LayoutDashboard },
    
    { href: "/admin/bookings", label: "Quản lý Booking", icon: CalendarDays },
    { href: "/admin/hotels", label: isSuperAdmin ? "Tất cả khách sạn" : "Khách sạn của tôi", icon: Hotel },
    ...(isSuperAdmin ? [{ href: "/admin/inventory", label: "Quản lý Inventory", icon: Package }] : []),
    { href: "/admin/blogs", label: "Cẩm nang", icon: BookOpen },
    ...(isSuperAdmin ? [{ href: "/admin/attractions", label: "Điểm vui chơi", icon: MapPin }] : []),
    ...(isSuperAdmin ? [{ href: "/admin/partner-apps", label: "Đơn đăng ký Partner", icon: Users }] : []),
    
    ...(isSuperAdmin ? [
        { href: "/admin/users", label: "Người dùng hệ thống", icon: Users },
        { href: "/admin/vouchers", label: "Voucher & Ưu đãi", icon: TicketPercent },
        { href: "/admin/settings", label: "Cài đặt hệ thống", icon: Settings },
    ] : [])
  ];

  return (
    <div className="min-h-screen flex bg-gray-50 font-sans">
      {/* === SIDEBAR === */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed inset-y-0 z-50 flex flex-col">
        <div className="h-16 flex items-center gap-2 px-6 border-b border-gray-100">
          <div className="h-8 w-8 bg-purple-600 rounded-lg flex items-center justify-center text-white">
            <Hotel className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg text-gray-900">
            {isSuperAdmin ? "Super Admin" : "Partner Portal"}
          </span>
        </div>

        <div className="flex-1 py-6 px-3 space-y-1">
            <p className="px-3 text-xs font-bold text-gray-400 uppercase mb-2">Menu chính</p>
            {menuItems.map((item) => (
                <Link key={item.href} href={item.href}>
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                        <item.icon className="h-5 w-5 text-gray-400" />
                        {item.label}
                    </div>
                </Link>
            ))}
        </div>

        <div className="p-4 border-t border-gray-100">
             <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                <Avatar className="h-9 w-9 bg-gray-900 text-white">
                    <AvatarFallback>{session?.user?.name?.charAt(0) || "A"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{session?.user?.name}</p>
                    <p className="text-xs text-gray-500 font-medium">{session.user.role}</p>
                </div>
             </div>
        </div>
      </aside>

      {/* === MAIN CONTENT === */}
      <div className="flex-1 ml-64 flex flex-col">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-40">
            <h2 className="font-bold text-gray-700">Trang quản trị</h2>
            <div className="flex items-center gap-4">
                 <Avatar className="h-8 w-8">
                     <AvatarImage src={session.user.image || ""} />
                     <AvatarFallback className="bg-indigo-200 text-indigo-700 font-bold">AD</AvatarFallback>
                </Avatar>
            </div>
        </header>
        <main className="p-8">
            {children}
        </main>
      </div>
    </div>
  );
}