import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// Tích hợp AI model thực sự với khả năng hiểu ngữ cảnh linh hoạt
async function generateSmartAIResponse(message: string, context: any): Promise<string> {
  const { hotels, vouchers, attractions, user, currentTime, isLoggedIn } = context;
  
  // Phân tích vị trí được hỏi trong tin nhắn (giữ nguyên logic này)
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

  // Tạo system prompt linh hoạt và thông minh hơn
  const systemPrompt = `Bạn là AI Assistant thông minh của Lumina Stay - hệ thống đặt phòng khách sạn hàng đầu Việt Nam.

NHIỆM VỤ: Trả lời câu hỏi của khách hàng một cách TỰ NHIÊN, THÔNG MINH và HỮU ÍCH dựa trên dữ liệu thực từ hệ thống.

THÔNG TIN HỆ THỐNG HIỆN TẠI:
- Thời gian: ${currentTime}
- Người dùng: ${isLoggedIn ? `${user?.name || 'Khách hàng'} (đã đăng nhập)` : 'Khách (chưa đăng nhập)'}
- Tổng khách sạn: ${hotels.length}
- Voucher có hiệu lực: ${vouchers.length}
- Điểm tham quan: ${attractions.length}

DỮ LIỆU KHÁCH SẠN:
${hotels.map((h: any) => `- ${h.name} (${h.city}): ${h.rooms[0]?.price?.toLocaleString() || 0}đ/đêm, ${h.rating}⭐, ${h.address}`).join('\n')}

VOUCHER GIẢM GIÁ:
${vouchers.map((v: any) => `- ${v.code}: Giảm ${v.type === 'PERCENT' ? v.discount + '%' : v.discount.toLocaleString() + 'đ'}${v.minSpend ? ` (đơn từ ${v.minSpend.toLocaleString()}đ)` : ''}, HSD: ${new Date(v.endDate).toLocaleDateString('vi-VN')}`).join('\n')}

ĐIỂM THAM QUAN:
${attractions.map((a: any) => `- ${a.name} (${a.city})${a.category ? ` - ${a.category}` : ''}${a.address ? `, ${a.address}` : ''}`).join('\n')}

${targetLocation ? `
🎯 KHÁCH HÀNG HỎI VỀ: ${targetLocation}

KHÁCH SẠN TẠI ${targetLocation}:
${locationHotels.length > 0 ? locationHotels.map((h: any) => `- ${h.name}: ${h.rooms[0]?.price?.toLocaleString() || 0}đ/đêm, ${h.rating}⭐, ${h.address}`).join('\n') : `KHÔNG CÓ khách sạn nào tại ${targetLocation}`}

ĐIỂM THAM QUAN TẠI ${targetLocation}:
${locationAttractions.length > 0 ? locationAttractions.map((a: any) => `- ${a.name}${a.category ? ` (${a.category})` : ''}${a.address ? `, ${a.address}` : ''}`).join('\n') : `KHÔNG CÓ điểm tham quan nào tại ${targetLocation}`}

⚠️ QUAN TRỌNG: CHỈ trả lời về ${targetLocation}, KHÔNG đề cập đến thành phố khác!
` : ''}

NGUYÊN TẮC PHẢN HỒI THÔNG MINH:

1. **HIỂU NGỮ CẢNH**: Phân tích ý định thực sự của khách hàng, không chỉ dựa vào từ khóa
2. **TỰ NHIÊN**: Trả lời như một người bạn am hiểu du lịch, không dùng template cứng
3. **CHÍNH XÁC**: CHỈ dùng thông tin từ dữ liệu trên, KHÔNG bịa đặt
4. **HỮU ÍCH**: Đưa ra gợi ý cụ thể, hành động tiếp theo rõ ràng
5. **CÁ NHÂN HÓA**: Điều chỉnh phong cách dựa trên trạng thái đăng nhập
6. **LINH HOẠT**: Xử lý cả câu hỏi đơn giản và phức tạp

PHONG CÁCH:
- Thân thiện, nhiệt tình nhưng chuyên nghiệp
- Sử dụng emoji phù hợp (không quá nhiều)
- Câu văn tự nhiên, không máy móc
- Đưa ra lời khuyên thực tế và hữu ích
- Khuyến khích tương tác tiếp theo

VÍ DỤ XỬ LÝ THÔNG MINH:
- "Khách sạn Đà Lạt" → Giới thiệu khách sạn Đà Lạt + gợi ý lịch trình + voucher phù hợp
- "Tôi muốn đi du lịch" → Hỏi thêm về sở thích, ngân sách, thời gian để tư vấn cụ thể
- "Giá phòng bao nhiêu?" → Nếu không rõ địa điểm, hỏi lại + đưa ra bảng giá tham khảo
- "Có gì vui ở Đà Lạt?" → Kết hợp khách sạn + điểm tham quan + lời khuyên thực tế

LƯU Ý ĐỘC QUYỀN:
- Nếu hỏi về địa điểm không có dữ liệu: Thừa nhận thẳng thắn + gợi ý liên hệ + đề xuất địa điểm khác
- Nếu câu hỏi mơ hồ: Hỏi lại một cách thông minh để hiểu rõ nhu cầu
- Luôn kết thúc bằng câu hỏi mở để khuyến khích tương tác tiếp

HÃY TRẢ LỜI MỘT CÁCH THÔNG MINH, TỰ NHIÊN VÀ HỮU ÍCH!`;

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

    // Nếu cả hai API đều không khả dụng, dùng Intelligent Fallback
    console.log('🧠 Using Intelligent Fallback System...');
    return generateIntelligentFallback(message, context);

  } catch (error) {
    console.error('AI API Error:', error);
    return generateIntelligentFallback(message, context);
  }
}

// Hệ thống fallback thông minh - không dùng template cứng
function generateIntelligentFallback(message: string, context: any): string {
  const { hotels, vouchers, attractions, user, isLoggedIn } = context;
  const lowerMessage = message.toLowerCase();
  
  // Phân tích ngữ cảnh và ý định một cách thông minh
  const analysis = analyzeUserIntent(message, context);
  
  // Tạo phản hồi dựa trên phân tích thông minh
  return generateContextualResponse(analysis, context);
}

// Phân tích ý định người dùng một cách thông minh
function analyzeUserIntent(message: string, context: any) {
  const lowerMessage = message.toLowerCase();
  const { hotels, vouchers, attractions } = context;
  
  // Xác định vị trí
  let location = null;
  let locationData = { hotels: [], attractions: [] };
  
  if (lowerMessage.includes('đà lạt') || lowerMessage.includes('dalat')) {
    location = 'Đà Lạt';
    locationData.hotels = hotels.filter((h: any) => h.city.toLowerCase().includes('đà lạt'));
    locationData.attractions = attractions.filter((a: any) => a.city.toLowerCase().includes('đà lạt'));
  } else if (lowerMessage.includes('hà nội') || lowerMessage.includes('hanoi')) {
    location = 'Hà Nội';
    locationData.hotels = hotels.filter((h: any) => h.city.toLowerCase().includes('hà nội'));
    locationData.attractions = attractions.filter((a: any) => a.city.toLowerCase().includes('hà nội'));
  } else if (lowerMessage.includes('nha trang')) {
    location = 'Nha Trang';
    locationData.hotels = hotels.filter((h: any) => h.city.toLowerCase().includes('nha trang'));
    locationData.attractions = attractions.filter((a: any) => a.city.toLowerCase().includes('nha trang'));
  }
  
  // Phân tích ý định chính
  const intents = [];
  
  // Greeting
  if (/^(xin chào|hello|hi|chào|hey)/.test(lowerMessage)) {
    intents.push({ type: 'greeting', confidence: 0.9 });
  }
  
  // Booking intent
  if (/(đặt|book|thuê|reservation)/.test(lowerMessage)) {
    intents.push({ type: 'booking', confidence: 0.8 });
  }
  
  // Search intent
  if (/(tìm|search|có|show|xem)/.test(lowerMessage)) {
    intents.push({ type: 'search', confidence: 0.7 });
  }
  
  // Price inquiry
  if (/(giá|bao nhiêu|cost|tiền|chi phí)/.test(lowerMessage)) {
    intents.push({ type: 'price', confidence: 0.8 });
  }
  
  // Voucher inquiry
  if (/(voucher|giảm giá|khuyến mãi|ưu đãi|discount)/.test(lowerMessage)) {
    intents.push({ type: 'voucher', confidence: 0.8 });
  }
  
  // Help request
  if (/(giúp|help|hỗ trợ|hướng dẫn|làm sao)/.test(lowerMessage)) {
    intents.push({ type: 'help', confidence: 0.7 });
  }
  
  // Thanks
  if (/(cảm ơn|thank|thanks)/.test(lowerMessage)) {
    intents.push({ type: 'thanks', confidence: 0.9 });
  }
  
  // Goodbye
  if (/(tạm biệt|bye|goodbye)/.test(lowerMessage)) {
    intents.push({ type: 'goodbye', confidence: 0.9 });
  }
  
  // Determine primary intent
  const primaryIntent = intents.length > 0 
    ? intents.reduce((prev, current) => (prev.confidence > current.confidence) ? prev : current)
    : { type: 'general', confidence: 0.5 };
  
  // Analyze complexity and context
  const complexity = analyzeComplexity(message);
  const entities = extractEntities(message, context);
  
  return {
    message,
    location,
    locationData,
    primaryIntent,
    allIntents: intents,
    complexity,
    entities,
    hasSpecificLocation: !!location,
    isQuestion: message.includes('?') || /(gì|nào|sao|thế nào|như thế nào)/.test(lowerMessage),
    isComparison: /(so sánh|khác|tốt hơn|rẻ hơn)/.test(lowerMessage)
  };
}

// Phân tích độ phức tạp của câu hỏi
function analyzeComplexity(message: string): 'simple' | 'medium' | 'complex' {
  const words = message.split(' ').length;
  const hasMultipleQuestions = (message.match(/\?/g) || []).length > 1;
  const hasConjunctions = /(và|hoặc|nhưng|tuy nhiên|ngoài ra)/.test(message.toLowerCase());
  
  if (words <= 5 && !hasMultipleQuestions) return 'simple';
  if (words <= 15 && !hasConjunctions) return 'medium';
  return 'complex';
}

// Trích xuất thực thể từ tin nhắn
function extractEntities(message: string, context: any) {
  const entities = {
    priceRange: null,
    timeframe: null,
    groupSize: null,
    amenities: [],
    dates: []
  };
  
  // Extract price range
  const priceMatch = message.match(/(\d+)\s*(triệu|tr|k|nghìn)/i);
  if (priceMatch) {
    const amount = parseInt(priceMatch[1]);
    const unit = priceMatch[2].toLowerCase();
    entities.priceRange = unit.includes('triệu') || unit.includes('tr') 
      ? amount * 1000000 
      : amount * 1000;
  }
  
  // Extract group size
  const groupMatch = message.match(/(\d+)\s*(người|khách)/i);
  if (groupMatch) {
    entities.groupSize = parseInt(groupMatch[1]);
  }
  
  // Extract timeframe
  if (/(ngày|đêm|tuần|tháng)/.test(message)) {
    const timeMatch = message.match(/(\d+)\s*(ngày|đêm|tuần|tháng)/i);
    if (timeMatch) {
      entities.timeframe = `${timeMatch[1]} ${timeMatch[2]}`;
    }
  }
  
  // Extract amenities
  const amenityKeywords = ['hồ bơi', 'spa', 'gym', 'wifi', 'bãi đậu xe', 'nhà hàng', 'bar'];
  entities.amenities = amenityKeywords.filter(amenity => 
    message.toLowerCase().includes(amenity)
  );
  
  return entities;
}

// Tạo phản hồi dựa trên ngữ cảnh
function generateContextualResponse(analysis: any, context: any): string {
  const { message, location, locationData, primaryIntent, complexity, entities, isQuestion } = analysis;
  const { hotels, vouchers, attractions, user, isLoggedIn } = context;
  
  // Xử lý theo ý định chính
  switch (primaryIntent.type) {
    case 'greeting':
      return generateSmartGreeting(context, analysis);
    
    case 'booking':
      return generateSmartBookingResponse(context, analysis);
    
    case 'search':
      return generateSmartSearchResponse(context, analysis);
    
    case 'price':
      return generateSmartPriceResponse(context, analysis);
    
    case 'voucher':
      return generateSmartVoucherResponse(context, analysis);
    
    case 'help':
      return generateSmartHelpResponse(context, analysis);
    
    case 'thanks':
      return generateSmartThanksResponse(context, analysis);
    
    case 'goodbye':
      return generateSmartGoodbyeResponse(context, analysis);
    
    default:
      return generateSmartGeneralResponse(context, analysis);
  }
}

// Các hàm tạo phản hồi thông minh
function generateSmartGreeting(context: any, analysis: any): string {
  const { user, isLoggedIn, hotels, vouchers } = context;
  const greeting = isLoggedIn ? `Chào ${user?.name || 'bạn'}! 👋` : 'Xin chào! 👋';
  
  const responses = [
    `${greeting} Tôi là AI Assistant của Lumina Stay. Tôi có thể giúp bạn tìm khách sạn tuyệt vời và lên kế hoạch du lịch hoàn hảo!`,
    `${greeting} Rất vui được gặp bạn! Tôi ở đây để hỗ trợ bạn khám phá ${hotels.length} khách sạn chất lượng cao của chúng tôi.`,
    `${greeting} Chào mừng đến với Lumina Stay! Hôm nay bạn muốn khám phá điểm đến nào?`
  ];
  
  let response = responses[Math.floor(Math.random() * responses.length)];
  
  if (vouchers.length > 0) {
    response += ` 🎁 Đặc biệt hôm nay có ${vouchers.length} voucher giảm giá hấp dẫn đang chờ bạn!`;
  }
  
  response += `\n\nBạn có kế hoạch du lịch gì không? Tôi có thể tư vấn về khách sạn, địa điểm tham quan, hoặc giúp bạn tìm ưu đãi tốt nhất! 😊`;
  
  return response;
}

function generateSmartBookingResponse(context: any, analysis: any): string {
  const { location, locationData, entities } = analysis;
  const { isLoggedIn } = context;
  
  let response = '';
  
  if (location) {
    if (locationData.hotels.length > 0) {
      response = `Tuyệt vời! Bạn muốn đặt phòng tại ${location}. `;
      response += `Chúng tôi có ${locationData.hotels.length} khách sạn tại đây:\n\n`;
      
      locationData.hotels.forEach((hotel: any, index: number) => {
        response += `${index + 1}. **${hotel.name}**\n`;
        response += `   💰 Từ ${hotel.rooms[0]?.price?.toLocaleString() || 0}đ/đêm\n`;
        response += `   ⭐ ${hotel.rating}/5 sao\n`;
        response += `   📍 ${hotel.address}\n\n`;
      });
      
      if (entities.priceRange) {
        const suitableHotels = locationData.hotels.filter((h: any) => 
          (h.rooms[0]?.price || 0) <= entities.priceRange
        );
        if (suitableHotels.length > 0) {
          response += `💡 Dựa trên ngân sách ${entities.priceRange.toLocaleString()}đ của bạn, tôi đặc biệt gợi ý ${suitableHotels[0].name}!\n\n`;
        }
      }
      
      response += `Để đặt phòng, bạn chỉ cần:\n`;
      response += `1. Chọn khách sạn yêu thích\n`;
      response += `2. Chọn ngày nhận/trả phòng\n`;
      response += `3. Điền thông tin và thanh toán\n\n`;
      
      if (!isLoggedIn) {
        response += `💡 **Tip**: Đăng nhập để đặt phòng nhanh hơn và nhận ưu đãi độc quyền!\n\n`;
      }
      
      response += `Bạn muốn tôi hỗ trợ thêm gì về việc đặt phòng tại ${location}?`;
    } else {
      response = `Rất tiếc, hiện tại chúng tôi chưa có khách sạn tại ${location}. `;
      response += `Nhưng đừng lo! Tôi có thể gợi ý những điểm đến tuyệt vời khác:\n\n`;
      response += `🌲 **Đà Lạt** - Thành phố ngàn hoa với khí hậu mát mẻ\n`;
      response += `🏛️ **Hà Nội** - Thủ đô với văn hóa nghìn năm\n\n`;
      response += `Hoặc bạn có thể để lại thông tin, chúng tôi sẽ thông báo ngay khi có khách sạn tại ${location}!`;
    }
  } else {
    response = `Tôi sẵn sàng hỗ trợ bạn đặt phòng! `;
    
    if (entities.groupSize) {
      response += `Tôi hiểu bạn cần phòng cho ${entities.groupSize} người. `;
    }
    
    if (entities.timeframe) {
      response += `Và bạn dự định ở ${entities.timeframe}. `;
    }
    
    response += `Để tư vấn chính xác nhất, bạn có thể cho tôi biết:\n\n`;
    response += `📍 Bạn muốn đi đâu?\n`;
    response += `📅 Khi nào bạn muốn đi?\n`;
    response += `💰 Ngân sách dự kiến của bạn?\n`;
    response += `👥 Bao nhiêu người đi cùng?\n\n`;
    response += `Với thông tin này, tôi sẽ tìm được khách sạn hoàn hảo cho chuyến đi của bạn! 🎯`;
  }
  
  return response;
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

function generateSmartSearchResponse(context: any, analysis: any): string {
  const { location, locationData, entities, complexity } = analysis;
  const { hotels, attractions } = context;
  
  if (location) {
    let response = `🔍 Tìm kiếm về ${location}:\n\n`;
    
    if (locationData.hotels.length > 0) {
      response += `🏨 **Khách sạn tại ${location}:**\n`;
      locationData.hotels.forEach((hotel: any, index: number) => {
        response += `${index + 1}. **${hotel.name}**\n`;
        response += `   💰 ${hotel.rooms[0]?.price?.toLocaleString() || 0}đ/đêm | ⭐ ${hotel.rating}/5\n`;
        response += `   📍 ${hotel.address}\n\n`;
      });
    }
    
    if (locationData.attractions.length > 0) {
      response += `🎯 **Điểm tham quan tại ${location}:**\n`;
      locationData.attractions.forEach((attraction: any, index: number) => {
        response += `${index + 1}. **${attraction.name}**`;
        if (attraction.category) response += ` (${attraction.category})`;
        if (attraction.address) response += `\n   📍 ${attraction.address}`;
        response += '\n\n';
      });
    }
    
    if (locationData.hotels.length === 0 && locationData.attractions.length === 0) {
      response += `Rất tiếc, hiện tại chưa có thông tin về ${location}.\n\n`;
      response += `💡 **Gợi ý khác:**\n`;
      response += `- 🌲 Đà Lạt: Thành phố ngàn hoa, khí hậu mát mẻ\n`;
      response += `- 🏛️ Hà Nội: Thủ đô với văn hóa nghìn năm\n\n`;
      response += `Hoặc bạn có thể liên hệ để được tư vấn thêm!`;
    } else {
      response += `Bạn muốn biết thêm chi tiết về khách sạn hoặc điểm tham quan nào? 🤔`;
    }
    
    return response;
  }
  
  // Tìm kiếm chung
  let response = `🔍 **Kết quả tìm kiếm:**\n\n`;
  
  if (entities.priceRange) {
    const affordableHotels = hotels.filter((h: any) => 
      (h.rooms[0]?.price || 0) <= entities.priceRange
    );
    if (affordableHotels.length > 0) {
      response += `💰 **Khách sạn trong ngân sách ${entities.priceRange.toLocaleString()}đ:**\n`;
      affordableHotels.slice(0, 3).forEach((hotel: any, index: number) => {
        response += `${index + 1}. ${hotel.name} (${hotel.city}) - ${hotel.rooms[0]?.price?.toLocaleString() || 0}đ/đêm\n`;
      });
      response += '\n';
    }
  }
  
  if (entities.amenities.length > 0) {
    response += `🏊 **Tìm kiếm theo tiện ích:** ${entities.amenities.join(', ')}\n`;
    response += `Tôi sẽ ghi nhận yêu cầu này để tư vấn phù hợp nhất!\n\n`;
  }
  
  response += `📊 **Tổng quan hệ thống:**\n`;
  response += `- 🏨 ${hotels.length} khách sạn chất lượng\n`;
  response += `- 📍 ${attractions.length} điểm tham quan\n`;
  response += `- 🎯 Phủ sóng các thành phố lớn\n\n`;
  
  response += `💡 **Gợi ý tìm kiếm hiệu quả:**\n`;
  response += `- "Khách sạn Đà Lạt dưới 2 triệu"\n`;
  response += `- "Phòng 4 người gần trung tâm"\n`;
  response += `- "Du lịch Hà Nội 3 ngày 2 đêm"\n\n`;
  
  response += `Bạn muốn tìm kiếm cụ thể hơn không? 🎯`;
  
  return response;
}

function generateSmartPriceResponse(context: any, analysis: any): string {
  const { location, locationData, entities } = analysis;
  const { hotels, vouchers } = context;
  
  let response = `💰 **Thông tin giá cả:**\n\n`;
  
  if (location) {
    if (locationData.hotels.length > 0) {
      response += `🏨 **Bảng giá khách sạn tại ${location}:**\n`;
      const sortedHotels = [...locationData.hotels].sort((a: any, b: any) => 
        (a.rooms[0]?.price || 0) - (b.rooms[0]?.price || 0)
      );
      
      sortedHotels.forEach((hotel: any, index: number) => {
        const price = hotel.rooms[0]?.price || 0;
        response += `${index + 1}. **${hotel.name}**\n`;
        response += `   💵 ${price.toLocaleString()}đ/đêm | ⭐ ${hotel.rating}/5\n`;
        
        if (entities.priceRange && price <= entities.priceRange) {
          response += `   ✅ Phù hợp ngân sách của bạn!\n`;
        }
        response += '\n';
      });
      
      const avgPrice = sortedHotels.reduce((sum: number, h: any) => 
        sum + (h.rooms[0]?.price || 0), 0) / sortedHotels.length;
      response += `📊 **Giá trung bình tại ${location}:** ${avgPrice.toLocaleString()}đ/đêm\n\n`;
    }
  } else {
    // Hiển thị giá tất cả khách sạn
    const sortedHotels = [...hotels].sort((a: any, b: any) => 
      (a.rooms[0]?.price || 0) - (b.rooms[0]?.price || 0)
    );
    
    response += `🏨 **Bảng giá tất cả khách sạn:**\n`;
    sortedHotels.forEach((hotel: any, index: number) => {
      response += `${index + 1}. ${hotel.name} (${hotel.city}) - ${hotel.rooms[0]?.price?.toLocaleString() || 0}đ/đêm\n`;
    });
    response += '\n';
  }
  
  // Hiển thị voucher phù hợp
  if (vouchers.length > 0) {
    let relevantVouchers = vouchers;
    if (location) {
      relevantVouchers = vouchers.filter((v: any) => {
        const code = v.code.toLowerCase();
        const loc = location.toLowerCase();
        return !((loc.includes('đà lạt') && code.includes('hanoi')) ||
                (loc.includes('hà nội') && code.includes('dalat')));
      });
    }
    
    if (relevantVouchers.length > 0) {
      response += `🎁 **Voucher giảm giá có thể áp dụng:**\n`;
      relevantVouchers.slice(0, 3).forEach((voucher: any) => {
        const discount = voucher.type === 'PERCENT' 
          ? `${voucher.discount}%` 
          : `${voucher.discount.toLocaleString()}đ`;
        response += `- **${voucher.code}**: Giảm ${discount}`;
        if (voucher.minSpend) {
          response += ` (đơn từ ${voucher.minSpend.toLocaleString()}đ)`;
        }
        response += '\n';
      });
      response += '\n';
    }
  }
  
  response += `💡 **Mẹo tiết kiệm chi phí:**\n`;
  response += `- 📅 Đặt trước 1-2 tuần để có giá tốt\n`;
  response += `- 🗓️ Tránh cuối tuần và ngày lễ\n`;
  response += `- 🎫 Sử dụng voucher khi thanh toán\n`;
  response += `- 👥 Đặt phòng nhóm để được ưu đãi\n\n`;
  
  if (entities.priceRange) {
    response += `🎯 **Dựa trên ngân sách ${entities.priceRange.toLocaleString()}đ của bạn:**\n`;
    const suitableHotels = (location ? locationData.hotels : hotels).filter((h: any) => 
      (h.rooms[0]?.price || 0) <= entities.priceRange
    );
    
    if (suitableHotels.length > 0) {
      response += `Có ${suitableHotels.length} khách sạn phù hợp. Tôi đặc biệt gợi ý **${suitableHotels[0].name}**!\n\n`;
    } else {
      response += `Hiện tại chưa có khách sạn trong tầm giá này. Bạn có thể tăng ngân sách hoặc chờ khuyến mãi!\n\n`;
    }
  }
  
  response += `Bạn muốn tôi tư vấn cụ thể cho ngân sách nào? 💭`;
  
  return response;
}

function generateSmartVoucherResponse(context: any, analysis: any): string {
  const { vouchers } = context;
  const { location } = analysis;
  
  if (vouchers.length === 0) {
    return `🎫 **Về voucher giảm giá:**\n\nHiện tại không có voucher nào đang có hiệu lực.\n\n**🔔 Cách nhận voucher mới:**\n- Đăng ký nhận thông báo qua email\n- Theo dõi fanpage Lumina Stay\n- Tham gia chương trình khách hàng thân thiết\n- Đặt phòng sớm để nhận ưu đãi đặc biệt\n\n**📞 Liên hệ:** 1900-1234 để biết thêm ưu đãi!`;
  }
  
  let response = `🎁 **Voucher giảm giá hiện có:**\n\n`;
  
  // Lọc voucher theo vị trí nếu có
  let relevantVouchers = vouchers;
  if (location) {
    relevantVouchers = vouchers.filter((v: any) => {
      const code = v.code.toLowerCase();
      const loc = location.toLowerCase();
      return !((loc.includes('đà lạt') && code.includes('hanoi')) ||
              (loc.includes('hà nội') && code.includes('dalat')));
    });
    
    if (relevantVouchers.length < vouchers.length) {
      response += `🎯 **Voucher áp dụng cho ${location}:**\n\n`;
    }
  }
  
  relevantVouchers.forEach((voucher: any, index: number) => {
    const discount = voucher.type === 'PERCENT' 
      ? `${voucher.discount}%` 
      : `${voucher.discount.toLocaleString()}đ`;
    
    response += `${index + 1}. **${voucher.code}**\n`;
    response += `   💰 Giảm: ${discount}\n`;
    if (voucher.minSpend) {
      response += `   🛒 Điều kiện: Đơn từ ${voucher.minSpend.toLocaleString()}đ\n`;
    }
    response += `   ⏰ Hạn sử dụng: ${new Date(voucher.endDate).toLocaleDateString('vi-VN')}\n`;
    if (voucher.description) {
      response += `   📝 ${voucher.description}\n`;
    }
    response += '\n';
  });
  
  response += `**📋 Cách sử dụng voucher:**\n`;
  response += `1. Chọn khách sạn và phòng yêu thích\n`;
  response += `2. Nhập mã voucher tại bước thanh toán\n`;
  response += `3. Hệ thống tự động tính giảm giá\n`;
  response += `4. Kiểm tra và xác nhận đặt phòng\n\n`;
  
  response += `💡 **Mẹo sử dụng hiệu quả:**\n`;
  response += `- So sánh nhiều voucher để chọn tốt nhất\n`;
  response += `- Chú ý điều kiện và hạn sử dụng\n`;
  response += `- Kết hợp với khuyến mãi khác nếu có\n\n`;
  
  response += `Bạn muốn đặt phòng với voucher nào? Tôi sẽ hướng dẫn chi tiết! 🏨`;
  
  return response;
}

function generateSmartHelpResponse(context: any, analysis: any): string {
  const { isLoggedIn, user } = context;
  const { complexity, entities } = analysis;
  
  let response = `🆘 **Trung tâm hỗ trợ Lumina Stay:**\n\n`;
  
  if (isLoggedIn) {
    response += `👋 Xin chào ${user?.name || 'bạn'}! Tôi sẵn sàng hỗ trợ bạn.\n\n`;
  } else {
    response += `👋 Xin chào! Tôi là AI Assistant của Lumina Stay.\n\n`;
  }
  
  // Tùy chỉnh hỗ trợ dựa trên độ phức tạp
  if (complexity === 'complex') {
    response += `🎯 **Hỗ trợ chuyên sâu:**\n`;
    response += `- 📞 Kết nối với chuyên viên tư vấn: 1900-1234\n`;
    response += `- 📧 Email chi tiết: support@luminastay.com\n`;
    response += `- 💬 Chat với tôi để phân tích từng bước\n\n`;
  }
  
  response += `**🎯 Tôi có thể giúp bạn:**\n`;
  response += `- 🔍 Tìm kiếm và so sánh khách sạn\n`;
  response += `- 💰 Tư vấn giá cả và voucher giảm giá\n`;
  response += `- 📋 Hướng dẫn quy trình đặt phòng\n`;
  response += `- 🗺️ Thông tin điểm du lịch và lịch trình\n`;
  response += `- 🛠️ Giải quyết vấn đề kỹ thuật\n\n`;
  
  if (entities.priceRange || entities.groupSize || entities.timeframe) {
    response += `**🎯 Dựa trên thông tin bạn cung cấp:**\n`;
    if (entities.priceRange) {
      response += `- 💰 Ngân sách: ${entities.priceRange.toLocaleString()}đ\n`;
    }
    if (entities.groupSize) {
      response += `- 👥 Số người: ${entities.groupSize}\n`;
    }
    if (entities.timeframe) {
      response += `- ⏰ Thời gian: ${entities.timeframe}\n`;
    }
    response += `Tôi sẽ tư vấn cá nhân hóa cho bạn!\n\n`;
  }
  
  response += `**💬 Cách chat hiệu quả:**\n`;
  response += `- Hỏi cụ thể: "Khách sạn Đà Lạt giá dưới 2 triệu"\n`;
  response += `- Nói rõ nhu cầu: "Phòng 2 người, gần trung tâm"\n`;
  response += `- Đừng ngại hỏi nhiều lần!\n\n`;
  
  response += `**📞 Hỗ trợ trực tiếp 24/7:**\n`;
  response += `- 🔥 Hotline: 1900-1234\n`;
  response += `- 📧 Email: support@luminastay.com\n`;
  response += `- 💬 Live chat: Tôi luôn ở đây!\n\n`;
  
  response += `Bạn cần hỗ trợ gì cụ thể? Hãy nói với tôi! 😊`;
  
  return response;
}

function generateSmartThanksResponse(context: any, analysis: any): string {
  const { isLoggedIn, user, vouchers } = context;
  
  let response = `🙏 **Cảm ơn bạn rất nhiều!**\n\n`;
  
  if (isLoggedIn) {
    response += `Rất vui được hỗ trợ ${user?.name || 'bạn'} hôm nay!\n\n`;
  } else {
    response += `Rất vui được hỗ trợ bạn hôm nay!\n\n`;
  }
  
  response += `**🌟 Nếu cần thêm hỗ trợ:**\n`;
  response += `- 💬 Tiếp tục chat với tôi bất cứ lúc nào\n`;
  response += `- 🏨 Khám phá thêm khách sạn tuyệt vời\n`;
  
  if (vouchers.length > 0) {
    response += `- 🎫 Sử dụng ${vouchers.length} voucher đang có hiệu lực\n`;
  }
  
  response += `- 📞 Gọi hotline 24/7: 1900-1234\n\n`;
  
  if (!isLoggedIn) {
    response += `💡 **Gợi ý:** Đăng ký tài khoản để nhận ưu đãi độc quyền và đặt phòng nhanh hơn!\n\n`;
  }
  
  response += `**📝 Đánh giá dịch vụ:**\n`;
  response += `Ý kiến của bạn rất quan trọng! Hãy để lại đánh giá để giúp Lumina Stay ngày càng tốt hơn.\n\n`;
  
  response += `Chúc bạn có những chuyến du lịch tuyệt vời! ✈️🏖️✨`;
  
  return response;
}

function generateSmartGoodbyeResponse(context: any, analysis: any): string {
  const { isLoggedIn, user, hotels } = context;
  
  let response = `👋 **Tạm biệt và hẹn gặp lại!**\n\n`;
  
  if (isLoggedIn) {
    response += `Cảm ơn ${user?.name || 'bạn'} đã tin tưởng Lumina Stay!\n\n`;
  } else {
    response += `Cảm ơn bạn đã tin tưởng và sử dụng dịch vụ của Lumina Stay!\n\n`;
  }
  
  response += `**🎁 Đừng quên:**\n`;
  response += `- 🔔 Theo dõi để nhận thông báo ưu đãi mới\n`;
  response += `- 💾 Lưu lại thông tin khách sạn yêu thích\n`;
  response += `- 📱 Bookmark trang web để đặt phòng nhanh hơn\n\n`;
  
  if (hotels.length > 0) {
    response += `**🏨 Nhắc nhở:**\n`;
    response += `Chúng tôi có ${hotels.length} khách sạn chất lượng cao đang chờ bạn khám phá!\n\n`;
  }
  
  response += `**📞 Liên hệ khi cần hỗ trợ:**\n`;
  response += `- 💬 Chat với tôi 24/7 - luôn sẵn sàng!\n`;
  response += `- 📞 Hotline: 1900-1234\n`;
  response += `- 📧 Email: support@luminastay.com\n\n`;
  
  response += `Hẹn sớm được phục vụ bạn lần nữa! 🌟💙`;
  
  return response;
}

function generateSmartGeneralResponse(context: any, analysis: any): string {
  const { message, location, entities, isQuestion, isComparison, complexity } = analysis;
  const { hotels, vouchers, attractions, isLoggedIn } = context;
  
  let response = `🤖 **Tôi hiểu bạn quan tâm về "${message}"**\n\n`;
  
  // Xử lý câu hỏi so sánh
  if (isComparison) {
    response += `📊 **So sánh thông tin:**\n`;
    if (hotels.length > 1) {
      const sortedHotels = [...hotels].sort((a: any, b: any) => 
        (b.rating || 0) - (a.rating || 0)
      );
      response += `🏆 **Top khách sạn theo đánh giá:**\n`;
      sortedHotels.slice(0, 3).forEach((hotel: any, index: number) => {
        response += `${index + 1}. ${hotel.name} (${hotel.city}) - ${hotel.rating}⭐\n`;
      });
      response += '\n';
    }
  }
  
  // Xử lý câu hỏi phức tạp
  if (complexity === 'complex') {
    response += `🧠 **Phân tích câu hỏi phức tạp:**\n`;
    response += `Tôi nhận thấy bạn có nhiều yêu cầu. Để tư vấn chính xác nhất, hãy chia nhỏ câu hỏi:\n\n`;
    
    if (entities.priceRange) {
      response += `💰 **Về ngân sách ${entities.priceRange.toLocaleString()}đ:**\n`;
      const affordableHotels = hotels.filter((h: any) => 
        (h.rooms[0]?.price || 0) <= entities.priceRange
      );
      response += `Có ${affordableHotels.length} khách sạn phù hợp.\n\n`;
    }
    
    if (entities.groupSize) {
      response += `👥 **Về nhóm ${entities.groupSize} người:**\n`;
      response += `Tôi sẽ gợi ý loại phòng phù hợp và có thể đặt nhiều phòng nếu cần.\n\n`;
    }
    
    response += `Bạn muốn tôi tư vấn từng vấn đề một không? 🎯`;
    return response;
  }
  
  // Phản hồi chung thông minh
  response += `**📋 Thông tin liên quan:**\n`;
  
  if (location) {
    response += `📍 **Về ${location}:** `;
    const locationHotels = hotels.filter((h: any) => 
      h.city.toLowerCase().includes(location.toLowerCase())
    );
    const locationAttractions = attractions.filter((a: any) => 
      a.city.toLowerCase().includes(location.toLowerCase())
    );
    
    if (locationHotels.length > 0 || locationAttractions.length > 0) {
      response += `Có ${locationHotels.length} khách sạn và ${locationAttractions.length} điểm tham quan\n`;
    } else {
      response += `Hiện chưa có thông tin trong hệ thống\n`;
    }
  }
  
  response += `- 🏨 ${hotels.length} khách sạn chất lượng\n`;
  response += `- 🎫 ${vouchers.length} voucher giảm giá\n`;
  response += `- 📍 ${attractions.length} điểm tham quan\n\n`;
  
  // Gợi ý thông minh dựa trên entities
  response += `**🎯 Gợi ý cho bạn:**\n`;
  
  if (entities.priceRange) {
    response += `- Tìm khách sạn trong ngân sách ${entities.priceRange.toLocaleString()}đ\n`;
  } else {
    response += `- Hỏi cụ thể về thành phố: "Khách sạn Đà Lạt"\n`;
  }
  
  if (entities.timeframe) {
    response += `- Lên kế hoạch cho chuyến đi ${entities.timeframe}\n`;
  } else {
    response += `- Tìm theo giá: "Phòng dưới 2 triệu"\n`;
  }
  
  if (entities.groupSize) {
    response += `- Tư vấn phòng cho ${entities.groupSize} người\n`;
  } else {
    response += `- Hỏi về dịch vụ: "Cách đặt phòng"\n`;
  }
  
  response += `- Tư vấn lịch trình: "Du lịch 3 ngày 2 đêm"\n\n`;
  
  if (isLoggedIn) {
    response += `✨ **Đặc biệt:** Tôi có thể tư vấn cá nhân hóa dựa trên sở thích của bạn!\n\n`;
  } else {
    response += `💡 **Gợi ý:** Đăng nhập để nhận tư vấn cá nhân hóa!\n\n`;
  }
  
  if (isQuestion) {
    response += `Bạn muốn tôi giải đáp cụ thể điều gì? 🤔`;
  } else {
    response += `Tôi có thể hỗ trợ bạn thêm gì không? 😊`;
  }
  
  return response;
}