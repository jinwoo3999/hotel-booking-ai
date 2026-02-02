import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "create_test_booking":
        // Test booking creation with existing user
        const testUserId = "cml573g7d0002plhwnsh9cuv1"; // Khách VIP
        const testHotelId = "cml573hy20008plhwpaejarsm"; // Lumina Grand Hà Nội
        const testRoomId = "cml573hy20009plhwbi1xgmb8"; // Superior City View

        const booking = await prisma.booking.create({
          data: {
            userId: testUserId,
            hotelId: testHotelId,
            roomId: testRoomId,
            checkIn: new Date("2026-02-10"),
            checkOut: new Date("2026-02-12"),
            originalPrice: 3600000, // 2 nights * 1.8M
            totalPrice: 3600000,
            status: "PENDING",
            guestName: "Test User",
            guestPhone: "0123456789",
          },
        });

        return NextResponse.json({
          success: true,
          booking,
          paymentUrl: `/payment/${booking.id}`,
          message: "Test booking created successfully"
        });

      case "check_payment_page":
        const { bookingId } = body;
        
        // Check if booking exists
        const existingBooking = await prisma.booking.findUnique({
          where: { id: bookingId },
          include: {
            hotel: true,
            room: true,
            user: true
          }
        });

        if (!existingBooking) {
          return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }

        return NextResponse.json({
          success: true,
          booking: existingBooking,
          message: "Booking found and payment page should work"
        });

      case "cleanup_test_data":
        // Clean up test bookings
        const deletedBookings = await prisma.booking.deleteMany({
          where: {
            guestName: "Test User",
            guestPhone: "0123456789"
          }
        });

        return NextResponse.json({
          success: true,
          deletedCount: deletedBookings.count,
          message: "Test data cleaned up"
        });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

  } catch (error) {
    console.error("Test user flow error:", error);
    return NextResponse.json({ 
      error: "Test failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}