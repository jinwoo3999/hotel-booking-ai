import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * Admin endpoint để test webhook thanh toán
 * Chỉ dùng cho môi trường development/testing
 */

export async function POST(req: Request) {
  try {
    const session = await auth();
    
    // Chỉ admin mới được test
    if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role || "")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { bookingCode, amount } = body;

    if (!bookingCode) {
      return NextResponse.json(
        { error: "Missing bookingCode" },
        { status: 400 }
      );
    }

    // Tìm booking để lấy số tiền chính xác
    let bookingAmount = amount;
    
    if (!bookingAmount) {
      const allBookings = await prisma.booking.findMany({
        where: {
          status: {
            in: ["PENDING", "PENDING_PAYMENT"]
          }
        },
        select: {
          id: true,
          totalPrice: true
        }
      });
      
      const booking = allBookings.find(b => 
        b.id.slice(-6).toUpperCase() === bookingCode.toUpperCase()
      );
      
      if (booking) {
        bookingAmount = booking.totalPrice;
      } else {
        return NextResponse.json({
          success: false,
          error: "Không tìm thấy booking với mã này",
          availableBookings: allBookings.map(b => ({
            code: b.id.slice(-6).toUpperCase(),
            amount: b.totalPrice
          }))
        }, { status: 404 });
      }
    }

    // Gọi webhook endpoint
    const webhookUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/webhooks/payment`;
    
    const webhookPayload = {
      amount: bookingAmount,
      description: `BOOKING ${bookingCode}`,
      transactionId: `TEST_${Date.now()}`,
      bankAccount: "0987654321",
      timestamp: new Date().toISOString()
    };

    console.log("🧪 Testing webhook with payload:", webhookPayload);

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(webhookPayload)
    });

    const result = await response.json();

    return NextResponse.json({
      success: true,
      message: "Webhook test completed",
      webhookResponse: result
    });

  } catch (error) {
    console.error("Test webhook error:", error);
    return NextResponse.json(
      { error: "Test failed", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}
