import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const TAGS: Record<string, string[]> = {
  business: ["business_friendly", "near_airport", "fast_checkin"],
  leisure: ["near_beach", "city_center", "tourist_friendly"],
  honeymoon: ["honeymoon_ready", "romantic", "luxury", "quiet_zone"],
  family: ["family_safe", "spacious", "near_beach"],
  emergency: ["fast_checkin", "near_airport", "city_center"],
};

const VOUCHER_INTENT_MAP: Record<string, string[]> = {
  business: ["BUSINESS20", "WELCOME2026"],
  leisure: ["DALAT50", "WELCOME2026"],
  honeymoon: ["LUMINA1M", "DALAT50"],
  family: ["FAMILY800", "LUMINA1M"],
  emergency: ["WELCOME2026", "BUSINESS20"],
};

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    // Allow unauthenticated users to search, but they'll need to login to book
    const userId = session?.user?.id || null;

    const body = await req.json();
    const { intent, city, guests, nights = 1 } = body;
    
    const tags = TAGS[intent] || [];
    
    // Fetch hotels with rooms
    const hotels = await prisma.hotel.findMany({
      where: { 
        status: "ACTIVE", 
        city: city 
      },
      include: { 
        rooms: { 
          where: { quantity: { gt: 0 } }, 
          orderBy: { price: "asc" } 
        } 
      },
    });

    if (hotels.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: `Không tìm thấy khách sạn phù hợp tại ${city}` 
      });
    }

    // Rank hotels by matching tags and rating
    const rankedHotels = hotels
      .map(h => {
        const matchedTags = h.businessTags.filter((t: string) => tags.includes(t));
        const tagScore = (matchedTags.length / Math.max(tags.length, 1)) * 0.5;
        const ratingScore = (h.rating / 5) * 0.3;
        const availabilityScore = h.rooms.length > 0 ? 0.2 : 0;
        const totalScore = tagScore + ratingScore + availabilityScore;
        
        return {
          ...h,
          matchScore: totalScore,
          matchedTags
        };
      })
      .filter(h => h.rooms.length > 0)
      .sort((a, b) => b.matchScore - a.matchScore);

    if (rankedHotels.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: `Không có phòng trống tại ${city}` 
      });
    }

    // Get recommended vouchers based on intent
    const voucherCodes = VOUCHER_INTENT_MAP[intent] || ["WELCOME2026"];
    const vouchers = await prisma.voucher.findMany({
      where: {
        code: { in: voucherCodes },
        endDate: { gte: new Date() }
      }
    });

    // Add AI reasoning for each voucher
    const recommendedVouchers = vouchers.map(v => {
      let aiReason = "";
      
      if (intent === "honeymoon") {
        if (v.code === "LUMINA1M") {
          aiReason = "Voucher đặc biệt cho kỳ nghỉ trăng mật lãng mạn của bạn - tiết kiệm tối đa";
        } else if (v.code === "DALAT50") {
          aiReason = "Ưu đãi cho điểm đến Đà Lạt - thành phố tình yêu";
        }
      } else if (intent === "business") {
        if (v.code === "BUSINESS20") {
          aiReason = "Voucher dành riêng cho khách công tác - giảm 20%";
        } else {
          aiReason = "Phù hợp cho chuyến công tác với giảm giá linh hoạt";
        }
      } else if (intent === "family") {
        if (v.code === "FAMILY800") {
          aiReason = "Voucher gia đình - tiết kiệm lớn cho chuyến đi cùng người thân";
        } else if (v.code === "LUMINA1M") {
          aiReason = "Giảm 1 triệu cho kỳ nghỉ gia đình trọn vẹn";
        }
      } else if (intent === "leisure") {
        if (v.code === "DALAT50") {
          aiReason = "Ưu đãi đặc biệt cho điểm đến du lịch này";
        } else {
          aiReason = "Voucher phổ biến cho chuyến du lịch";
        }
      } else if (intent === "emergency") {
        aiReason = "Voucher áp dụng nhanh - không cần chờ đợi";
      } else {
        aiReason = "Voucher được nhiều khách hàng tin dùng";
      }

      return {
        code: v.code,
        discount: v.discount,
        type: v.type,
        description: v.description,
        minSpend: v.minSpend,
        aiReason
      };
    });

    // Format hotels for response
    const formattedHotels = rankedHotels.slice(0, 3).map(h => ({
      id: h.id,
      name: h.name,
      rating: h.rating,
      address: h.address,
      description: h.description,
      images: h.images,
      businessTags: h.businessTags
    }));

    // Create AI message based on intent
    let aiMessage = "";
    if (intent === "honeymoon") {
      aiMessage = `Tôi đã tìm được ${formattedHotels.length} khách sạn lãng mạn tại ${city} hoàn hảo cho kỳ nghỉ trăng mật`;
    } else if (intent === "business") {
      aiMessage = `Tôi đã chọn ${formattedHotels.length} khách sạn thuận tiện cho chuyến công tác tại ${city}`;
    } else if (intent === "family") {
      aiMessage = `Tôi đã tìm được ${formattedHotels.length} khách sạn an toàn và rộng rãi cho gia đình tại ${city}`;
    } else if (intent === "emergency") {
      aiMessage = `Tôi đã tìm được ${formattedHotels.length} khách sạn có thể check-in nhanh tại ${city}`;
    } else {
      aiMessage = `Tôi đã tìm được ${formattedHotels.length} khách sạn phù hợp tại ${city}`;
    }

    return NextResponse.json({ 
      success: true, 
      message: aiMessage,
      hotels: formattedHotels,
      recommendedVouchers: recommendedVouchers.slice(0, 2), // Top 2 vouchers
      intent,
      guests,
      nights
    });
    
  } catch (error) {
    console.error("Smart search error:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Đã xảy ra lỗi khi tìm kiếm. Vui lòng thử lại." 
    }, { status: 500 });
  }
}
