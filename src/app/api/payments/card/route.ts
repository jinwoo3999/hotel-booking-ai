import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// POST - Xử lý thanh toán thẻ tự động (demo)
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập để thanh toán" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { bookingId, cardType = "VISA", cardNumber, expiryDate, cvv } = body;

    if (!bookingId) {
      return NextResponse.json(
        { error: "Thiếu thông tin booking" },
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
        hotel: { select: { name: true } },
        room: { select: { name: true } },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Đơn đặt phòng không tồn tại hoặc không thuộc về bạn" },
        { status: 404 }
      );
    }

    // Check if already processed
    if (booking.status === "CONFIRMED" || booking.payment?.status === "PAID") {
      return NextResponse.json(
        { error: "Đơn đặt phòng đã được thanh toán" },
        { status: 400 }
      );
    }

    if (booking.status === "CANCELLED") {
      return NextResponse.json(
        { error: "Đơn đặt phòng đã bị hủy" },
        { status: 400 }
      );
    }

    console.log("🔄 Processing card payment:", { bookingId, cardType, amount: booking.totalPrice });

    // Simulate card validation (in real app, this would validate with payment gateway)
    const isCardValid = cardNumber && cardNumber.length >= 16 && expiryDate && cvv;
    
    if (!isCardValid) {
      return NextResponse.json(
        { error: "Thông tin thẻ không hợp lệ" },
        { status: 400 }
      );
    }

    // Simulate payment processing (90% success rate for demo)
    const isPaymentSuccessful = Math.random() > 0.1;
    const transactionRef = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    if (isPaymentSuccessful) {
      // Update payment status
      const updatedPayment = await prisma.payment.upsert({
        where: { bookingId },
        create: {
          bookingId,
          amount: booking.totalPrice,
          currency: "VND",
          method: `CARD_${cardType}`,
          status: "PAID",
          providerRef: transactionRef
        },
        update: {
          status: "PAID",
          method: `CARD_${cardType}`,
          providerRef: transactionRef
        }
      });

      // Update booking status to confirmed
      const updatedBooking = await prisma.booking.update({
        where: { id: bookingId },
        data: { 
          status: "CONFIRMED",
          paymentMethod: "PAY_NOW"
        }
      });

      // Award loyalty points (1 point per 100,000 VND)
      const pointsEarned = Math.floor(booking.totalPrice / 100000);
      if (pointsEarned > 0) {
        await prisma.user.update({
          where: { id: session.user.id },
          data: { points: { increment: pointsEarned } }
        });
      }

      console.log("✅ Card payment successful:", transactionRef);

      return NextResponse.json({
        success: true,
        message: "Thanh toán thẻ thành công! Đặt phòng đã được xác nhận.",
        booking: updatedBooking,
        payment: updatedPayment,
        pointsEarned,
        transactionRef
      });

    } else {
      // Payment failed - update payment status
      await prisma.payment.upsert({
        where: { bookingId },
        create: {
          bookingId,
          amount: booking.totalPrice,
          currency: "VND",
          method: `CARD_${cardType}`,
          status: "CANCELLED",
          providerRef: transactionRef
        },
        update: {
          status: "CANCELLED",
          method: `CARD_${cardType}`,
          providerRef: transactionRef
        }
      });

      console.log("❌ Card payment failed:", transactionRef);

      return NextResponse.json({
        success: false,
        error: "Thanh toán thẻ thất bại. Vui lòng kiểm tra thông tin thẻ và thử lại.",
        transactionRef
      }, { status: 400 });
    }

  } catch (error) {
    console.error("Card payment processing error:", error);
    return NextResponse.json(
      { error: "Lỗi khi xử lý thanh toán thẻ" },
      { status: 500 }
    );
  }
}