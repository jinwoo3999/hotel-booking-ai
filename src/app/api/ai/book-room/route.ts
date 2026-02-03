import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createBooking } from "@/lib/actions";

// AI Booking API - Cho phép AI đặt phòng trực tiếp
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập để đặt phòng" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { hotelId, roomId, checkIn, checkOut, guestCount, specialRequests } = body;

    console.log("🤖 AI Booking Request:", { hotelId, roomId, checkIn, checkOut, guestCount });

    // Validate required fields
    if (!hotelId || !checkIn || !checkOut) {
      return NextResponse.json(
        { error: "Thiếu thông tin bắt buộc: hotelId, checkIn, checkOut" },
        { status: 400 }
      );
    }

    // Validate dates
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return NextResponse.json(
        { error: "Định dạng ngày không hợp lệ. Vui lòng sử dụng YYYY-MM-DD" },
        { status: 400 }
      );
    }

    if (checkInDate < today) {
      return NextResponse.json(
        { error: "Ngày nhận phòng không thể là ngày trong quá khứ" },
        { status: 400 }
      );
    }

    if (checkOutDate <= checkInDate) {
      return NextResponse.json(
        { error: "Ngày trả phòng phải sau ngày nhận phòng" },
        { status: 400 }
      );
    }

    // Get hotel and room info
    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelId },
      include: {
        rooms: {
          where: roomId ? { id: roomId } : { quantity: { gt: 0 } },
          orderBy: { price: 'asc' }
        }
      }
    });

    if (!hotel) {
      return NextResponse.json(
        { error: "Không tìm thấy khách sạn" },
        { status: 404 }
      );
    }

    if (hotel.rooms.length === 0) {
      return NextResponse.json(
        { error: "Khách sạn không có phòng phù hợp" },
        { status: 404 }
      );
    }

    // Select room (use specified roomId or cheapest available)
    const selectedRoom = hotel.rooms[0];
    
    // Validate guest count
    if (guestCount && guestCount > selectedRoom.maxGuests) {
      return NextResponse.json(
        { error: `Phòng chỉ phù hợp cho tối đa ${selectedRoom.maxGuests} khách` },
        { status: 400 }
      );
    }

    // Calculate total price
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = selectedRoom.price * nights;

    // Create FormData for createBooking function
    const formData = new FormData();
    formData.append('hotelId', hotelId);
    formData.append('roomId', selectedRoom.id);
    formData.append('checkIn', checkInDate.toISOString());
    formData.append('checkOut', checkOutDate.toISOString());
    formData.append('totalPrice', totalPrice.toString());
    formData.append('guestName', session.user.name || 'Khách hàng');
    formData.append('guestPhone', ''); // AI booking doesn't have phone
    formData.append('paymentMethod', 'PAY_AT_HOTEL');
    
    if (specialRequests) {
      formData.append('note', `Yêu cầu đặc biệt: ${specialRequests}`);
    }

    // Use existing createBooking function
    const result = await createBooking(formData);

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    // Success response
    return NextResponse.json({
      success: true,
      message: "Đặt phòng thành công qua AI Assistant!",
      booking: {
        id: result.bookingId,
        hotel: hotel.name,
        room: selectedRoom.name,
        checkIn: checkInDate.toLocaleDateString('vi-VN'),
        checkOut: checkOutDate.toLocaleDateString('vi-VN'),
        nights: nights,
        totalPrice: totalPrice,
        guestCount: guestCount || 1
      },
      nextSteps: [
        "Kiểm tra email xác nhận đặt phòng",
        "Chuẩn bị giấy tờ tùy thân khi check-in",
        "Liên hệ khách sạn nếu có thay đổi"
      ],
      paymentUrl: result.redirectTo
    });

  } catch (error) {
    console.error("❌ AI Booking Error:", error);
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi đặt phòng. Vui lòng thử lại." },
      { status: 500 }
    );
  }
}