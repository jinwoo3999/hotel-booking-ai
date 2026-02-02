import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { BookingStatus } from "@prisma/client";

// GET - Lấy danh sách booking cho admin/partner
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập" },
        { status: 401 }
      );
    }

    const { role, id: userId } = session.user;
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const hotelId = searchParams.get("hotelId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Build role-based filters
    const where: Record<string, unknown> = {};

    if (role === "PARTNER") {
      where.hotel = { ownerId: userId };
    }
    // SUPER_ADMIN and ADMIN can see all bookings

    if (hotelId) {
      where.hotelId = hotelId;
    }

    if (status && status !== "all") {
      where.status = status as BookingStatus;
    }

    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          hotel: {
            select: {
              id: true,
              name: true,
              city: true,
              ownerId: true,
            },
          },
          room: {
            select: {
              id: true,
              name: true,
              price: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          payment: {
            select: {
              id: true,
              status: true,
              method: true,
              amount: true,
            },
          },
          voucher: {
            select: {
              code: true,
              discount: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ]);

    // Get status breakdown
    const statusBreakdown = await prisma.booking.groupBy({
      by: ["status"],
      where: role === "PARTNER" ? { hotel: { ownerId: userId } } : {},
      _count: { status: true },
    });

    const stats = statusBreakdown.reduce((acc, item) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      data: bookings,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      stats,
    });
  } catch (error) {
    console.error("Get admin bookings error:", error);
    return NextResponse.json(
      { error: "Lỗi khi lấy danh sách đặt phòng" },
      { status: 500 }
    );
  }
}

// PUT - Cập nhật trạng thái booking (Admin/Partner only)
export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập" },
        { status: 401 }
      );
    }

    const { role, id: userId } = session.user;
    if (role !== "ADMIN" && role !== "SUPER_ADMIN" && role !== "PARTNER") {
      return NextResponse.json(
        { error: "Không có quyền thực hiện" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { bookingId, status } = body;

    if (!bookingId || !status) {
      return NextResponse.json(
        { error: "Thiếu bookingId hoặc status" },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ["PENDING", "PENDING_PAYMENT", "CONFIRMED", "CANCELLED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Trạng thái không hợp lệ" },
        { status: 400 }
      );
    }

    // Find booking with hotel ownership check for partners
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        ...(role === "PARTNER" ? { hotel: { ownerId: userId } } : {}),
      },
      include: {
        payment: true,
        hotel: { select: { ownerId: true } },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Đơn đặt phòng không tồn tại hoặc không thuộc về bạn" },
        { status: 404 }
      );
    }

    // Perform update in transaction
    const result = await prisma.$transaction(async (tx) => {
      // If confirming booking, update payment to PAID
      if (status === "CONFIRMED") {
        await tx.payment.upsert({
          where: { bookingId },
          create: {
            bookingId,
            amount: booking.totalPrice,
            currency: "VND",
            method: "ADMIN_CONFIRM",
            status: "PAID",
          },
          update: {
            status: "PAID",
            method: "ADMIN_CONFIRM",
          },
        });
      }

      // If cancelling, release inventory
      if (status === "CANCELLED" && booking.status !== "CANCELLED") {
        const { enumerateNights, releaseRoomInventory } = await import("@/lib/inventory");
        const nights = enumerateNights(booking.checkIn, booking.checkOut);
        if (nights.length > 0) {
          await releaseRoomInventory(tx, booking.roomId, nights);
        }

        // Release voucher usage
        if (booking.voucherId) {
          await tx.voucher.updateMany({
            where: { id: booking.voucherId, usedCount: { gt: 0 } },
            data: { usedCount: { decrement: 1 } },
          });
        }

        // Cancel payment if pending
        if (booking.payment) {
          await tx.payment.update({
            where: { id: booking.payment.id },
            data: { status: "CANCELLED" },
          });
        }
      }

      // Update booking status
      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: { status: status as BookingStatus },
      });

      return updatedBooking;
    });

    return NextResponse.json({
      message: "Cập nhật trạng thái thành công",
      booking: result,
    });
  } catch (error) {
    console.error("Update booking status error:", error);
    return NextResponse.json(
      { error: "Lỗi khi cập nhật trạng thái" },
      { status: 500 }
    );
  }
}

