import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createPaymentIntent } from "@/lib/stripe";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
    }

    const body = await req.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json({ error: "Thiếu bookingId" }, { status: 400 });
    }

    // Verify booking exists and belongs to user
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        userId: session.user.id,
      },
      include: {
        hotel: { select: { name: true } },
        room: { select: { name: true } },
        payment: { select: { status: true } },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Đơn đặt phòng không tồn tại hoặc không thuộc về bạn" },
        { status: 404 }
      );
    }

    // Check if already paid
    if (booking.payment?.status === "PAID") {
      return NextResponse.json(
        { error: "Đơn đặt phòng đã được thanh toán" },
        { status: 400 }
      );
    }

    // Check if cancelled
    if (booking.status === "CANCELLED") {
      return NextResponse.json(
        { error: "Đơn đặt phòng đã bị hủy" },
        { status: 400 }
      );
    }

    // Create Stripe payment intent
    // Convert VND to smallest currency unit (VND doesn't have decimals, so just use the amount)
    const amountInVND = Math.round(booking.totalPrice);

    // For demo purposes, if Stripe is not configured, return a mock response
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === "sk_test_placeholder") {
      // Demo mode - simulate payment
      return NextResponse.json({
        clientSecret: `demo_pi_${bookingId}_secret_${Date.now()}`,
        paymentIntentId: `demo_pi_${bookingId}`,
        amount: amountInVND,
        currency: "vnd",
        isDemo: true,
        message: "Demo mode - Stripe chưa được cấu hình. Đây là payment intent demo.",
      });
    }

    const { clientSecret, paymentIntentId } = await createPaymentIntent(amountInVND, "vnd", {
      bookingId: booking.id,
      userId: session.user.id,
      hotelName: booking.hotel.name,
      roomName: booking.room.name,
    });

    return NextResponse.json({
      clientSecret,
      paymentIntentId,
      amount: amountInVND,
      currency: "vnd",
    });
  } catch (error) {
    console.error("Stripe payment intent error:", error);
    return NextResponse.json(
      { error: "Lỗi khi tạo thanh toán" },
      { status: 500 }
    );
  }
}

