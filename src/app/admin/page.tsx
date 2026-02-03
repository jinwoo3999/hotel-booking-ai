import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, Calendar, Hotel, TrendingUp, TrendingDown, Clock, CheckCircle, XCircle, Star } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { startOfMonth, endOfMonth, subDays, format } from "date-fns";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session || !["ADMIN", "SUPER_ADMIN", "PARTNER"].includes(session.user.role)) {
    redirect("/");
  }

  const now = new Date();
  const startOfThisMonth = startOfMonth(now);
  const endOfThisMonth = endOfMonth(now);
  const startOfLastMonth = startOfMonth(subDays(startOfThisMonth, 1));

  // Phân quyền: SuperAdmin thấy tất cả, Partner chỉ thấy của mình
  const isAdmin = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN";
  const isPartner = session.user.role === "PARTNER";

  // Base filter cho Partner (chỉ khách sạn của mình)
  const partnerFilter = isPartner ? { hotel: { ownerId: session.user.id } } : {};
  const hotelFilter = isPartner ? { ownerId: session.user.id } : {};

  // Fetch comprehensive stats với phân quyền
  const [
    totalRevenue,
    monthlyRevenue,
    userCount,
    hotelCount,
    bookingCount,
    pendingBookings,
    cancelledBookings,
    confirmedBookings,
    recentBookings,
    topHotels,
    bookingStatusBreakdown,
    lastMonthRevenue,
  ] = await Promise.all([
    // Total confirmed revenue (Partner: chỉ từ khách sạn của mình)
    prisma.booking.aggregate({
      _sum: { totalPrice: true },
      where: { 
        status: "CONFIRMED",
        ...partnerFilter
      }
    }),
    // This month revenue (Partner: chỉ từ khách sạn của mình)
    prisma.booking.aggregate({
      _sum: { totalPrice: true },
      where: { 
        status: "CONFIRMED",
        createdAt: { gte: startOfThisMonth, lte: endOfThisMonth },
        ...partnerFilter
      }
    }),
    // User count (Partner không cần thấy)
    isAdmin ? prisma.user.count({ where: { role: "USER" } }) : Promise.resolve(0),
    // Hotel count (Partner: chỉ khách sạn của mình)
    prisma.hotel.count({ where: hotelFilter }),
    // Total bookings (Partner: chỉ từ khách sạn của mình)
    prisma.booking.count({ where: partnerFilter }),
    // Pending bookings (Partner: chỉ từ khách sạn của mình)
    prisma.booking.count({ 
      where: { 
        status: "PENDING",
        ...partnerFilter
      }
    }),
    // Cancelled bookings (Partner: chỉ từ khách sạn của mình)
    prisma.booking.count({ 
      where: { 
        status: "CANCELLED",
        ...partnerFilter
      }
    }),
    // Confirmed bookings (Partner: chỉ từ khách sạn của mình)
    prisma.booking.count({ 
      where: { 
        status: "CONFIRMED",
        ...partnerFilter
      }
    }),
    // Recent bookings (Partner: chỉ từ khách sạn của mình)
    prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      where: partnerFilter,
      include: {
        hotel: { select: { name: true, city: true } },
        user: { select: { name: true, email: true } },
        room: { select: { name: true } }
      }
    }),
    // Top hotels by bookings (Partner: chỉ khách sạn của mình)
    prisma.hotel.findMany({
      take: 5,
      where: hotelFilter,
      orderBy: { bookings: { _count: "desc" } },
      include: {
        _count: { select: { bookings: true } },
        rooms: { select: { price: true } }
      }
    }),
    // Booking status breakdown (Partner: chỉ từ khách sạn của mình)
    prisma.booking.groupBy({
      by: ["status"],
      where: partnerFilter,
      _count: { status: true }
    }),
    // Last month revenue for comparison (Partner: chỉ từ khách sạn của mình)
    prisma.booking.aggregate({
      _sum: { totalPrice: true },
      where: { 
        status: "CONFIRMED",
        createdAt: { gte: startOfLastMonth, lt: startOfThisMonth },
        ...partnerFilter
      }
    }),
  ]);

  // Calculate metrics
  const totalRevenueValue = totalRevenue._sum.totalPrice || 0;
  const monthlyRevenueValue = monthlyRevenue._sum.totalPrice || 0;
  const lastMonthRevenueValue = lastMonthRevenue._sum.totalPrice || 0;
  const revenueGrowth = lastMonthRevenueValue > 0 
    ? ((monthlyRevenueValue - lastMonthRevenueValue) / lastMonthRevenueValue) * 100 
    : 0;

  // Tạo stats array khác nhau cho từng role
  const baseStats = [
    { 
      title: isPartner ? "Doanh Thu Của Tôi" : "Doanh Thu Tổng", 
      value: `${totalRevenueValue.toLocaleString()} đ`, 
      icon: DollarSign, 
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    { 
      title: isPartner ? "Doanh Thu Tháng Này" : "Doanh Thu Tháng", 
      value: `${monthlyRevenueValue.toLocaleString()} đ`, 
      icon: TrendingUp, 
      color: revenueGrowth >= 0 ? "text-green-600" : "text-red-600",
      bgColor: revenueGrowth >= 0 ? "bg-green-100" : "bg-red-100",
      trend: revenueGrowth
    },
    { 
      title: isPartner ? "Khách Sạn Của Tôi" : "Tổng Khách Sạn", 
      value: hotelCount.toLocaleString(), 
      icon: Hotel, 
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    { 
      title: isPartner ? "Đơn Đặt Của Tôi" : "Tổng Đơn Đặt", 
      value: bookingCount.toLocaleString(), 
      icon: Calendar, 
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    },
    { 
      title: "Chờ Xác Nhận", 
      value: pendingBookings.toLocaleString(), 
      icon: Clock, 
      color: "text-yellow-600",
      bgColor: "bg-yellow-100"
    },
    { 
      title: "Đã Xác Nhận", 
      value: confirmedBookings.toLocaleString(), 
      icon: CheckCircle, 
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    { 
      title: "Đã Hủy", 
      value: cancelledBookings.toLocaleString(), 
      icon: XCircle, 
      color: "text-red-600",
      bgColor: "bg-red-100"
    },
  ];

  // Chỉ SuperAdmin mới thấy thống kê khách hàng
  const stats = isAdmin ? [
    ...baseStats.slice(0, 2), // Doanh thu
    { 
      title: "Tổng Khách Hàng", 
      value: userCount.toLocaleString(), 
      icon: Users, 
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    ...baseStats.slice(2) // Khách sạn và booking stats
  ] : baseStats;

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    PENDING_PAYMENT: "bg-blue-100 text-blue-800",
    CONFIRMED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  };

  const statusLabels: Record<string, string> = {
    PENDING: "Chờ xác nhận",
    PENDING_PAYMENT: "Chờ thanh toán",
    CONFIRMED: "Đã xác nhận",
    CANCELLED: "Đã hủy",
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            {isPartner ? "📊 Dashboard Partner" : "📊 Dashboard Super Admin"}
          </h2>
          <p className="text-gray-600 mt-1">
            {isPartner 
              ? "Báo cáo doanh thu và thống kê khách sạn của bạn" 
              : "Báo cáo tổng quan toàn hệ thống"
            }
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">
            Cập nhật lần cuối: {format(now, "dd/MM/yyyy HH:mm")}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Đăng nhập với quyền: <span className="font-medium text-indigo-600">{session.user.role}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((item, i) => (
          <Card key={i} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{item.title}</CardTitle>
              <div className={`p-2 rounded-lg ${item.bgColor}`}>
                <item.icon className={`h-4 w-4 ${item.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
              {item.trend !== undefined && (
                <div className={`text-xs mt-1 flex items-center gap-1 ${item.trend >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {item.trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {item.trend >= 0 ? "+" : ""}{item.trend.toFixed(1)}% so với tháng trước
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Chart Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>
              💰 {isPartner ? "Doanh Thu Khách Sạn Của Tôi" : "Doanh Thu Toàn Hệ Thống"} - 6 Tháng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-2">
              {[45, 62, 38, 90, 75, 100].map((height, i) => (
                <div key={i} className="flex flex-col items-center gap-2 flex-1">
                  <div 
                    className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-lg transition-all hover:from-indigo-700 hover:to-indigo-500"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-xs text-gray-500">
                    {format(subDays(now, 5 * 30 - i * 30), "MMM")}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center text-sm text-gray-500">
              Biểu đồ doanh thu theo tháng
            </div>
          </CardContent>
        </Card>

        {/* Booking Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>
              📈 {isPartner ? "Trạng Thái Đặt Phòng Của Tôi" : "Trạng Thái Đặt Phòng Toàn Hệ Thống"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bookingStatusBreakdown.map((item) => {
                const percentage = bookingCount > 0 ? (item._count.status / bookingCount) * 100 : 0;
                return (
                  <div key={item.status} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[item.status] || "bg-gray-100"}`}>
                        {statusLabels[item.status] || item.status}
                      </span>
                      <span className="font-medium">{item._count.status} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${
                          item.status === "CONFIRMED" ? "bg-green-500" :
                          item.status === "PENDING" ? "bg-yellow-500" :
                          item.status === "CANCELLED" ? "bg-red-500" : "bg-blue-500"
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>
              🕒 {isPartner ? "Đặt Phòng Gần Đây Của Tôi" : "Đặt Phòng Gần Đây Toàn Hệ Thống"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBookings.length > 0 ? recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{booking.hotel.name}</div>
                    <div className="text-sm text-gray-500">
                      {booking.user.name} • {booking.room.name}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(booking.createdAt).toLocaleDateString("vi-VN")}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-indigo-600">{booking.totalPrice.toLocaleString()} đ</div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[booking.status]}`}>
                      {statusLabels[booking.status]}
                    </span>
                  </div>
                </div>
              )) : (
                <div className="text-center text-gray-500 py-4">Chưa có đặt phòng nào</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Hotels */}
        <Card>
          <CardHeader>
            <CardTitle>
              🏆 {isPartner ? "Khách Sạn Của Tôi Theo Đơn" : "Top Khách Sạn Toàn Hệ Thống"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topHotels.length > 0 ? topHotels.map((hotel, i) => {
                const prices = hotel.rooms.map((r) => r.price).filter((p) => p > 0);
                const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
                return (
                  <div key={hotel.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm">
                        {i + 1}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{hotel.name}</div>
                        <div className="text-sm text-gray-500">{hotel.city}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="font-medium">{hotel.rating}</span>
                      </div>
                      <div className="text-sm text-gray-500">{hotel._count.bookings} đơn</div>
                    </div>
                  </div>
                );
              }) : (
                <div className="text-center text-gray-500 py-4">Chưa có khách sạn nào</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>⚡ Thao Tác Nhanh</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a href="/admin/hotels" className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              <Hotel className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-900">
                {isPartner ? "Khách sạn của tôi" : "Quản lý Khách sạn"}
              </span>
            </a>
            <a href="/admin/bookings" className="flex items-center gap-2 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <Calendar className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-900">
                {isPartner ? "Đơn đặt của tôi" : "Quản lý Booking"}
              </span>
            </a>
            {isAdmin && (
              <a href="/admin/users" className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <Users className="h-5 w-5 text-purple-600" />
                <span className="font-medium text-purple-900">Quản lý User</span>
              </a>
            )}
            {isAdmin && (
              <a href="/admin/partner-apps" className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                <Users className="h-5 w-5 text-orange-600" />
                <span className="font-medium text-orange-900">Đơn Partner</span>
              </a>
            )}
            {isAdmin && (
              <a href="/admin/settings" className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <TrendingUp className="h-5 w-5 text-gray-600" />
                <span className="font-medium text-gray-900">Cài đặt</span>
              </a>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}