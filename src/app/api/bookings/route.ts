import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client"; 

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
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
    const { roomId, checkIn, checkOut, totalPrice } = body;

    if (!roomId || !checkIn || !checkOut || !totalPrice) {
       return NextResponse.json({ message: "Thiếu thông tin" }, { status: 400 });
    }

    const newBooking = await prisma.$transaction(async (tx: PrismaClient) => {
        // Tạo đơn
        const booking = await tx.booking.create({
            data: {
                userId: user.id,
                roomId: roomId,
                checkIn: new Date(checkIn),
                checkOut: new Date(checkOut),
                totalPrice: Number(totalPrice),
                status: "PAID", // Đã thanh toán
            },
        });

        // Cộng dồn chi tiêu cho User để tính điểm
        await tx.user.update({
            where: { id: user.id },
            data: {
                spentAmount: { increment: Number(totalPrice) } // Cộng thêm tiền vừa trả
            }
        });

        return booking;
    });
    
    return NextResponse.json(newBooking, { status: 201 });

  } catch (error: unknown) {
    console.error("Lỗi API Booking:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ message }, { status: 500 });
  }
}