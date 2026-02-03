import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getRoomAvailabilitySummary } from "@/lib/inventory";

// AI CONCIERGE SYSTEM - 100% LOCAL, NO EXTERNAL API
interface AIContext {
  hotels: any[];
  vouchers: any[];
  user: any;
  isLoggedIn: boolean;
  userBookings: any[];
}

interface AIResponse {
  response: string;
  actions?: Array<{
    type: 'book_room' | 'show_hotels' | 'check_availability' | 'cancel_booking' | 'show_bookings';
    data: any;
  }>;
}

function detectIntent(message: string) {
  const lower = message.toLowerCase().trim();
  return {
    greeting: /^(xin chào|hello|hi|chào|hey|hế lô)$/i.test(lower),
    searchHotels: /tìm|khách sạn|hotel|search|ở đâu|chỗ nghỉ/.test(lower),
    bookRoom: /đặt phòng|book|booking|đặt|thuê phòng/.test(lower),
    checkPrice: /giá|bao nhiêu|chi phí|tiền|price|cost/.test(lower),
    checkAvailability: /còn phòng|available|trống|có phòng/.test(lower),
    cancelBooking: /hủy|cancel|hủy bỏ/.test(lower),
    viewBookings: /lịch sử|booking của tôi|đặt phòng của tôi|xem đặt phòng/.test(lower),
    askInfo: /thông tin|info|địa chỉ|liên hệ|contact/.test(lower),
  };
}

function extractEntities(message: string, hotels: any[]) {
  const lower = message.toLowerCase();
  const locationMap: Record<string, string[]> = {
    'Đà Nẵng': ['đà nẵng', 'da nang', 'danang', 'dn'],
    'Đà Lạt': ['đà lạt', 'dalat', 'da lat', 'dl'],
    'Hà Nội': ['hà nội', 'hanoi', 'ha noi', 'hn'],
    'Nha Trang': ['nha trang', 'nhatrang', 'nt'],
    'Hồ Chí Minh': ['hồ chí minh', 'sài gòn', 'saigon', 'hcm', 'sg'],
    'Vũng Tàu': ['vũng tàu', 'vung tau', 'vt'],
    'Phú Quốc': ['phú quốc', 'phu quoc', 'pq'],
    'Hội An': ['hội an', 'hoi an', 'ha']
  };
  let location = '';
  for (const [city, variants] of Object.entries(locationMap)) {
    if (variants.some(v => lower.includes(v))) {
      location = city;
      break;
    }
  }
  let specificHotel = null;
  for (const hotel of hotels) {
    const variants = [hotel.name.toLowerCase(), ...hotel.name.toLowerCase().split(' ').filter((w: string) => w.length > 3)];
    if (variants.some(v => lower.includes(v))) {
      specificHotel = hotel;
      if (!location) location = hotel.city;
      break;
    }
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let checkIn = new Date(today);
  let checkOut = new Date(today);
  let hasSpecificDates = false;
  if (/hôm nay|today/.test(lower)) {
    checkIn = new Date(today);
    checkOut = new Date(today);
    checkOut.setDate(checkOut.getDate() + 1);
    hasSpecificDates = true;
  } else if (/ngày mai|tomorrow|mai/.test(lower)) {
    checkIn = new Date(today);
    checkIn.setDate(checkIn.getDate() + 1);
    checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + 1);
    hasSpecificDates = true;
  } else if (/cuối tuần|weekend/.test(lower)) {
    const daysUntilSaturday = (6 - today.getDay() + 7) % 7 || 7;
    checkIn = new Date(today);
    checkIn.setDate(checkIn.getDate() + daysUntilSaturday);
    checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + 2);
    hasSpecificDates = true;
  }
  const nightsMatch = lower.match(/(\d+)\s*(đêm|night)/);
  const nights = nightsMatch ? parseInt(nightsMatch[1]) : 1;
  if (hasSpecificDates && nights > 1) {
    checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + nights);
  }
  const guestMatch = lower.match(/(\d+)\s*(người|khách|guest)/);
  const guestCount = guestMatch ? parseInt(guestMatch[1]) : 2;
  return { location, specificHotel, checkIn, checkOut, hasSpecificDates, nights, guestCount };
}

async function generateAdvancedAIResponse(message: string, context: AIContext): Promise<AIResponse> {
  const { hotels, vouchers, user, isLoggedIn, userBookings } = context;
  const intents = detectIntent(message);
  const entities = extractEntities(message, hotels);
  let response = '';
  const actions: any[] = [];
  if (intents.greeting) {
    response = `👋 Xin chào ${isLoggedIn ? user?.name || 'bạn' : 'bạn'}!\n\nTôi là AI Concierge của Lumina Stay - trợ lý du lịch thông minh.\n\n🎯 **Tôi có thể giúp bạn:**\n• Tìm khách sạn phù hợp\n• Đặt phòng nhanh chóng\n• Kiểm tra giá và ưu đãi\n• Quản lý booking\n\n💬 **Thử hỏi:**\n• "Tìm khách sạn Đà Nẵng"\n• "Đặt phòng Nha Trang ngày mai"\n• "Lịch sử đặt phòng"\n\nBạn muốn đi đâu? 😊`;
    return { response, actions };
  }
  if (intents.viewBookings) {
    if (!isLoggedIn) {
      response = `🔐 **Vui lòng đăng nhập để xem lịch sử**\n\nĐăng nhập để:\n✅ Xem tất cả booking\n✅ Quản lý đặt phòng\n✅ Nhận ưu đãi`;
      return { response, actions };
    }
    if (userBookings.length === 0) {
      response = `📋 **Bạn chưa có booking nào**\n\nHãy bắt đầu chuyến đi!\n💬 Thử: "Tìm khách sạn Đà Lạt"`;
      return { response, actions };
    }
    response = `📋 **Lịch sử đặt phòng** (${userBookings.length} booking)\n\n`;
    userBookings.slice(0, 5).forEach((booking: any, index: number) => {
      const status = booking.status === 'CONFIRMED' ? '✅' : booking.status === 'PENDING' ? '⏳' : '❌';
      response += `${index + 1}. ${status} **${booking.hotel.name}**\n   📅 ${new Date(booking.checkIn).toLocaleDateString('vi-VN')} - ${new Date(booking.checkOut).toLocaleDateString('vi-VN')}\n   💰 ${booking.totalPrice.toLocaleString()}đ\n\n`;
    });
    actions.push({ type: 'show_bookings', data: { bookings: userBookings } });
    return { response, actions };
  }
  if (intents.cancelBooking) {
    if (!isLoggedIn) {
      response = `🔐 Vui lòng đăng nhập để hủy booking`;
      return { response, actions };
    }
    const pendingBookings = userBookings.filter((b: any) => b.status === 'PENDING');
    if (pendingBookings.length === 0) {
      response = `ℹ️ Bạn không có booking nào có thể hủy`;
      return { response, actions };
    }
    response = `🔄 **Booking có thể hủy:**\n\n`;
    pendingBookings.forEach((booking: any, index: number) => {
      response += `${index + 1}. ${booking.hotel.name} - ${new Date(booking.checkIn).toLocaleDateString('vi-VN')}\n`;
    });
    response += `\nVào "Lịch sử đặt phòng" để hủy.`;
    return { response, actions };
  }
  if (intents.searchHotels || entities.location) {
    if (!entities.location) {
      response = `🤔 Bạn muốn tìm khách sạn ở đâu?\n\n🌟 **Địa điểm phổ biến:**\n${[...new Set(hotels.map(h => h.city))].slice(0, 8).map(city => `• ${city}`).join('\n')}\n\n💬 Ví dụ: "Tìm khách sạn Đà Nẵng"`;
      return { response, actions };
    }
    const locationHotels = hotels.filter(h => h.city === entities.location);
    if (locationHotels.length === 0) {
      response = `😔 Hiện chưa có khách sạn tại ${entities.location}\n\n🌟 **Địa điểm có sẵn:**\n${[...new Set(hotels.map(h => h.city))].slice(0, 8).map(city => `• ${city}`).join('\n')}`;
      return { response, actions };
    }
    response = `🏨 **${locationHotels.length} khách sạn tại ${entities.location}**\n\n`;
    for (const hotel of locationHotels.slice(0, 3)) {
      const room = hotel.rooms[0];
      response += `⭐ **${hotel.name}** (${hotel.rating}/5)\n   📍 ${hotel.address}\n   💰 Từ ${room?.price?.toLocaleString() || 0}đ/đêm\n   🛏️ ${hotel.rooms.length} loại phòng\n\n`;
    }
    if (isLoggedIn) {
      response += `✨ **Đặt nhanh:** "Đặt phòng ${locationHotels[0].name} ngày mai"`;
    } else {
      response += `💡 Đăng nhập để đặt phòng nhanh!`;
    }
    actions.push({ type: 'show_hotels', data: { hotels: locationHotels.slice(0, 3), location: entities.location } });
    return { response, actions };
  }
  if (intents.bookRoom) {
    if (!isLoggedIn) {
      response = `🔐 **Cần đăng nhập để đặt phòng**\n\n🚀 Đăng nhập để:\n✅ Đặt phòng 30 giây\n✅ Theo dõi booking\n✅ Nhận ưu đãi\n✅ Tích điểm`;
      return { response, actions };
    }
    if (!entities.location && !entities.specificHotel) {
      response = `🤔 Bạn muốn đặt phòng ở đâu?\n\n🌟 **Địa điểm:**\n${[...new Set(hotels.map(h => h.city))].slice(0, 8).map(city => `• ${city}`).join('\n')}\n\n💬 Ví dụ: "Đặt phòng Đà Nẵng ngày mai"`;
      return { response, actions };
    }
    const targetHotel = entities.specificHotel || hotels.filter(h => h.city === entities.location)[0];
    if (!targetHotel) {
      response = `😔 Không tìm thấy khách sạn`;
      return { response, actions };
    }
    const selectedRoom = targetHotel.rooms[0];
    if (!selectedRoom) {
      response = `😔 Khách sạn không có phòng`;
      return { response, actions };
    }
    if (!entities.hasSpecificDates) {
      response = `🏨 **${targetHotel.name}**\n\n📍 ${targetHotel.city}\n💰 Từ ${selectedRoom.price.toLocaleString()}đ/đêm\n\n⚠️ **Cần:** Ngày nhận phòng\n\n💬 Ví dụ: "Đặt phòng ${targetHotel.name} ngày mai"`;
      return { response, actions };
    }
    const availability = await getRoomAvailabilitySummary(selectedRoom.id, entities.checkIn, entities.checkOut);
    if (!availability.available || availability.remainingMin <= 0) {
      response = `😔 **Phòng đã hết**\n\n🏨 ${targetHotel.name}\n📅 ${entities.checkIn.toLocaleDateString('vi-VN')} - ${entities.checkOut.toLocaleDateString('vi-VN')}\n\n💡 **Gợi ý:**\n• Chọn ngày khác\n• Xem khách sạn khác`;
      return { response, actions };
    }
    const totalPrice = selectedRoom.price * entities.nights;
    response = `🎯 **Đang đặt phòng ${targetHotel.name}**\n\n📋 **Thông tin:**\n🏨 ${targetHotel.name}\n🛏️ ${selectedRoom.name}\n📍 ${targetHotel.city}\n📅 ${entities.checkIn.toLocaleDateString('vi-VN')} - ${entities.checkOut.toLocaleDateString('vi-VN')}\n🌙 ${entities.nights} đêm\n👥 ${entities.guestCount} người\n💰 ${totalPrice.toLocaleString()}đ\n✅ Còn ${availability.remainingMin} phòng\n\n⏳ Đang xử lý...`;
    actions.push({
      type: 'book_room',
      data: {
        hotelId: targetHotel.id,
        roomId: selectedRoom.id,
        checkIn: entities.checkIn.toISOString().split('T')[0],
        checkOut: entities.checkOut.toISOString().split('T')[0],
        guestCount: entities.guestCount,
        specialRequests: `Đặt qua AI - ${message}`
      }
    });
    return { response, actions };
  }
  if (intents.checkPrice && entities.location) {
    const locationHotels = hotels.filter(h => h.city === entities.location);
    if (locationHotels.length === 0) {
      response = `😔 Không tìm thấy khách sạn tại ${entities.location}`;
      return { response, actions };
    }
    response = `💰 **Bảng giá ${entities.location}**\n\n`;
    locationHotels.slice(0, 5).forEach((hotel: any) => {
      const room = hotel.rooms[0];
      response += `🏨 **${hotel.name}**\n   💵 ${room?.price?.toLocaleString() || 0}đ/đêm\n   ⭐ ${hotel.rating}/5\n\n`;
    });
    if (vouchers.length > 0) {
      response += `🎫 **Ưu đãi:**\n`;
      vouchers.slice(0, 2).forEach((v: any) => {
        response += `• ${v.code}: Giảm ${v.type === 'PERCENT' ? v.discount + '%' : v.discount.toLocaleString() + 'đ'}\n`;
      });
    }
    return { response, actions };
  }
  response = `🤖 AI Concierge của Lumina Stay\n\n🎯 **Tôi giúp:**\n• Tìm khách sạn: "Tìm Đà Nẵng"\n• Đặt phòng: "Đặt Nha Trang ngày mai"\n• Kiểm tra giá: "Giá Đà Lạt"\n• Xem booking: "Lịch sử"\n\nBạn cần gì? 😊`;
  return { response, actions };
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const { message } = await req.json();
    if (!message?.trim()) {
      return NextResponse.json({ response: "Xin chào! Tôi có thể giúp gì? 😊" });
    }
    console.log("🤖 AI Request:", { message, userId: session?.user?.id });
    const [hotels, vouchers, userBookings] = await Promise.all([
      prisma.hotel.findMany({
        where: { status: "ACTIVE" },
        include: { rooms: { where: { quantity: { gt: 0 } }, orderBy: { price: 'asc' } } },
        take: 50
      }),
      prisma.voucher.findMany({ where: { endDate: { gte: new Date() } }, take: 10 }),
      session?.user?.id ? prisma.booking.findMany({
        where: { userId: session.user.id },
        include: { hotel: true, room: true },
        orderBy: { createdAt: 'desc' },
        take: 10
      }) : Promise.resolve([])
    ]);
    const context: AIContext = {
      hotels,
      vouchers,
      user: session?.user,
      isLoggedIn: !!session?.user,
      userBookings
    };
    const aiResult = await generateAdvancedAIResponse(message, context);
    if (session?.user?.id) {
      await prisma.aiConversation.create({
        data: {
          userId: session.user.id,
          userMessage: message,
          aiResponse: aiResult.response
        }
      });
    }
    console.log("✅ AI Response OK");
    return NextResponse.json({
      response: aiResult.response,
      actions: aiResult.actions || []
    });
  } catch (error) {
    console.error("❌ AI Error:", error);
    return NextResponse.json({
      response: "Xin lỗi, tôi gặp sự cố. Vui lòng thử lại. 🔧"
    }, { status: 500 });
  }
}
