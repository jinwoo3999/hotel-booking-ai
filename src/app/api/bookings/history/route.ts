import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// GET - Lấy lịch sử đặt phòng của user
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
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sortOrderParam = searchParams.get("sortOrder") || "desc";
    const orderBy = sortOrderParam === "asc" ? "asc" : "desc";

    // Build filter conditions
    const where: Record<string, unknown> = {
      userId: session.user.id,
    };

    if (status && status !== "all") {
      where.status = status;
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
              address: true,
              images: true,
            },
          },
          room: {
            select: {
              id: true,
              name: true,
              images: true,
              amenities: true,
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
              type: true,
            },
          },
        },
        orderBy: { createdAt: orderBy as "asc" | "desc" },
        skip,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ]);

    // Calculate booking stats
    const stats = await prisma.booking.groupBy({
      by: ["status"],
      where: { userId: session.user.id },
      _count: { status: true },
    });

    const statusCounts = stats.reduce((acc, item) => {
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
      stats: {
        total: total,
        pending: statusCounts["PENDING"] || 0,
        pendingPayment: statusCounts["PENDING_PAYMENT"] || 0,
        confirmed: statusCounts["CONFIRMED"] || 0,
        cancelled: statusCounts["CANCELLED"] || 0,
      },
    });
  } catch (error) {
    console.error("Get booking history error:", error);
    return NextResponse.json(
      { error: "Lỗi khi lấy lịch sử đặt phòng" },
      { status: 500 }
    );
  }
}

// GET single booking details
export async function GET_SINGLE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const booking = await prisma.booking.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        hotel: {
          select: {
            id: true,
            name: true,
            city: true,
            address: true,
            images: true,
            latitude: true,
            longitude: true,
          },
        },
        room: {
          select: {
            id: true,
            name: true,
            images: true,
            amenities: true,
            maxGuests: true,
            price: true,
          },
        },
        payment: {
          select: {
            id: true,
            status: true,
            method: true,
            amount: true,
            createdAt: true,
          },
        },
        voucher: {
          select: {
            code: true,
            discount: true,
            type: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Đơn đặt phòng không tồn tại" },
        { status: 404 }
      );
    }

    // Get policy for this booking
    const policy = await prisma.policy.findUnique({
      where: { id: "default" },
    });

    // Check if cancellation is allowed
    let cancellationInfo = null;
    if (policy && booking.status !== "CANCELLED") {
      const deadline = new Date(
        booking.checkIn.getTime() - policy.cancellationDeadlineHours * 60 * 60 * 1000
      );
      const now = new Date();
      const canCancel = now < deadline;

      cancellationInfo = {
        canCancel,
        deadline: deadline,
        refundPercent: canCancel ? policy.refundPercent : 0,
        policyText: policy.refundPolicyText,
      };
    }

    return NextResponse.json({
      booking,
      policy,
      cancellationInfo,
    });
  } catch (error) {
    console.error("Get booking details error:", error);
    return NextResponse.json(
      { error: "Lỗi khi lấy chi tiết đặt phòng" },
      { status: 500 }
    );
  }
}

