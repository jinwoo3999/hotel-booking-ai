import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { enumerateNights, releaseRoomInventory } from "@/lib/inventory";

// POST - Hủy đặt phòng
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập để hủy đặt phòng" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { bookingId, reason } = body;

    if (!bookingId) {
      return NextResponse.json(
        { error: "Thiếu bookingId" },
        { status: 400 }
      );
    }

    // Find booking with full details
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        userId: session.user.id,
      },
      include: {
        room: true,
        hotel: { select: { ownerId: true, name: true } },
        payment: true,
        voucher: true,
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
        { error: "Đơn đặt phòng đã được hủy trước đó" },
        { status: 400 }
      );
    }

    // Get cancellation policy
    const policy = await prisma.policy.findUnique({
      where: { id: "default" },
    });

    // Check cancellation deadline
    let canCancel = true;
    let refundAmount = 0;
    let refundPercent = 100;

    if (policy) {
      const deadline = new Date(
        booking.checkIn.getTime() - policy.cancellationDeadlineHours * 60 * 60 * 1000
      );
      const now = new Date();

      if (now > deadline) {
        canCancel = false;
        refundPercent = 0;
      } else {
        refundPercent = policy.refundPercent;
      }
    }

    // For paid bookings, check if cancellation is allowed
    if (booking.payment?.status === "PAID" && !canCancel) {
      return NextResponse.json(
        {
          error: "Đã quá thời hạn hủy theo chính sách. Không thể hủy đơn đã thanh toán sau thời hạn.",
          deadline: policy ? new Date(
            booking.checkIn.getTime() - policy.cancellationDeadlineHours * 60 * 60 * 1000
          ) : null,
        },
        { status: 400 }
      );
    }

    // Perform cancellation in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Release room inventory
      const nights = enumerateNights(booking.checkIn, booking.checkOut);
      if (nights.length > 0) {
        await releaseRoomInventory(tx, booking.roomId, nights);
      }

      // Update booking status
      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: "CANCELLED",
          note: reason ? `Lý do hủy: ${reason}` : booking.note,
        },
      });

      // Update payment status if exists
      if (booking.payment) {
        await tx.payment.update({
          where: { id: booking.payment.id },
          data: { status: "CANCELLED" },
        });
      }

      // Release voucher usage if applied
      if (booking.voucherId) {
        await tx.voucher.updateMany({
          where: { id: booking.voucherId, usedCount: { gt: 0 } },
          data: { usedCount: { decrement: 1 } },
        });
      }

      // Calculate refund for paid bookings
      if (booking.payment?.status === "PAID") {
        refundAmount = Math.round((booking.totalPrice * refundPercent) / 100);
      }

      return {
        booking: updatedBooking,
        refundAmount,
        refundPercent,
      };
    });

    return NextResponse.json({
      message: "Hủy đặt phòng thành công",
      booking: result.booking,
      refund: {
        amount: result.refundAmount,
        percent: result.refundPercent,
      },
    });
  } catch (error) {
    console.error("Cancel booking error:", error);
    return NextResponse.json(
      { error: "Lỗi khi hủy đặt phòng" },
      { status: 500 }
    );
  }
}

// GET - Kiểm tra điều kiện hủy của một booking
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
        voucher: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Đơn đặt phòng không tồn tại" },
        { status: 404 }
      );
    }

    // Get policy
    const policy = await prisma.policy.findUnique({
      where: { id: "default" },
    });

    // Calculate cancellation eligibility
    const now = new Date();
    let canCancel = true;
    let deadline = null;
    let refundPercent = 100;
    let refundAmount = 0;

    if (policy) {
      deadline = new Date(
        booking.checkIn.getTime() - policy.cancellationDeadlineHours * 60 * 60 * 1000
      );
      canCancel = now < deadline;
      refundPercent = canCancel ? policy.refundPercent : 0;
    }

    if (booking.payment?.status === "PAID") {
      refundAmount = Math.round((booking.totalPrice * refundPercent) / 100);
    }

    return NextResponse.json({
      bookingId: booking.id,
      status: booking.status,
      checkIn: booking.checkIn,
      paymentStatus: booking.payment?.status,
      cancellation: {
        canCancel,
        deadline,
        refundPercent,
        refundAmount,
        policyText: policy?.refundPolicyText,
      },
    });
  } catch (error) {
    console.error("Check cancellation error:", error);
    return NextResponse.json(
      { error: "Lỗi khi kiểm tra điều kiện hủy" },
      { status: 500 }
    );
  }
}

