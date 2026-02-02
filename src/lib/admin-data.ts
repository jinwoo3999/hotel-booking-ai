import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { BookingStatus } from "@prisma/client";

export async function getAdminBookings() {
  const session = await auth();
  if (!session?.user) return [];

  const { role, id: userId } = session.user;
  const queryInclude = { hotel: true, user: true, room: true };

  if (role === "SUPER_ADMIN") {
    return await prisma.booking.findMany({
      include: queryInclude,
      orderBy: { createdAt: "desc" },
    });
  } 
  
  if (role === "PARTNER") {
    return await prisma.booking.findMany({
      where: { hotel: { ownerId: userId } },
      include: queryInclude,
      orderBy: { createdAt: "desc" },
    });
  }

  return [];
}

export async function getAdminHotels() {
  const session = await auth();
  if (!session?.user) return [];

  const { role, id: userId } = session.user;

  if (role === "SUPER_ADMIN") {
    return await prisma.hotel.findMany({
      include: { _count: { select: { rooms: true, bookings: true } } },
      orderBy: { createdAt: "desc" }
    });
  }

  if (role === "PARTNER") {
    return await prisma.hotel.findMany({
      where: { ownerId: userId },
      include: { _count: { select: { rooms: true, bookings: true } } },
      orderBy: { createdAt: "desc" }
    });
  }

  return [];
}

export async function getAdminUsers() {
  const session = await auth();
  if (!session?.user) return [];

  if (session.user.role === "SUPER_ADMIN") {
    return await prisma.user.findMany({
      include: { _count: { select: { bookings: true } } },
      orderBy: { createdAt: "desc" }
    });
  }

  return [];
}

export async function getDashboardStats() {
  const session = await auth();
  if (!session?.user) return { revenue: 0, bookings: 0, customers: 0, hotels: 0 };

  const { role, id: userId } = session.user;

  const bookingWhere = role === "PARTNER" ? { hotel: { ownerId: userId } } : {};
  const hotelWhere = role === "PARTNER" ? { ownerId: userId } : {};

  const [revenueData, bookingCount, hotelCount] = await Promise.all([
    prisma.booking.aggregate({
      _sum: { totalPrice: true },
      where: {
        ...bookingWhere,
        // Lưu ý: BookingStatus không có COMPLETED trong dự án này
        // Doanh thu chỉ dựa trên booking đã xác nhận
        status: { in: [BookingStatus.CONFIRMED] }
      }
    }),
    prisma.booking.count({ where: bookingWhere }),
    prisma.hotel.count({ where: hotelWhere }),
  ]);

  let customerCount = 0;
  if (role === "SUPER_ADMIN") {
    customerCount = await prisma.user.count({ where: { role: "USER" } });
  } else if (role === "PARTNER") {
    const uniqueGuests = await prisma.booking.groupBy({
      by: ['userId'],
      where: { hotel: { ownerId: userId } }
    });
    customerCount = uniqueGuests.length;
  }

  return {
    revenue: revenueData._sum.totalPrice || 0,
    bookings: bookingCount,
    hotels: hotelCount,
    customers: customerCount
  };
}