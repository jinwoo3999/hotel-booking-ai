import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// Enhanced AI system với khả năng đặt phòng trực tiếp và parsing ngày thông minh
async function generateAdvancedAIResponse(message: string, context: any): Promise<{
  response: string;
  actions?: Array<{
    type: 'book_room' | 'show_hotels' | 'check_availability' | 'cancel_booking';
    data: any;
  }>;
}> {
  const { hotels, vouchers, attractions, user, currentTime, isLoggedIn } = context;
  
  // Enhanced intent recognition
  const lowerMessage = message.toLowerCase();
  
  // Phân tích intent chi tiết
  const intents = {
    searchHotels: /tìm|khách sạn|hotel|ở đâu|chỗ nghỉ|tìm kiếm/.test(lowerMessage),
    bookRoom: /đặt phòng|book|booking|đặt|thuê phòng|book room/.test(lowerMessage),
    checkPrice: /giá|bao nhiêu|chi phí|tiền|price|cost/.test(lowerMessage),
    checkAvailability: /còn phòng|available|trống|có phòng|availability/.test(lowerMessage),
    cancelBooking: /hủy|cancel|không đặt|hủy bỏ/.test(lowerMessage),
    askInfo: /thông tin|info|địa chỉ|liên hệ|contact/.test(lowerMessage),
    greeting: /xin chào|hello|hi|chào|hey/.test(lowerMessage),
    locationOnly: /^(đà nẵng|đà lạt|hà nội|nha trang|hồ chí minh|sài gòn|vũng tàu|phú quốc|hội an)$/i.test(lowerMessage.trim())
  };

  // Extract tên khách sạn cụ thể từ message
  let specificHotel = null;
  let targetLocation = '';
  let locationHotels = hotels;
  
  for (const hotel of hotels) {
    const hotelNameVariants = [
      hotel.name.toLowerCase(),
      hotel.name.toLowerCase().replace(/\s+/g, ''),
      ...hotel.name.toLowerCase().split(' ')
    ];
    
    if (hotelNameVariants.some(variant => lowerMessage.includes(variant))) {
      specificHotel = hotel;
      targetLocation = hotel.city;
      locationHotels = [hotel];
      break;
    }
  }
  // Extract location từ message với nhiều biến thể hơn (nếu chưa có từ tên khách sạn)
  if (!targetLocation) {
    const locationMap = {
      'đà nẵng': ['đà nẵng', 'da nang', 'danang', 'đà nẵng', 'dn'],
      'đà lạt': ['đà lạt', 'dalat', 'da lat', 'đà lạt', 'dl'],
      'hà nội': ['hà nội', 'hanoi', 'ha noi', 'hà nội', 'hn'],
      'nha trang': ['nha trang', 'nhatrang', 'nt'],
      'hồ chí minh': ['hồ chí minh', 'sài gòn', 'saigon', 'tp.hcm', 'tphcm', 'hcm', 'sg'],
      'vũng tàu': ['vũng tàu', 'vung tau', 'vt'],
      'phú quốc': ['phú quốc', 'phu quoc', 'pq'],
      'hội an': ['hội an', 'hoi an', 'ha']
    };

    for (const [city, variants] of Object.entries(locationMap)) {
      if (variants.some(variant => lowerMessage.includes(variant))) {
        targetLocation = city;
        locationHotels = hotels.filter((h: any) => 
          variants.some(variant => h.city.toLowerCase().includes(variant))
        );
        break;
      }
    }
  }

  // Enhanced date parsing với nhiều format hơn
  const datePatterns = {
    today: /hôm nay|today|bây giờ/,
    tomorrow: /ngày mai|tomorrow|mai/,
    thisWeekend: /cuối tuần|weekend|thứ 7|chủ nhật/,
    nextWeek: /tuần sau|next week|tuần tới/,
    specificDate: /(\d{1,2})[\/\-](\d{1,2})/,
    dayOfWeek: /thứ (\d)|chủ nhật/,
    nextMonth: /tháng sau|next month/
  };

  let suggestedDates = '';
  let checkInDate = new Date();
  let checkOutDate = new Date();
  let hasSpecificDates = false;

  for (const [period, pattern] of Object.entries(datePatterns)) {
    const match = lowerMessage.match(pattern);
    if (match) {
      const today = new Date();
      switch (period) {
        case 'today':
          checkInDate = new Date(today);
          checkOutDate = new Date(today);
          checkOutDate.setDate(checkOutDate.getDate() + 1);
          suggestedDates = `${checkInDate.toLocaleDateString('vi-VN')} - ${checkOutDate.toLocaleDateString('vi-VN')}`;
          hasSpecificDates = true;
          break;
        case 'tomorrow':
          checkInDate = new Date(today);
          checkInDate.setDate(checkInDate.getDate() + 1);
          checkOutDate = new Date(checkInDate);
          checkOutDate.setDate(checkOutDate.getDate() + 1);
          suggestedDates = `${checkInDate.toLocaleDateString('vi-VN')} - ${checkOutDate.toLocaleDateString('vi-VN')}`;
          hasSpecificDates = true;
          break;
        case 'thisWeekend':
          const daysUntilSaturday = (6 - today.getDay()) % 7;
          checkInDate = new Date(today);
          checkInDate.setDate(checkInDate.getDate() + daysUntilSaturday);
          checkOutDate = new Date(checkInDate);
          checkOutDate.setDate(checkOutDate.getDate() + 2);
          suggestedDates = `${checkInDate.toLocaleDateString('vi-VN')} - ${checkOutDate.toLocaleDateString('vi-VN')}`;
          hasSpecificDates = true;
          break;
        case 'specificDate':
          const day = parseInt(match[1]);
          const month = parseInt(match[2]);
          if (day <= 31 && month <= 12) {
            checkInDate = new Date(today.getFullYear(), month - 1, day);
            if (checkInDate < today) {
              checkInDate.setFullYear(checkInDate.getFullYear() + 1);
            }
            checkOutDate = new Date(checkInDate);
            checkOutDate.setDate(checkOutDate.getDate() + 1);
            suggestedDates = `${checkInDate.toLocaleDateString('vi-VN')} - ${checkOutDate.toLocaleDateString('vi-VN')}`;
            hasSpecificDates = true;
          }
          break;
      }
      break;
    }
  }

  // Extract số đêm
  const nightsMatch = lowerMessage.match(/(\d+)\s*(đêm|night|ngày)/);
  const nights = nightsMatch ? parseInt(nightsMatch[1]) : 1;
  
  if (hasSpecificDates && nights > 1) {
    checkOutDate = new Date(checkInDate);
    checkOutDate.setDate(checkOutDate.getDate() + nights);
    suggestedDates = `${checkInDate.toLocaleDateString('vi-VN')} - ${checkOutDate.toLocaleDateString('vi-VN')} (${nights} đêm)`;
  }

  // Extract số khách
  const guestMatch = lowerMessage.match(/(\d+)\s*(người|khách|guest|pax)/);
  const guestCount = guestMatch ? parseInt(guestMatch[1]) : 2;

  // Generate response based on intent
  let response = '';
  let actions: any[] = [];

  if (intents.greeting) {
    response = `Xin chào ${isLoggedIn ? user?.name || 'bạn' : 'bạn'}! 👋 

Tôi là AI Assistant của Lumina Stay. Tôi có thể giúp bạn:
🏨 Tìm kiếm khách sạn theo địa điểm
📋 Đặt phòng trực tiếp (chỉ cần nói "đặt phòng [địa điểm] [ngày]")
💰 Kiểm tra giá và ưu đãi
📞 Cung cấp thông tin chi tiết

💬 **Thử hỏi tôi:**
• "Tìm khách sạn ở Đà Nẵng"
• "Đặt phòng Nha Trang ngày mai 2 đêm"
• "Giá phòng ở Hà Nội cuối tuần"

Bạn muốn đi du lịch ở đâu ạ? 😊`;

  } else if (intents.locationOnly && targetLocation) {
    // Khi user chỉ nói tên địa điểm (VD: "Đà Nẵng")
    if (locationHotels.length > 0) {
      response = `🏨 **Khách sạn tại ${targetLocation.toUpperCase()}:**\n\n`;
      
      locationHotels.slice(0, 3).forEach((hotel: any, index: number) => {
        const room = hotel.rooms[0];
        response += `${index + 1}. **${hotel.name}** ⭐${hotel.rating}\n`;
        response += `   📍 ${hotel.address}\n`;
        response += `   💰 Từ ${room?.price?.toLocaleString() || 0}đ/đêm\n\n`;
      });

      response += `💬 **Bạn muốn làm gì tiếp theo?**\n`;
      response += `• "Đặt phòng ${locationHotels[0].name} ngày mai"\n`;
      response += `• "Giá phòng ở ${targetLocation}"\n`;
      response += `• "Tìm khách sạn khác"`;

      actions.push({
        type: 'show_hotels',
        data: { hotels: locationHotels.slice(0, 3), location: targetLocation }
      });
    }

  } else if (specificHotel && intents.bookRoom) {
    // Khi user nói tên khách sạn cụ thể + đặt phòng
    const selectedRoom = specificHotel.rooms[0];
    
    if (hasSpecificDates && selectedRoom && isLoggedIn) {
      response = `🎯 **Đang đặt phòng ${specificHotel.name}...**

📋 **Thông tin đặt phòng:**
🏨 Khách sạn: ${specificHotel.name}
🛏️ Phòng: ${selectedRoom.name}
📍 Địa điểm: ${specificHotel.city}
📅 Thời gian: ${suggestedDates}
👥 Số khách: ${guestCount} người
💰 Tổng tiền: ${(selectedRoom.price * nights).toLocaleString()}đ

⏳ Đang kiểm tra tình trạng phòng và xử lý đặt phòng...`;

      actions.push({
        type: 'book_room',
        data: {
          hotelId: specificHotel.id,
          roomId: selectedRoom.id,
          checkIn: checkInDate.toISOString().split('T')[0],
          checkOut: checkOutDate.toISOString().split('T')[0],
          guestCount,
          specialRequests: `Đặt phòng qua AI Assistant - ${message}`
        }
      });
    } else if (!isLoggedIn) {
      response = `🔐 **Cần đăng nhập để đặt phòng ${specificHotel.name}**

🚀 Đăng nhập ngay để đặt phòng chỉ trong 30 giây!`;
    } else {
      response = `🏨 **${specificHotel.name}** - ${specificHotel.city}

${hasSpecificDates ? `📅 Ngày: ${suggestedDates}` : '📅 Cần xác định ngày nhận phòng'}
👥 Số khách: ${guestCount} người
💰 Giá từ: ${selectedRoom?.price?.toLocaleString() || 0}đ/đêm

${!hasSpecificDates ? '💬 **Ví dụ:** "Đặt phòng ' + specificHotel.name + ' ngày mai 2 đêm"' : ''}`;

      actions.push({
        type: 'check_availability',
        data: { hotels: [specificHotel], location: specificHotel.city }
      });
    }

  } else if (intents.searchHotels && targetLocation) {
    if (locationHotels.length > 0) {
      response = `🏨 Tôi tìm thấy ${locationHotels.length} khách sạn tại ${targetLocation.toUpperCase()}:\n\n`;
      
      locationHotels.slice(0, 3).forEach((hotel: any, index: number) => {
        const room = hotel.rooms[0];
        response += `${index + 1}. **${hotel.name}** ⭐${hotel.rating}\n`;
        response += `   📍 ${hotel.address}\n`;
        response += `   💰 Từ ${room?.price?.toLocaleString() || 0}đ/đêm\n`;
        response += `   🛏️ ${hotel.rooms.length} loại phòng\n\n`;
      });

      if (isLoggedIn) {
        response += `✨ **Đặt phòng nhanh:**\n`;
        response += `Chỉ cần nói: "Đặt phòng ${locationHotels[0].name} ${suggestedDates || 'ngày mai'} cho ${guestCount} người"\n\n`;
        response += `🎯 **Hoặc chọn gói sẵn có:**`;
      } else {
        response += `💡 Đăng nhập để tôi có thể đặt phòng giúp bạn ngay!`;
      }

      actions.push({
        type: 'show_hotels',
        data: { hotels: locationHotels.slice(0, 3), location: targetLocation }
      });

    } else {
      response = `😔 Rất tiếc, hiện tại chúng tôi chưa có khách sạn tại ${targetLocation.toUpperCase()}.

🌟 **Các địa điểm có sẵn:**
${[...new Set(hotels.map((h: any) => h.city))].map((city) => `• ${city}`).join('\n')}

Bạn có muốn xem khách sạn ở địa điểm khác không?`;
    }

  } else if (intents.bookRoom && targetLocation && isLoggedIn) {
    if (locationHotels.length > 0) {
      const selectedHotel = locationHotels[0];
      const selectedRoom = selectedHotel.rooms[0];
      
      if (hasSpecificDates && selectedRoom) {
        // Có đủ thông tin để đặt phòng trực tiếp
        response = `🎯 **Đang đặt phòng cho bạn...**

📋 **Thông tin đặt phòng:**
🏨 Khách sạn: ${selectedHotel.name}
🛏️ Phòng: ${selectedRoom.name}
📅 Thời gian: ${suggestedDates}
👥 Số khách: ${guestCount} người
💰 Tổng tiền: ${(selectedRoom.price * nights).toLocaleString()}đ

⏳ Đang kiểm tra tình trạng phòng và xử lý đặt phòng...`;

        // Trigger booking action
        actions.push({
          type: 'book_room',
          data: {
            hotelId: selectedHotel.id,
            roomId: selectedRoom.id,
            checkIn: checkInDate.toISOString().split('T')[0],
            checkOut: checkOutDate.toISOString().split('T')[0],
            guestCount,
            specialRequests: `Đặt phòng qua AI Assistant - ${message}`
          }
        });
      } else {
        // Cần thêm thông tin
        response = `🎯 Tuyệt vời! Tôi sẽ giúp bạn đặt phòng tại ${targetLocation.toUpperCase()}.

📋 **Thông tin hiện có:**
🏨 Khách sạn đề xuất: ${selectedHotel.name}
${suggestedDates ? `📅 Ngày: ${suggestedDates}` : '📅 Ngày: Cần xác định'}
👥 Số khách: ${guestCount} người

${!hasSpecificDates ? '⚠️ **Cần bổ sung:** Ngày nhận phòng và trả phòng' : ''}

💬 **Ví dụ:** "Đặt phòng ${selectedHotel.name} từ ngày mai 2 đêm cho ${guestCount} người"`;

        actions.push({
          type: 'check_availability',
          data: { hotels: locationHotels, location: targetLocation }
        });
      }
    }

  } else if (intents.bookRoom && !isLoggedIn) {
    response = `🔐 **Cần đăng nhập để đặt phòng**

🚀 **Đăng nhập ngay để:**
✅ Đặt phòng trực tiếp qua AI chỉ trong 30 giây
✅ Theo dõi lịch sử booking  
✅ Nhận ưu đãi độc quyền
✅ Tích điểm thành viên

Sau khi đăng nhập, chỉ cần nói: "Đặt phòng [địa điểm] [ngày]" là xong! 😊`;

  } else if (intents.checkPrice && targetLocation) {
    if (locationHotels.length > 0) {
      response = `💰 **Bảng giá khách sạn tại ${targetLocation.toUpperCase()}:**\n\n`;
      
      locationHotels.slice(0, 5).forEach((hotel: any) => {
        const room = hotel.rooms[0];
        response += `🏨 **${hotel.name}**\n`;
        response += `   💵 Từ ${room?.price?.toLocaleString() || 0}đ/đêm\n`;
        response += `   ⭐ ${hotel.rating}/5 sao\n`;
        if (hasSpecificDates) {
          response += `   📊 ${nights} đêm: ${((room?.price || 0) * nights).toLocaleString()}đ\n`;
        }
        response += `\n`;
      });

      if (vouchers.length > 0) {
        response += `🎫 **Ưu đãi hiện có:**\n`;
        vouchers.slice(0, 2).forEach((v: any) => {
          response += `• ${v.code}: Giảm ${v.type === 'PERCENT' ? v.discount + '%' : v.discount.toLocaleString() + 'đ'}\n`;
        });
      }
    }

  } else {
    // Default intelligent response - cải thiện để hiểu context tốt hơn
    if (targetLocation && !intents.bookRoom && !intents.searchHotels) {
      // User nói địa điểm nhưng không rõ intent
      response = `🏨 **${targetLocation.toUpperCase()}** - Địa điểm tuyệt vời!

💬 **Bạn muốn:**
• "Tìm khách sạn ở ${targetLocation}"
• "Đặt phòng ${targetLocation} ngày mai"
• "Giá phòng ở ${targetLocation}"

Tôi có thể giúp gì cho bạn về ${targetLocation}? 😊`;
    } else if (intents.bookRoom && !targetLocation) {
      // User muốn đặt phòng nhưng không nói địa điểm
      response = `🤔 Bạn muốn đặt phòng ở đâu ạ?

🌟 **Các địa điểm phổ biến:**
${[...new Set(hotels.slice(0, 8).map((h: any) => h.city))].map((city) => `• ${city}`).join('\n')}

💬 **Ví dụ:** "Đặt phòng Đà Nẵng ngày mai 2 đêm cho 2 người"`;
    } else {
      // Default response
      response = `🤖 Tôi hiểu bạn đang quan tâm đến dịch vụ khách sạn.

🎯 **Tôi có thể giúp bạn:**
🔍 Tìm khách sạn theo địa điểm
📋 Đặt phòng trực tiếp (nếu đã đăng nhập)
💰 Kiểm tra giá và so sánh
🎫 Áp dụng mã giảm giá
📞 Cung cấp thông tin chi tiết

💬 **Thử hỏi tôi:**
• "Tìm khách sạn ở Đà Nẵng"
• "Đặt phòng Nha Trang ngày mai 2 đêm"  
• "Giá phòng ở Hà Nội cuối tuần"
• "Có ưu đãi gì không?"

Bạn cần tôi giúp gì cụ thể ạ? 😊`;
    }
  }

  return { response, actions };
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const { message } = await req.json();

    if (!message?.trim()) {
      return NextResponse.json({ 
        response: "Xin chào! Tôi có thể giúp gì cho bạn? 😊" 
      });
    }

    console.log("🤖 AI Request:", { message, userId: session?.user?.id });

    // Gather context data
    const [hotels, vouchers, attractions] = await Promise.all([
      prisma.hotel.findMany({
        where: { status: "ACTIVE" },
        include: { 
          rooms: { 
            where: { quantity: { gt: 0 } },
            take: 1,
            orderBy: { price: 'asc' }
          }
        },
        take: 20
      }),
      prisma.voucher.findMany({
        where: { 
          endDate: { gte: new Date() }
          // Note: usedCount vs usageLimit comparison would need raw SQL or computed field
        },
        take: 5
      }),
      prisma.attraction.findMany({
        where: { status: "PUBLISHED" },
        take: 10
      })
    ]);

    const context = {
      hotels,
      vouchers, 
      attractions,
      user: session?.user,
      currentTime: new Date().toLocaleString('vi-VN'),
      isLoggedIn: !!session?.user
    };

    // Generate AI response
    const aiResult = await generateAdvancedAIResponse(message, context);

    // Save conversation
    if (session?.user?.id) {
      await prisma.aiConversation.create({
        data: {
          userId: session.user.id,
          userMessage: message,
          aiResponse: aiResult.response
        }
      });
    }

    console.log("✅ AI Response generated successfully");

    return NextResponse.json({
      response: aiResult.response,
      actions: aiResult.actions || []
    });

  } catch (error) {
    console.error("❌ AI Chat Error:", error);
    return NextResponse.json({
      response: "Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau ít phút. 🔧"
    }, { status: 500 });
  }
}