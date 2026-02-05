import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Webhook endpoint để nhận thông báo thanh toán từ:
 * - Casso.vn
 * - VietQR
 * - Ngân hàng trực tiếp
 * 
 * Cấu hình webhook URL: https://yourdomain.com/api/webhooks/payment
 */

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Log để debug
    console.log("💰 Payment webhook received:", body);

    // Xác thực webhook (tùy theo provider)
    // TODO: Thêm signature verification cho bảo mật
    
    // Parse thông tin từ webhook
    // Format có thể khác nhau tùy provider, đây là format chung:
    const {
      amount,           // Số tiền
      description,      // Nội dung chuyển khoản
      transactionId,    // Mã giao dịch
      bankAccount,      // Số tài khoản nhận
      timestamp,        // Thời gian
    } = body;

    // Trích xuất booking ID từ nội dung chuyển khoản
    // Format: "BOOKING ABC123" hoặc "ABC123"
    const bookingIdMatch = description?.match(/BOOKING\s+([A-Z0-9]{6})|([A-Z0-9]{6})/i);
    
    if (!bookingIdMatch) {
      console.log("⚠️ No booking ID found in description:", description);
      return NextResponse.json({ 
        success: false, 
        message: "Không tìm thấy mã booking trong nội dung chuyển khoản" 
      });
    }

    const bookingCode = (bookingIdMatch[1] || bookingIdMatch[2]).toUpperCase();
    
    console.log("🔍 Looking for booking with code:", bookingCode);
    
    // Tìm booking theo 6 ký tự cuối của ID (case-insensitive)
    const allBookings = await prisma.booking.findMany({
      where: {
        status: {
          in: ["PENDING", "PENDING_PAYMENT"]
        }
      },
      include: {
        payment: true,
        user: true
      }
    });
    
    // Filter by last 6 characters (case-insensitive)
    const bookings = allBookings.filter(b => 
      b.id.slice(-6).toUpperCase() === bookingCode
    );
    
    console.log(`📊 Found ${bookings.length} matching bookings`);

    if (bookings.length === 0) {
      console.log("⚠️ No pending booking found with code:", bookingCode);
      console.log("💡 Available pending bookings:", allBookings.map(b => ({
        id: b.id,
        last6: b.id.slice(-6).toUpperCase(),
        status: b.status
      })));
      return NextResponse.json({ 
        success: false, 
        message: "Không tìm thấy đơn đặt phòng chờ thanh toán với mã này" 
      });
    }

    const booking = bookings[0];

    // Kiểm tra số tiền khớp (cho phép sai lệch nhỏ)
    const amountDiff = Math.abs(amount - booking.totalPrice);
    if (amountDiff > 1000) { // Cho phép sai lệch 1000đ
      console.log("⚠️ Amount mismatch:", { received: amount, expected: booking.totalPrice });
      return NextResponse.json({ 
        success: false, 
        message: `Số tiền không khớp. Nhận: ${amount}đ, Cần: ${booking.totalPrice}đ` 
      });
    }

    // Cập nhật payment và booking trong transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update payment
      const payment = await tx.payment.upsert({
        where: { bookingId: booking.id },
        create: {
          bookingId: booking.id,
          amount: booking.totalPrice,
          currency: "VND",
          method: "BANK_TRANSFER",
          status: "PAID",
          providerRef: transactionId || `WEBHOOK_${Date.now()}`,
        },
        update: {
          status: "PAID",
          method: "BANK_TRANSFER",
          providerRef: transactionId,
        }
      });

      // Update booking
      const updatedBooking = await tx.booking.update({
        where: { id: booking.id },
        data: {
          status: "CONFIRMED",
          paymentMethod: "PAY_NOW"
        }
      });

      // Award loyalty points
      const pointsEarned = Math.floor(booking.totalPrice / 100000);
      if (pointsEarned > 0) {
        await tx.user.update({
          where: { id: booking.userId },
          data: {
            points: { increment: pointsEarned }
          }
        });
      }

      return { payment, booking: updatedBooking, pointsEarned };
    });

    console.log("✅ Payment confirmed automatically:", {
      bookingId: booking.id,
      amount,
      transactionId,
      pointsEarned: result.pointsEarned
    });

    return NextResponse.json({
      success: true,
      message: "Thanh toán đã được xác nhận tự động",
      data: {
        bookingId: booking.id,
        amount: booking.totalPrice,
        pointsEarned: result.pointsEarned
      }
    });

  } catch (error) {
    console.error("❌ Payment webhook error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Lỗi xử lý webhook thanh toán",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

// GET endpoint để test webhook
export async function GET(req: Request) {
  return NextResponse.json({
    message: "Payment webhook endpoint is active",
    usage: "POST to this endpoint with payment data",
    format: {
      amount: "number - Số tiền",
      description: "string - Nội dung CK (phải chứa mã booking)",
      transactionId: "string - Mã giao dịch",
      bankAccount: "string - Số TK nhận",
      timestamp: "string - Thời gian"
    }
  });
}
