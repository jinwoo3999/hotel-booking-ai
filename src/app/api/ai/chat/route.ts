import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// Tích hợp AI model thực sự
async function generateSmartAIResponse(message: string, context: any): Promise<string> {
  const { hotels, vouchers, attractions, user, currentTime, isLoggedIn } = context;
  
  // Phân tích vị trí được hỏi trong tin nhắn
  const lowerMessage = message.toLowerCase();
  let targetLocation = '';
  let locationHotels = hotels;
  let locationAttractions = attractions;
  
  // Xác định vị trí cụ thể
  if (lowerMessage.includes('đà lạt') || lowerMessage.includes('dalat')) {
    targetLocation = 'Đà Lạt';
    locationHotels = hotels.filter((h: any) => h.city.toLowerCase().includes('đà lạt'));
    locationAttractions = attractions.filter((a: any) => a.city.toLowerCase().includes('đà lạt'));
  } else if (lowerMessage.includes('hà nội') || lowerMessage.includes('hanoi')) {
    targetLocation = 'Hà Nội';
    locationHotels = hotels.filter((h: any) => h.city.toLowerCase().includes('hà nội'));
    locationAttractions = attractions.filter((a: any) => a.city.toLowerCase().includes('hà nội'));
  } else if (lowerMessage.includes('nha trang')) {
    targetLocation = 'Nha Trang';
    locationHotels = hotels.filter((h: any) => h.city.toLowerCase().includes('nha trang'));
    locationAttractions = attractions.filter((a: any) => a.city.toLowerCase().includes('nha trang'));
  } else if (lowerMessage.includes('sài gòn') || lowerMessage.includes('hồ chí minh') || lowerMessage.includes('tp.hcm')) {
    targetLocation = 'TP.HCM';
    locationHotels = hotels.filter((h: any) => h.city.toLowerCase().includes('hồ chí minh') || h.city.toLowerCase().includes('sài gòn'));
    locationAttractions = attractions.filter((a: any) => a.city.toLowerCase().includes('hồ chí minh') || a.city.toLowerCase().includes('sài gòn'));
  }

  // Chuẩn bị context cho AI model với thông tin đã lọc theo vị trí
  const systemPrompt = `Bạn là trợ lý AI thông minh của Lumina Stay - hệ thống đặt phòng khách sạn hàng đầu Việt Nam.

THÔNG TIN HỆ THỐNG HIỆN TẠI:
- Khách sạn: ${hotels.length} khách sạn đang hoạt động
- Voucher: ${vouchers.length} voucher giảm giá có hiệu lực
- Điểm tham quan: ${attractions.length} địa điểm du lịch
- Thời gian: ${currentTime}
- Người dùng: ${isLoggedIn ? `Đã đăng nhập (${user?.name || 'Khách hàng'})` : 'Chưa đăng nhập'}

${targetLocation ? `
🎯 KHÁCH HÀNG HỎI VỀ: ${targetLocation}

KHÁCH SẠN TẠI ${targetLocation.toUpperCase()}:
${locationHotels.length > 0 ? locationHotels.map((h: any) => `- ${h.name}: Từ ${h.rooms[0]?.price?.toLocaleString() || 0}đ/đêm, Rating: ${h.rating}/5, Địa chỉ: ${h.address}`).join('\n') : `KHÔNG CÓ khách sạn nào tại ${targetLocation}`}

ĐIỂM THAM QUAN TẠI ${targetLocation.toUpperCase()}:
${locationAttractions.length > 0 ? locationAttractions.map((a: any) => `- ${a.name}${a.category ? ` (${a.category})` : ''}${a.address ? `, Địa chỉ: ${a.address}` : ''}`).join('\n') : `KHÔNG CÓ điểm tham quan nào tại ${targetLocation}`}

⚠️ QUAN TRỌNG: CHỈ trả lời về ${targetLocation}, KHÔNG đề cập đến thành phố khác!
` : `
DANH SÁCH TẤT CẢ KHÁCH SẠN:
${hotels.map((h: any) => `- ${h.name} (${h.city}): Từ ${h.rooms[0]?.price?.toLocaleString() || 0}đ/đêm, Rating: ${h.rating}/5, Địa chỉ: ${h.address}`).join('\n')}

ĐIỂM THAM QUAN:
${attractions.map((a: any) => `- ${a.name} (${a.city})${a.category ? ` - ${a.category}` : ''}${a.address ? `, Địa chỉ: ${a.address}` : ''}`).join('\n')}
`}

VOUCHER HIỆN CÓ:
${vouchers.map((v: any) => `- ${v.code}: Giảm ${v.type === 'PERCENT' ? v.discount + '%' : v.discount.toLocaleString() + 'đ'}${v.minSpend ? ` (đơn từ ${v.minSpend.toLocaleString()}đ)` : ''}, HSD: ${new Date(v.endDate).toLocaleDateString('vi-VN')}`).join('\n')}

🚨 HƯỚNG DẪN PHẢN HỒI CỰC KỲ QUAN TRỌNG:
1. CHỈ trả lời về thông tin THỰC TẾ từ danh sách trên, KHÔNG bịa đặt
2. ${targetLocation ? `Khách hỏi về ${targetLocation} - CHỈ trả lời về ${targetLocation}, TUYỆT ĐỐI KHÔNG đề cập thành phố khác` : 'Nếu khách hỏi về vị trí cụ thể, chỉ trả lời về vị trí đó'}
3. ${targetLocation && locationHotels.length === 0 ? `Nói rõ "Hiện tại chưa có khách sạn tại ${targetLocation}"` : ''}
4. Luôn thân thiện, sử dụng emoji phù hợp
5. Đề xuất hành động tiếp theo (đặt phòng, xem chi tiết, liên hệ)
6. Trả lời bằng tiếng Việt tự nhiên

VÍ DỤ ĐÚNG:
- Hỏi: "Khách sạn Đà Lạt" → CHỈ nói về Lumina Đà Lạt Resort, KHÔNG nhắc đến Hà Nội
- Hỏi: "Khách sạn Hà Nội" → CHỈ nói về Lumina Grand Hà Nội, KHÔNG nhắc đến Đà Lạt
- Hỏi: "Khách sạn Nha Trang" → "Hiện chưa có khách sạn tại Nha Trang"

PHONG CÁCH: Tự nhiên, thân thiện, chính xác, tập trung vào vị trí được hỏi`;

  try {
    // Ưu tiên Google Gemini trước
    if (process.env.GEMINI_API_KEY) {
      console.log('🤖 Using Google Gemini API...');
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${systemPrompt}\n\nCâu hỏi của khách hàng: ${message}`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
          }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (aiResponse) {
          console.log('✅ Gemini response received');
          return aiResponse;
        }
      } else {
        console.log('❌ Gemini API error:', response.status);
      }
    }

    // Fallback sang OpenAI nếu Gemini không khả dụng
    if (process.env.OPENAI_API_KEY) {
      console.log('🤖 Fallback to OpenAI API...');
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const aiResponse = data.choices[0]?.message?.content;
        if (aiResponse) {
          console.log('✅ OpenAI response received');
          return aiResponse;
        }
      }
    }

    // Nếu cả hai API đều không khả dụng, dùng Enhanced Logic
    console.log('🔧 Using Enhanced Logic fallback...');
    return generateEnhancedResponse(message, context);

  } catch (error) {
    console.error('AI API Error:', error);
    return generateEnhancedResponse(message, context);
  }
}

// Hàm tạo phản hồi thông minh hơn khi không có AI API
function generateEnhancedResponse(message: string, context: any): string {
  const lowerMessage = message.toLowerCase();
  const { hotels, vouchers, attractions, user, currentTime, isLoggedIn } = context;
  
  // Xác định vị trí được hỏi và lọc dữ liệu
  let targetLocation = '';
  let locationHotels = hotels;
  let locationAttractions = attractions;
  
  if (lowerMessage.includes('đà lạt') || lowerMessage.includes('dalat')) {
    targetLocation = 'Đà Lạt';
    locationHotels = hotels.filter((h: any) => h.city.toLowerCase().includes('đà lạt'));
    locationAttractions = attractions.filter((a: any) => a.city.toLowerCase().includes('đà lạt'));
  } else if (lowerMessage.includes('hà nội') || lowerMessage.includes('hanoi')) {
    targetLocation = 'Hà Nội';
    locationHotels = hotels.filter((h: any) => h.city.toLowerCase().includes('hà nội'));
    locationAttractions = attractions.filter((a: any) => a.city.toLowerCase().includes('hà nội'));
  } else if (lowerMessage.includes('nha trang')) {
    targetLocation = 'Nha Trang';
    locationHotels = hotels.filter((h: any) => h.city.toLowerCase().includes('nha trang'));
    locationAttractions = attractions.filter((a: any) => a.city.toLowerCase().includes('nha trang'));
  } else if (lowerMessage.includes('sài gòn') || lowerMessage.includes('hồ chí minh') || lowerMessage.includes('tp.hcm')) {
    targetLocation = 'TP.HCM';
    locationHotels = hotels.filter((h: any) => h.city.toLowerCase().includes('hồ chí minh') || h.city.toLowerCase().includes('sài gòn'));
    locationAttractions = attractions.filter((a: any) => a.city.toLowerCase().includes('hồ chí minh') || a.city.toLowerCase().includes('sài gòn'));
  }
  
  // Phân tích ý định của user thông minh hơn
  const intents = {
    greeting: ['xin chào', 'hello', 'hi', 'chào', 'hey'],
    booking: ['đặt phòng', 'booking', 'book', 'đặt', 'thuê phòng'],
    search: ['tìm', 'search', 'tìm kiếm', 'có gì', 'show'],
    price: ['giá', 'bao nhiêu', 'cost', 'tiền', 'chi phí'],
    location: ['đà lạt', 'hà nội', 'nha trang', 'sài gòn', 'hồ chí minh', 'tp.hcm'],
    voucher: ['voucher', 'giảm giá', 'khuyến mãi', 'ưu đãi', 'discount'],
    help: ['giúp', 'help', 'hỗ trợ', 'hướng dẫn', 'làm sao'],
    thanks: ['cảm ơn', 'thank', 'thanks'],
    goodbye: ['tạm biệt', 'bye', 'goodbye']
  };

  // Xác định ý định chính
  let primaryIntent = 'general';
  let confidence = 0;
  
  for (const [intent, keywords] of Object.entries(intents)) {
    const matches = keywords.filter(keyword => lowerMessage.includes(keyword)).length;
    if (matches > confidence) {
      confidence = matches;
      primaryIntent = intent;
    }
  }

  // Tạo phản hồi dựa trên ý định và context
  const greeting = isLoggedIn ? `👋 Xin chào ${user?.name || 'bạn'}!` : '👋 Xin chào!';
  
  switch (primaryIntent) {
    case 'greeting':
      return `${greeting} Tôi là AI Assistant của Lumina Stay - hệ thống đặt phòng khách sạn thông minh.

🏨 **Hiện tại chúng tôi có:**
- ${hotels.length} khách sạn chất lượng cao
- ${vouchers.length} voucher giảm giá hấp dẫn
- ${attractions.length} điểm vui chơi thú vị

**🎯 Tôi có thể giúp bạn:**
- Tìm kiếm khách sạn theo vị trí và ngân sách
- Tư vấn lịch trình du lịch phù hợp
- Hướng dẫn sử dụng voucher giảm giá
- Hỗ trợ quy trình đặt phòng từ A-Z
- Giải đáp mọi thắc mắc về dịch vụ

${isLoggedIn ? '✨ **Đặc biệt:** Bạn đã đăng nhập, tôi có thể tư vấn cá nhân hóa dựa trên sở thích của bạn!' : '💡 **Gợi ý:** Đăng nhập để nhận tư vấn cá nhân hóa và ưu đãi độc quyền!'}

Bạn muốn tìm hiểu về điều gì? Hãy nói với tôi! 😊`;

    case 'booking':
      return generateBookingResponse(targetLocation, { ...context, locationHotels, locationAttractions });
      
    case 'search':
      return generateSearchResponse(targetLocation, message, { ...context, locationHotels, locationAttractions });
      
    case 'price':
      return generatePriceResponse(targetLocation, { ...context, locationHotels, locationAttractions });
      
    case 'voucher':
      return generateVoucherResponse(context);
      
    case 'help':
      return generateHelpResponse(context);
      
    case 'thanks':
      return `🙏 **Cảm ơn bạn rất nhiều!**

Rất vui được hỗ trợ bạn hôm nay! 

**🌟 Nếu cần thêm hỗ trợ:**
- 💬 Tiếp tục chat với tôi bất cứ lúc nào
- 🏨 Khám phá thêm khách sạn tuyệt vời
- 🎫 Kiểm tra voucher mới nhất
- 📞 Gọi hotline 24/7: 1900-1234

**📝 Đánh giá dịch vụ:**
Ý kiến của bạn rất quan trọng với chúng tôi! Hãy để lại đánh giá để giúp Lumina Stay ngày càng tốt hơn.

Chúc bạn có những chuyến du lịch tuyệt vời! ✈️🏖️✨`;

    case 'goodbye':
      return `👋 **Tạm biệt và hẹn gặp lại!**

Cảm ơn bạn đã tin tưởng và sử dụng dịch vụ của Lumina Stay!

**🎁 Đừng quên:**
- 🔔 Theo dõi để nhận thông báo ưu đãi mới
- 💾 Lưu lại thông tin khách sạn yêu thích
- 📱 Tải app Lumina Stay để đặt phòng nhanh hơn

**📞 Liên hệ khi cần hỗ trợ:**
- 💬 Chat với tôi 24/7 - luôn sẵn sàng!
- 📞 Hotline: 1900-1234
- 📧 Email: support@luminastay.com

Hẹn sớm được phục vụ bạn lần nữa! 🌟💙`;

    default:
      return generateIntelligentResponse(message, { ...context, targetLocation, locationHotels, locationAttractions });
  }
}

// Các hàm helper cho từng loại phản hồi
function generateBookingResponse(location: string, context: any): string {
  const { hotels, vouchers, isLoggedIn, locationHotels } = context;
  
  let response = `📋 **Hướng dẫn đặt phòng tại Lumina Stay:**

**🔄 Quy trình đặt phòng (5 bước đơn giản):**
1. **🔍 Chọn khách sạn** - Tìm theo vị trí hoặc duyệt danh sách
2. **📅 Chọn ngày** - Nhận phòng và trả phòng
3. **🛏️ Chọn phòng** - Loại phòng phù hợp với nhu cầu
4. **📝 Điền thông tin** - Thông tin khách hàng và yêu cầu đặc biệt
5. **💳 Thanh toán** - Online hoặc tại khách sạn

${isLoggedIn ? '✅ **Ưu điểm khi đã đăng nhập:**\n- Thông tin được lưu tự động\n- Đặt phòng nhanh hơn 50%\n- Nhận ưu đãi độc quyền\n- Theo dõi lịch sử đặt phòng' : '💡 **Đăng nhập ngay để:**\n- Đặt phòng nhanh chóng\n- Lưu thông tin an toàn\n- Nhận ưu đãi đặc biệt'}`;

  if (location && locationHotels) {
    if (locationHotels.length > 0) {
      response += `\n\n🏨 **Khách sạn tại ${location}:**\n${locationHotels.map((h: any) => `- **${h.name}** - Từ ${h.rooms[0]?.price?.toLocaleString() || 0}đ/đêm (${h.rating}⭐)`).join('\n')}`;
    } else {
      response += `\n\n🏨 **Khách sạn tại ${location}:**\nHiện tại chưa có khách sạn nào tại ${location}. Vui lòng liên hệ để được tư vấn các điểm đến khác.`;
    }
  }

  if (vouchers.length > 0) {
    response += `\n\n🎁 **Voucher giảm giá hiện có:**\n${vouchers.slice(0, 3).map((v: any) => `- **${v.code}**: Giảm ${v.type === 'PERCENT' ? v.discount + '%' : v.discount.toLocaleString() + 'đ'}`).join('\n')}`;
  }

  response += `\n\n**💳 Phương thức thanh toán:**
- Thẻ tín dụng/ghi nợ (Visa, Mastercard)
- Chuyển khoản ngân hàng
- Ví điện tử (Momo, ZaloPay, VNPay)
- Thanh toán tại khách sạn

**🛡️ Chính sách đặt phòng:**
- Xác nhận ngay lập tức
- Hủy miễn phí trước 24h
- Hỗ trợ 24/7
- Đảm bảo giá tốt nhất

Bạn muốn đặt phòng ở đâu? Tôi sẽ hỗ trợ chi tiết! 🤝`;

  return response;
}

function generateSearchResponse(location: string, message: string, context: any): string {
  const { hotels, attractions, locationHotels, locationAttractions } = context;
  
  if (location) {
    let response = `🔍 **Kết quả tìm kiếm cho "${location}":**\n\n`;
    
    if (locationHotels && locationHotels.length > 0) {
      response += `🏨 **Khách sạn tại ${location}:**\n${locationHotels.map((h: any) => `- **${h.name}**\n  💰 Từ ${h.rooms[0]?.price?.toLocaleString() || 0}đ/đêm | ⭐ ${h.rating}/5\n  📍 ${h.address}`).join('\n\n')}\n\n`;
    }
    
    if (locationAttractions && locationAttractions.length > 0) {
      response += `🎯 **Điểm tham quan tại ${location}:**\n${locationAttractions.map((a: any) => `- **${a.name}**${a.category ? ` (${a.category})` : ''}${a.address ? `\n  📍 ${a.address}` : ''}`).join('\n\n')}`;
    }
    
    if ((!locationHotels || locationHotels.length === 0) && (!locationAttractions || locationAttractions.length === 0)) {
      response += `Hiện tại chưa có thông tin về ${location} trong hệ thống.\n\n**🌟 Các điểm đến hiện có:**\n- 🌲 Đà Lạt - Thành phố ngàn hoa\n- 🏛️ Hà Nội - Văn hóa nghìn năm`;
    } else if (!locationHotels || locationHotels.length === 0) {
      response += `\n\n💡 **Lưu ý:** Hiện chưa có khách sạn tại ${location}. Vui lòng liên hệ để được tư vấn.`;
    }
    
    return response;
  }
  
  return `🔍 **Tìm kiếm thông minh:**

**🏨 Tất cả khách sạn (${hotels.length}):**
${hotels.map((h: any) => `- **${h.name}** (${h.city}) - Từ ${h.rooms[0]?.price?.toLocaleString() || 0}đ/đêm`).join('\n')}

**🎯 Tìm kiếm theo vị trí:**
- "Tìm khách sạn Đà Lạt"
- "Khách sạn Hà Nội giá rẻ"

**🔧 Bộ lọc thông minh:**
- Theo giá: "khách sạn dưới 2 triệu"
- Theo tiện ích: "khách sạn có hồ bơi"
- Theo đánh giá: "khách sạn 4 sao"

Bạn muốn tìm gì cụ thể? 🎯`;
}

function generatePriceResponse(location: string, context: any): string {
  const { hotels, vouchers, locationHotels } = context;
  
  let response = `💰 **Bảng giá khách sạn Lumina Stay:**\n\n`;
  
  if (location) {
    if (locationHotels && locationHotels.length > 0) {
      response += `🏨 **Giá khách sạn tại ${location}:**\n${locationHotels.map((h: any) => `- **${h.name}**: ${h.rooms[0]?.price?.toLocaleString() || 0}đ/đêm (${h.rating}⭐)`).join('\n')}\n\n`;
    } else {
      response += `Hiện chưa có khách sạn tại ${location}.\n\n`;
    }
  }
  
  if (hotels.length > 0 && !location) {
    const sortedHotels = [...hotels].sort((a: any, b: any) => (a.rooms[0]?.price || 0) - (b.rooms[0]?.price || 0));
    response += `📊 **Tất cả khách sạn (sắp xếp theo giá):**\n${sortedHotels.map((h: any, i: number) => `${i + 1}. **${h.name}** (${h.city}): ${h.rooms[0]?.price?.toLocaleString() || 0}đ/đêm`).join('\n')}\n\n`;
  }
  
  if (vouchers.length > 0) {
    // Lọc voucher phù hợp với vị trí nếu có
    let relevantVouchers = vouchers;
    if (location) {
      relevantVouchers = vouchers.filter((v: any) => {
        const voucherCode = v.code.toLowerCase();
        const locationLower = location.toLowerCase();
        // Chỉ loại bỏ voucher có tên thành phố khác
        if (locationLower.includes('đà lạt') && voucherCode.includes('hanoi')) return false;
        if (locationLower.includes('hà nội') && voucherCode.includes('dalat')) return false;
        if (locationLower.includes('nha trang') && (voucherCode.includes('dalat') || voucherCode.includes('hanoi'))) return false;
        return true;
      });
    }
    
    if (relevantVouchers.length > 0) {
      response += `🎁 **Voucher giảm giá:**\n${relevantVouchers.map((v: any) => `- **${v.code}**: Giảm ${v.type === 'PERCENT' ? v.discount + '%' : v.discount.toLocaleString() + 'đ'}${v.minSpend ? ` (đơn từ ${v.minSpend.toLocaleString()}đ)` : ''}`).join('\n')}\n\n`;
    }
  }
  
  response += `**💡 Tips tiết kiệm:**
- 📅 Đặt trước 7-14 ngày để có giá tốt nhất
- 🗓️ Tránh cuối tuần và ngày lễ
- 🎫 Sử dụng voucher khi đặt phòng
- 👥 Đặt phòng nhóm để được giảm giá
- 🌙 Chọn phòng không view để tiết kiệm

**🔒 Cam kết giá:**
- Giá minh bạch, không phí ẩn
- Đảm bảo giá tốt nhất thị trường
- Hoàn tiền nếu tìm được giá rẻ hơn`;

  return response;
}

function generateVoucherResponse(context: any): string {
  const { vouchers } = context;
  
  if (vouchers.length === 0) {
    return `🎫 **Về voucher giảm giá:**

Hiện tại không có voucher nào đang có hiệu lực.

**🔔 Cách nhận voucher mới:**
- Đăng ký nhận thông báo qua email
- Theo dõi fanpage Lumina Stay
- Tham gia chương trình khách hàng thân thiết
- Đặt phòng sớm để nhận ưu đãi đặc biệt

**💰 Ưu đãi khác:**
- Giá phòng cạnh tranh nhất thị trường
- Chính sách hủy linh hoạt
- Tích điểm đổi quà
- Ưu đãi sinh nhật và kỷ niệm

**📞 Liên hệ để biết thêm ưu đãi:**
- Hotline: 1900-1234
- Email: promo@luminastay.com

Tôi sẽ thông báo ngay khi có voucher mới! 🔔`;
  }
  
  return `🎁 **Voucher giảm giá hiện có:**

${vouchers.map((v: any) => {
    const discount = v.type === 'PERCENT' ? `${v.discount}%` : `${v.discount.toLocaleString()}đ`;
    return `🎫 **${v.code}**
- 💰 Giảm: ${discount}
${v.minSpend ? `- 🛒 Áp dụng: Đơn từ ${v.minSpend.toLocaleString()}đ` : ''}
- ⏰ Hạn sử dụng: ${new Date(v.endDate).toLocaleDateString('vi-VN')}
${v.description ? `- 📝 ${v.description}` : ''}`;
  }).join('\n\n')}

**📋 Cách sử dụng voucher:**
1. Chọn khách sạn và phòng yêu thích
2. Nhập mã voucher tại bước thanh toán
3. Hệ thống tự động tính giảm giá
4. Kiểm tra lại tổng tiền và xác nhận

**💡 Mẹo sử dụng hiệu quả:**
- So sánh nhiều voucher để chọn tốt nhất
- Chú ý điều kiện áp dụng và hạn sử dụng
- Kết hợp với khuyến mãi khác nếu có
- Đặt phòng sớm để đảm bảo có phòng

Bạn muốn đặt phòng với voucher nào? 🏨`;
}

function generateHelpResponse(context: any): string {
  const { isLoggedIn, user } = context;
  
  return `🆘 **Trung tâm hỗ trợ Lumina Stay:**

${isLoggedIn ? `👋 Xin chào ${user?.name || 'bạn'}! Tôi sẵn sàng hỗ trợ bạn.` : '👋 Xin chào! Tôi là AI Assistant của Lumina Stay.'}

**🎯 Tôi có thể giúp bạn:**
- 🔍 Tìm kiếm và so sánh khách sạn
- 💰 Tư vấn giá cả và voucher giảm giá
- 📋 Hướng dẫn quy trình đặt phòng
- 🗺️ Thông tin điểm du lịch và lịch trình
- 🛠️ Giải quyết vấn đề kỹ thuật
- 📞 Kết nối với nhân viên hỗ trợ

**💬 Cách chat hiệu quả:**
- Hỏi cụ thể: "Khách sạn Đà Lạt giá dưới 2 triệu"
- Nói rõ nhu cầu: "Phòng 2 người, gần trung tâm"
- Đừng ngại hỏi nhiều lần!

**📞 Hỗ trợ trực tiếp:**
- 🔥 Hotline 24/7: 1900-1234
- 📧 Email: support@luminastay.com
- 💬 Live chat: Tôi luôn ở đây!

**🚨 Trường hợp khẩn cấp:**
- Vấn đề đặt phòng: Gọi ngay 1900-1234
- Sự cố tại khách sạn: Liên hệ lễ tân
- Khiếu nại dịch vụ: Email complaint@luminastay.com

Bạn cần hỗ trợ gì cụ thể? Hãy nói với tôi! 😊`;
}

function generateIntelligentResponse(message: string, context: any): string {
  const { hotels, vouchers, attractions, isLoggedIn, targetLocation, locationHotels, locationAttractions } = context;
  
  // Nếu có vị trí cụ thể được hỏi
  if (targetLocation) {
    if ((!locationHotels || locationHotels.length === 0) && (!locationAttractions || locationAttractions.length === 0)) {
      return `🤖 **Về "${message}"**

Hiện tại chưa có thông tin về ${targetLocation} trong hệ thống của chúng tôi.

**📞 Liên hệ tư vấn:**
- Hotline: 1900-1234
- Email: support@luminastay.com
- Chat với tôi để biết thêm thông tin!

**💡 Gợi ý:**
- Hỏi về các điểm đến hiện có
- Tìm hiểu về dịch vụ khác
- Đăng ký nhận thông báo khi có khách sạn mới

Tôi có thể giúp bạn tìm hiểu gì khác không? 🤔`;
    }
    
    let response = `🤖 **Thông tin về ${targetLocation}:**\n\n`;
    
    if (locationHotels && locationHotels.length > 0) {
      response += `🏨 **Khách sạn tại ${targetLocation}:**\n${locationHotels.map((h: any) => `- **${h.name}**\n  💰 ${h.rooms[0]?.price?.toLocaleString() || 0}đ/đêm | ⭐ ${h.rating}/5\n  📍 ${h.address}`).join('\n\n')}\n\n`;
    }
    
    if (locationAttractions && locationAttractions.length > 0) {
      response += `🎯 **Điểm tham quan tại ${targetLocation}:**\n${locationAttractions.map((a: any) => `- **${a.name}**${a.category ? ` (${a.category})` : ''}${a.address ? `\n  📍 ${a.address}` : ''}`).join('\n\n')}\n\n`;
    }
    
    response += `**🎯 Gợi ý cho bạn:**
- Đặt phòng ngay để có giá tốt
- Xem chi tiết khách sạn
- Tư vấn lịch trình du lịch
- Kiểm tra voucher giảm giá

${isLoggedIn ? '✨ **Đặc biệt:** Tôi có thể tư vấn cá nhân hóa dựa trên sở thích của bạn!' : '💡 **Gợi ý:** Đăng nhập để nhận tư vấn cá nhân hóa!'}

Bạn muốn biết thêm gì về ${targetLocation}? 🤔`;
    
    return response;
  }
  
  // Phân tích từ khóa trong tin nhắn cho trường hợp chung
  const keywords = message.toLowerCase().split(' ').filter(word => word.length > 2);
  const relevantKeywords = keywords.filter(word => 
    ['khách', 'sạn', 'phòng', 'đặt', 'giá', 'voucher', 'du', 'lịch', 'tham', 'quan'].includes(word)
  );
  
  if (relevantKeywords.length === 0) {
    return `🤖 **Tôi chưa hiểu rõ câu hỏi "${message}"**

**🎯 Tôi chuyên hỗ trợ về:**
- 🏨 Khách sạn và đặt phòng
- 💰 Giá cả và voucher giảm giá
- 🗺️ Du lịch và điểm tham quan
- 📋 Quy trình booking

**📊 Thông tin hiện có:**
- ${hotels.length} khách sạn chất lượng
- ${vouchers.length} voucher giảm giá
- ${attractions.length} điểm vui chơi

**💡 Thử hỏi như này:**
- "Khách sạn Đà Lạt có gì?"
- "Voucher giảm giá tháng này"
- "Cách đặt phòng như thế nào?"
- "Địa điểm du lịch hot nhất"

Hãy hỏi cụ thể để tôi hỗ trợ tốt nhất! 🚀`;
  }
  
  return `🤖 **Tôi hiểu bạn quan tâm về "${message}"**

**📋 Thông tin liên quan:**
- 🏨 ${hotels.length} khách sạn: ${hotels.slice(0, 2).map((h: any) => h.name).join(', ')}${hotels.length > 2 ? '...' : ''}
- 🎫 ${vouchers.length} voucher hiện có
- 📍 ${attractions.length} điểm tham quan

**🎯 Gợi ý cho bạn:**
- Hỏi cụ thể về thành phố: "Khách sạn Đà Lạt"
- Tìm theo giá: "Phòng dưới 2 triệu"
- Hỏi về dịch vụ: "Cách đặt phòng"
- Tư vấn lịch trình: "Du lịch 3 ngày 2 đêm"

${isLoggedIn ? '✨ **Đặc biệt:** Tôi có thể tư vấn cá nhân hóa dựa trên sở thích của bạn!' : '💡 **Gợi ý:** Đăng nhập để nhận tư vấn cá nhân hóa!'}

Bạn muốn tìm hiểu điều gì cụ thể? 🤔`;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json({ error: "Tin nhắn không được để trống" }, { status: 400 });
    }

    // Lấy context từ database
    const [hotels, vouchers, attractions] = await Promise.all([
      prisma.hotel.findMany({
        where: { status: "ACTIVE" },
        include: { rooms: { take: 1, orderBy: { price: 'asc' } } },
        take: 20
      }),
      prisma.voucher.findMany({
        where: { endDate: { gte: new Date() } },
        take: 10
      }),
      prisma.attraction.findMany({
        where: { status: "PUBLISHED" },
        take: 15
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

    // Tạo phản hồi AI thông minh
    const aiResponse = await generateSmartAIResponse(message, context);

    // Lưu cuộc hội thoại
    if (session?.user?.id) {
      try {
        await prisma.aiConversation.create({
          data: {
            userId: session.user.id,
            userMessage: message,
            aiResponse: aiResponse,
          }
        });
      } catch (error) {
        console.log("Không thể lưu conversation:", error);
      }
    }

    return NextResponse.json({
      response: aiResponse,
      timestamp: new Date().toISOString(),
      context: {
        hotelsCount: hotels.length,
        vouchersCount: vouchers.length,
        attractionsCount: attractions.length,
        aiModel: process.env.OPENAI_API_KEY ? 'OpenAI GPT-3.5' : process.env.GEMINI_API_KEY ? 'Google Gemini' : 'Enhanced Logic'
      }
    });

  } catch (error) {
    console.error("AI Chat Error:", error);
    return NextResponse.json(
      { 
        error: "Có lỗi xảy ra khi xử lý tin nhắn",
        response: `🤖 **Xin lỗi, tôi đang gặp sự cố kỹ thuật.**

**🔧 Đang khắc phục:**
- Hệ thống AI tạm thời gián đoạn
- Vui lòng thử lại sau 30 giây

**📞 Hỗ trợ khẩn cấp:**
- Hotline 24/7: 1900-1234
- Email: support@luminastay.com
- Live chat sẽ sớm hoạt động trở lại

**💡 Trong lúc chờ đợi:**
- Xem danh sách khách sạn trên website
- Kiểm tra voucher giảm giá
- Đọc blog du lịch của chúng tôi

Tôi sẽ sớm trở lại để hỗ trợ bạn tốt hơn! 🚀✨`
      },
      { status: 500 }
    );
  }
}