import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRoomAvailabilitySummary, enumerateNights } from "@/lib/inventory";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get("roomId");
    const checkIn = searchParams.get("checkIn");
    const checkOut = searchParams.get("checkOut");

    if (!roomId) {
      return NextResponse.json(
        { error: "Thiếu roomId" },
        { status: 400 }
      );
    }

    // Get room details
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        hotel: {
          select: {
            name: true,
            city: true,
          },
        },
      },
    });

    if (!room) {
      return NextResponse.json(
        { error: "Phòng không tồn tại" },
        { status: 404 }
      );
    }

    // If no dates provided, return room info with inventory status
    if (!checkIn || !checkOut) {
      const inventory = await prisma.roomInventory.findMany({
        where: {
          roomId,
          date: { gte: new Date() },
        },
        orderBy: { date: "asc" },
        take: 30,
      });

      return NextResponse.json({
        room: {
          id: room.id,
          name: room.name,
          hotel: room.hotel,
          price: room.price,
          maxGuests: room.maxGuests,
          quantity: room.quantity,
          amenities: room.amenities,
        },
        inventory: inventory.map((inv) => ({
          date: inv.date,
          total: inv.total,
          booked: inv.booked,
          available: inv.total - inv.booked,
        })),
      });
    }

    // Validate dates
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return NextResponse.json(
        { error: "Ngày tháng không hợp lệ" },
        { status: 400 }
      );
    }

    if (checkOutDate <= checkInDate) {
      return NextResponse.json(
        { error: "Ngày trả phải sau ngày nhận" },
        { status: 400 }
      );
    }

    // Get availability summary
    const availability = await getRoomAvailabilitySummary(roomId, checkInDate, checkOutDate);

    // Get detailed nightly availability
    const nights = enumerateNights(checkInDate, checkOutDate);
    const nightlyInventory = await prisma.roomInventory.findMany({
      where: {
        roomId,
        date: { in: nights },
      },
    });

    const nightlyDetails = nights.map((night) => {
      const inv = nightlyInventory.find(
        (i) => i.date.toISOString().split("T")[0] === night.toISOString().split("T")[0]
      );
      return {
        date: night,
        total: inv?.total || room.quantity,
        booked: inv?.booked || 0,
        available: (inv?.total || room.quantity) - (inv?.booked || 0),
        status: inv && inv.booked >= inv.total ? "FULL" : "AVAILABLE",
      };
    });

    // Calculate pricing breakdown
    const totalNights = nights.length;
    const baseAmount = room.price * totalNights;

    return NextResponse.json({
      room: {
        id: room.id,
        name: room.name,
        hotel: room.hotel,
        price: room.price,
        maxGuests: room.maxGuests,
        quantity: room.quantity,
        amenities: room.amenities,
      },
      checkIn: checkInDate,
      checkOut: checkOutDate,
      totalNights,
      summary: {
        available: availability.available,
        remainingMin: availability.remainingMin,
        baseAmount,
        nights: totalNights,
      },
      nightly: nightlyDetails,
      pricing: {
        pricePerNight: room.price,
        totalNights,
        subtotal: baseAmount,
      },
    });
  } catch (error) {
    console.error("Availability check error:", error);
    return NextResponse.json(
      { error: "Lỗi khi kiểm tra tồn kho" },
      { status: 500 }
    );
  }
}

