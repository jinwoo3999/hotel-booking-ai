import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, Calendar, Hotel, TrendingUp, TrendingDown, Clock, CheckCircle, XCircle, Star } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth, subDays, format } from "date-fns";

export default async function AdminDashboardPage() {
  const now = new Date();
  const startOfThisMonth = startOfMonth(now);
  const endOfThisMonth = endOfMonth(now);
  const startOfLastMonth = startOfMonth(subDays(startOfThisMonth, 1));

  // Fetch comprehensive stats
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
    // Total confirmed revenue
    prisma.booking.aggregate({
      _sum: { totalPrice: true },
      where: { status: "CONFIRMED" }
    }),
    // This month revenue
    prisma.booking.aggregate({
      _sum: { totalPrice: true },
      where: { 
        status: "CONFIRMED",
        createdAt: { gte: startOfThisMonth, lte: endOfThisMonth }
      }
    }),
    // User count
    prisma.user.count({ where: { role: "USER" } }),
    // Hotel count
    prisma.hotel.count(),
    // Total bookings
    prisma.booking.count(),
    // Pending bookings
    prisma.booking.count({ where: { status: "PENDING" } }),
    // Cancelled bookings
    prisma.booking.count({ where: { status: "CANCELLED" } }),
    // Confirmed bookings
    prisma.booking.count({ where: { status: "CONFIRMED" } }),
    // Recent bookings
    prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        hotel: { select: { name: true, city: true } },
        user: { select: { name: true, email: true } },
        room: { select: { name: true } }
      }
    }),
    // Top hotels by bookings
    prisma.hotel.findMany({
      take: 5,
      orderBy: { bookings: { _count: "desc" } },
      include: {
        _count: { select: { bookings: true } },
        rooms: { select: { price: true } }
      }
    }),
    // Booking status breakdown
    prisma.booking.groupBy({
      by: ["status"],
      _count: { status: true }
    }),
    // Last month revenue for comparison
    prisma.booking.aggregate({
      _sum: { totalPrice: true },
      where: { 
        status: "CONFIRMED",
        createdAt: { gte: startOfLastMonth, lt: startOfThisMonth }
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

  const stats = [
    { 
      title: "Doanh Thu Tổng", 
      value: `${totalRevenueValue.toLocaleString()} đ`, 
      icon: DollarSign, 
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    { 
      title: "Doanh Thu Tháng", 
      value: `${monthlyRevenueValue.toLocaleString()} đ`, 
      icon: TrendingUp, 
      color: revenueGrowth >= 0 ? "text-green-600" : "text-red-600",
      bgColor: revenueGrowth >= 0 ? "bg-green-100" : "bg-red-100",
      trend: revenueGrowth
    },
    { 
      title: "Khách Hàng", 
      value: userCount.toLocaleString(), 
      icon: Users, 
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    { 
      title: "Khách Sạn", 
      value: hotelCount.toLocaleString(), 
      icon: Hotel, 
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    { 
      title: "Đơn Đặt", 
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
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Dashboard Tổng Quan</h2>
        <div className="text-sm text-gray-500">
          Cập nhật lần cuối: {format(now, "dd/MM/yyyy HH:mm")}
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
            <CardTitle>Doanh Thu 6 Tháng Gần Đây</CardTitle>
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
              Biểu đồ doanh thu (dữ liệu demo)
            </div>
          </CardContent>
        </Card>

        {/* Booking Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Trạng Thái Đặt Phòng</CardTitle>
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
            <CardTitle>Đặt Phòng Gần Đây</CardTitle>
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
            <CardTitle>Top Khách Sạn Theo Đơn</CardTitle>
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
    </div>
  );
}
