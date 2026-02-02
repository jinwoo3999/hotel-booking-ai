import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, CreditCard, CalendarDays, MapPin, Sparkles, Gift, LogOut, Ticket } from "lucide-react";
import Link from "next/link";
import { signOut } from "@/auth"; // Hoặc dùng hàm signout client nếu muốn

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  // Lấy full thông tin User kèm Booking và Voucher
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      bookings: { include: { hotel: true }, orderBy: { createdAt: 'desc' }, take: 3 }, // Lấy 3 đơn mới nhất
      vouchers: true,
    }
  });

  if (!user) return redirect("/login");

  // Tính toán chỉ số
  const totalTrips = user.bookings.filter(b => b.status === 'CONFIRMED').length;
  const totalSpent = user.bookings
    .filter(b => b.status === 'CONFIRMED')
    .reduce((acc, curr) => acc + curr.totalPrice, 0);

  return (
    <div className="pb-20">
      <main className="container mx-auto max-w-6xl px-4 py-8">
        
        {/* HEADER CHÀO MỪNG */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    {user.name?.[0]?.toUpperCase() || "U"}
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Xin chào, {user.name}!</h1>
                    <p className="text-gray-500 flex items-center gap-2">
                        <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                        Thành viên {user.role === 'ADMIN' ? 'Đối tác' : 'Thân thiết'}
                    </p>
                </div>
            </div>
            
            <div className="bg-white px-6 py-3 rounded-xl shadow-sm border flex items-center gap-4">
                <div>
                    <p className="text-xs text-gray-400 font-bold uppercase">Điểm tích lũy</p>
                    <p className="text-2xl font-black text-yellow-600 flex items-center gap-1">
                        {user.points.toLocaleString()} <Sparkles className="h-4 w-4 fill-yellow-600"/>
                    </p>
                </div>
                <div className="h-8 w-px bg-gray-200"></div>
                <div>
                     <p className="text-xs text-gray-400 font-bold uppercase">Tổng chi tiêu</p>
                     <p className="text-lg font-bold text-gray-900">{totalSpent.toLocaleString()}đ</p>
                </div>
            </div>
        </div>

        {/* CÁC Ô CHỨC NĂNG (BẤM ĐƯỢC) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            
            {/* 1. LỊCH SỬ ĐẶT PHÒNG */}
            <Link href="/dashboard/history">
                <Card className="hover:shadow-lg transition-all cursor-pointer border-indigo-100 group h-full">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Chuyến đi của tôi</CardTitle>
                        <CalendarDays className="h-5 w-5 text-indigo-600 group-hover:scale-110 transition-transform" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalTrips} chuyến</div>
                        <p className="text-xs text-gray-500 mt-1">Xem lại lịch sử đặt phòng</p>
                    </CardContent>
                </Card>
            </Link>

            {/* 2. VÍ VOUCHER */}
            <Link href="/dashboard/vouchers"> 
                {/* Boss cần tạo trang /dashboard/vouchers hoặc trỏ về trang search có voucher */}
                <Card className="hover:shadow-lg transition-all cursor-pointer border-indigo-100 group h-full">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Ví Voucher</CardTitle>
                        <Ticket className="h-5 w-5 text-indigo-600 group-hover:scale-110 transition-transform" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{user.vouchers.length} mã</div>
                        <p className="text-xs text-gray-500 mt-1">Ưu đãi đang có sẵn</p>
                    </CardContent>
                </Card>
            </Link>

            {/* 3. GỢI Ý NỔI BẬT */}
            <div className="relative group cursor-pointer">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl blur opacity-30 group-hover:opacity-75 transition duration-1000"></div>
                <Card className="relative h-full border-none bg-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
                            Gợi ý nổi bật
                        </CardTitle>
                        <Sparkles className="h-5 w-5 text-purple-600 animate-pulse" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm font-medium text-gray-800 mb-2">
                            “Đà Lạt đang có thời tiết rất đẹp (18°C). Bạn có muốn tìm phòng view hồ không?”
                        </div>
                        <Link href="/search?q=Đà Lạt">
                            <Button size="sm" className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 border-none">
                                Xem ngay 10 khách sạn Hot
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>

        {/* DANH SÁCH ĐẶT PHÒNG GẦN ĐÂY */}
        <div className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
                <MapPin className="text-gray-400"/> Hoạt động gần đây
            </h2>
            
            {user.bookings.length > 0 ? (
                <div className="grid gap-4">
                    {user.bookings.map((booking) => (
                        <div key={booking.id} className="bg-white p-4 rounded-xl shadow-sm border flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4 w-full">
                                <img src={booking.hotel.images[0]} className="w-16 h-16 rounded-lg object-cover" />
                                <div>
                                    <h3 className="font-bold text-gray-900">{booking.hotel.name}</h3>
                                    <p className="text-sm text-gray-500">
                                        {new Date(booking.checkIn).toLocaleDateString('vi-VN')} - {new Date(booking.checkOut).toLocaleDateString('vi-VN')}
                                    </p>
                                    <p className={`text-xs font-bold mt-1 ${
                                        booking.status === 'CONFIRMED' ? 'text-green-600' : 
                                        booking.status === 'PENDING' ? 'text-yellow-600' : 'text-red-600'
                                    }`}>
                                        {booking.status === 'CONFIRMED' ? 'Đã xác nhận' : booking.status === 'PENDING' ? 'Chờ thanh toán' : 'Đã hủy'}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right min-w-[120px]">
                                <p className="font-bold text-indigo-600">{booking.totalPrice.toLocaleString()}đ</p>
                                <Link href={`/payment/${booking.id}`}>
                                    <Button variant="outline" size="sm" className="mt-2 w-full">Chi tiết</Button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 bg-white rounded-xl border border-dashed">
                    <p className="text-gray-500">Bạn chưa có chuyến đi nào.</p>
                    <Link href="/">
                        <Button className="mt-4">Khám phá ngay</Button>
                    </Link>
                </div>
            )}
        </div>
      </main>
    </div>
  );
}