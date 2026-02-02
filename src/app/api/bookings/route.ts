import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth"; 
import { enumerateNights, ensureRoomInventoryRows, reserveRoomInventoryOrThrow } from "@/lib/inventory";
import { calculateBaseAmount, calculateFees, calculateTotal, evaluateVoucher } from "@/lib/pricing";

export async function POST(req: Request) {
  try {
    const session = await auth(); 
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "Vui lòng đăng nhập" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ message: "User không tồn tại" }, { status: 404 });
    }

    const body = await req.json();
    const { hotelId, roomId, checkIn, checkOut, paymentMethod, guestName, guestPhone, note, voucherCode } = body;

    if (!hotelId || !roomId || !checkIn || !checkOut) {
       return NextResponse.json({ message: "Thiếu thông tin" }, { status: 400 });
    }

    const start = new Date(checkIn);
    const end = new Date(checkOut);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
      return NextResponse.json({ message: "Ngày tháng không hợp lệ" }, { status: 400 });
    }

    // DB-driven, race-safe booking creation with inventory reservation + payment record.
    const newBooking = await prisma.$transaction(async (tx) => {
      const room = await tx.room.findFirst({ where: { id: roomId, hotelId } });
      if (!room) {
        return null;
      }

      const nights = enumerateNights(start, end);
      if (nights.length <= 0) {
        throw new Error("INVALID_DATE_RANGE");
      }
      const policy = await tx.policy.findUnique({ where: { id: "default" } });
      const baseAmount = calculateBaseAmount(room.price, nights.length);
      const { serviceFee, tax } = calculateFees(baseAmount, policy);

      let discount = 0;
      let appliedVoucherId: string | null = null;
      if (voucherCode) {
        const voucher = await tx.voucher.findUnique({ where: { code: String(voucherCode).trim().toUpperCase() } });
        if (!voucher) throw new Error("VOUCHER_NOT_FOUND");
        const evaluation = evaluateVoucher(voucher, baseAmount);
        if (!evaluation.ok) throw new Error(evaluation.reason);
        discount = evaluation.discount;
        appliedVoucherId = voucher.id;
        await tx.voucher.update({
          where: { id: voucher.id },
          data: {
            usedCount: { increment: 1 },
            users: { connect: { id: user.id } },
          },
        });
      }

      const totalPrice = calculateTotal({ baseAmount, serviceFee, tax, discount });

      await ensureRoomInventoryRows(tx, { id: room.id, quantity: room.quantity }, nights);
      await reserveRoomInventoryOrThrow(tx, room.id, nights);

      const booking = await tx.booking.create({
        data: {
          userId: user.id,
          hotelId,
          roomId,
          checkIn: start,
          checkOut: end,
          originalPrice: baseAmount,
          discount,
          totalPrice,
          paymentMethod: paymentMethod === "PAY_NOW" ? "PAY_NOW" : "PAY_AT_HOTEL",
          // Backwards compatibility: existing UI expects "PENDING" for new bookings.
          status: "PENDING",
          guestName: guestName || user.name || "Khách",
          guestPhone: guestPhone || "",
          note: note || "",
          voucherId: appliedVoucherId,
        },
      });

      await tx.payment.create({
        data: {
          bookingId: booking.id,
          amount: totalPrice,
          currency: "VND",
          method: paymentMethod === "PAY_NOW" ? "API_PAY_NOW" : "API_PAY_AT_HOTEL",
          status: "PENDING",
        },
      });

      return booking;
    });

    if (!newBooking) {
      return NextResponse.json({ message: "Lỗi phòng" }, { status: 400 });
    }
    
    return NextResponse.json(newBooking, { status: 201 });

  } catch (error: unknown) {
    console.error("Lỗi API Booking:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ message }, { status: 500 });
  }
}