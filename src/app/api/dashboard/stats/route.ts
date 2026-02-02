import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { subDays, startOfDay, endOfDay, format } from "date-fns";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "30"; // days
    const days = parseInt(period);
    const startDate = startOfDay(subDays(new Date(), days));
    const endDate = endOfDay(new Date());

    const { role, id: userId } = session.user;

    // Build role-based filters
    const bookingWhere = role === "PARTNER" ? { hotel: { ownerId: userId } } : {};
    const hotelWhere = role === "PARTNER" ? { ownerId: userId } : {};
    const roomWhereForInventory = role === "PARTNER" ? { hotel: { ownerId: userId } } : {};

    // Core stats
    const [
      revenueData,
      bookingCount,
      hotelCount,
      customerCount,
      recentBookings,
      monthlyRevenue,
      topHotels,
      bookingStatusBreakdown,
      roomUtilization,
    ] = await Promise.all([
      // Total revenue from confirmed bookings
      prisma.booking.aggregate({
        _sum: { totalPrice: true },
        where: {
          ...bookingWhere,
          status: "CONFIRMED",
          createdAt: { gte: startDate, lte: endDate },
        },
      }),

      // Total bookings
      prisma.booking.count({
        where: {
          ...bookingWhere,
          createdAt: { gte: startDate, lte: endDate },
        },
      }),

      // Total hotels (for partners) or all hotels (for admins)
      prisma.hotel.count({ where: hotelWhere }),

      // Customer count
      role === "SUPER_ADMIN"
        ? prisma.user.count({ where: { role: "USER" } })
        : prisma.booking.groupBy({
            by: ["userId"],
            where: { hotel: { ownerId: userId } },
          }).then((res) => res.length),

      // Recent bookings
      prisma.booking.findMany({
        where: {
          ...bookingWhere,
          createdAt: { gte: startDate, lte: endDate },
        },
        include: {
          hotel: { select: { name: true } },
          room: { select: { name: true } },
          user: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),

      // Monthly revenue breakdown
      prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('day', "createdAt") as date,
          SUM("totalPrice") as revenue,
          COUNT(*) as bookings
        FROM "Booking"
        WHERE 
          "createdAt" >= ${startDate}
          AND "createdAt" <= ${endDate}
          ${role === "PARTNER" ? `AND "hotelId" IN (SELECT id FROM "Hotel" WHERE "ownerId" = '${userId}')` : ""}
        GROUP BY DATE_TRUNC('day', "createdAt")
        ORDER BY date ASC
      ` as Promise<Array<{ date: Date; revenue: number; bookings: number }>>,

      // Top performing hotels
      prisma.hotel.findMany({
        where: { ...hotelWhere, status: "ACTIVE" },
        include: {
          _count: { select: { bookings: true } },
          rooms: { select: { price: true } },
        },
        orderBy: {
          bookings: { _count: "desc" },
        },
        take: 5,
      }),

      // Booking status breakdown
      prisma.booking.groupBy({
        by: ["status"],
        where: { ...bookingWhere },
        _count: { status: true },
      }),

      // Room utilization
      prisma.roomInventory.aggregate({
        _avg: {
          booked: true,
        },
        where: {
          date: { gte: startDate, lte: endDate },
          room: roomWhereForInventory,
        },
      }),
    ]);

    // Process monthly revenue
    const revenueChart = Array.isArray(monthlyRevenue)
      ? monthlyRevenue.map((item) => ({
          date: format(new Date(item.date), "yyyy-MM-dd"),
          revenue: Number(item.revenue) || 0,
          bookings: Number(item.bookings) || 0,
        }))
      : [];

    // Process top hotels
    const processedTopHotels = topHotels.map((hotel) => {
      const prices = hotel.rooms.map((r) => r.price).filter((p) => p > 0);
      return {
        id: hotel.id,
        name: hotel.name,
        city: hotel.city,
        totalBookings: hotel._count.bookings,
        avgPrice: prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0,
      };
    });

    // Process status breakdown
    const statusBreakdown = bookingStatusBreakdown.reduce((acc, item) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {} as Record<string, number>);

    // Calculate growth percentages (compared to previous period)
    const previousPeriodStart = subDays(startDate, days);
    const previousRevenue = await prisma.booking.aggregate({
      _sum: { totalPrice: true },
      where: {
        ...bookingWhere,
        status: "CONFIRMED",
        createdAt: { gte: previousPeriodStart, lt: startDate },
      },
    });

    const currentRevenue = Number(revenueData._sum.totalPrice) || 0;
    const prevRevenue = Number(previousRevenue._sum.totalPrice) || 0;
    const revenueGrowth = prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue) * 100 : 0;

    return NextResponse.json({
      summary: {
        totalRevenue: currentRevenue,
        totalBookings: bookingCount,
        totalHotels: hotelCount,
        totalCustomers: customerCount,
        revenueGrowth: Math.round(revenueGrowth * 100) / 100,
        averageBookingValue: bookingCount > 0 ? Math.round(currentRevenue / bookingCount) : 0,
        roomUtilization: Number(roomUtilization._avg?.booked) || 0,
      },
      statusBreakdown,
      revenueChart,
      topHotels: processedTopHotels,
      recentBookings: recentBookings.map((booking) => ({
        id: booking.id,
        hotelName: booking.hotel.name,
        roomName: booking.room.name,
        userName: booking.user.name,
        userEmail: booking.user.email,
        totalPrice: booking.totalPrice,
        status: booking.status,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        createdAt: booking.createdAt,
      })),
      period: {
        start: startDate,
        end: endDate,
        days,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Lỗi khi lấy thống kê dashboard" },
      { status: 500 }
    );
  }
}

