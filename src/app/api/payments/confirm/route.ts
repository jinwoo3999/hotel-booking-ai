import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// POST - Xác nhận thanh toán
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập để xác nhận thanh toán" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { bookingId, paymentMethod } = body;

    if (!bookingId) {
      return NextResponse.json(
        { error: "Thiếu bookingId" },
        { status: 400 }
      );
    }

    // Verify booking exists and belongs to user
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        userId: session.user.id,
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

    // Check if already cancelled
    if (booking.status === "CANCELLED") {
      return NextResponse.json(
        { error: "Đơn đặt phòng đã bị hủy" },
        { status: 400 }
      );
    }

    // Check if already confirmed/paid
    if (booking.payment?.status === "PAID") {
      return NextResponse.json(
        { error: "Đơn đặt phòng đã được thanh toán" },
        { status: 400 }
      );
    }

    // Update payment status
    const updatedPayment = await prisma.payment.upsert({
      where: { bookingId },
      create: {
        bookingId,
        amount: booking.totalPrice,
        currency: "VND",
        method: paymentMethod || "DEMO_CONFIRM",
        status: "PAID",
      },
      update: {
        status: "PAID",
        method: paymentMethod || "DEMO_CONFIRM",
      },
    });

    // Update booking status to confirmed
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "CONFIRMED",
        paymentMethod: paymentMethod === "PAY_NOW" ? "PAY_NOW" : "PAY_AT_HOTEL",
      },
    });

    // Award loyalty points (1 point per 100,000 VND)
    const pointsEarned = Math.floor(booking.totalPrice / 100000);
    if (pointsEarned > 0) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          points: { increment: pointsEarned },
        },
      });
    }

    return NextResponse.json({
      message: "Xác nhận thanh toán thành công",
      booking: updatedBooking,
      payment: updatedPayment,
      pointsEarned,
    });
  } catch (error) {
    console.error("Payment confirmation error:", error);
    return NextResponse.json(
      { error: "Lỗi khi xác nhận thanh toán" },
      { status: 500 }
    );
  }
}

// GET - Lấy thông tin thanh toán của booking
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
    const bookingId = searchParams.get("bookingId");

    if (!bookingId) {
      return NextResponse.json(
        { error: "Thiếu bookingId" },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        userId: session.user.id,
      },
      include: {
        payment: true,
        hotel: { select: { name: true, city: true, address: true } },
        room: { select: { name: true, images: true } },
        voucher: { select: { code: true, discount: true, type: true } },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Đơn đặt phòng không tồn tại" },
        { status: 404 }
      );
    }

    // Get policy for refund info
    const policy = await prisma.policy.findUnique({
      where: { id: "default" },
    });

    return NextResponse.json({
      booking,
      payment: booking.payment,
      policy,
      canCancel: booking.status !== "CANCELLED" && booking.payment?.status !== "PAID",
    });
  } catch (error) {
    console.error("Get payment info error:", error);
    return NextResponse.json(
      { error: "Lỗi khi lấy thông tin thanh toán" },
      { status: 500 }
    );
  }
}

