import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const INTENT_TO_TAGS: Record<string, string[]> = {
  business: ["business_friendly", "near_airport"],
  leisure: ["near_beach", "city_center"],
  honeymoon: ["honeymoon_ready", "romantic", "luxury"],
  family: ["family_safe", "spacious"],
  emergency: ["fast_checkin"],
};

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const body = await req.json();

    if (!body.taskMode) {
      return NextResponse.json({ success: false, message: "Use task mode" });
    }

    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ success: false, message: "Login required" }, { status: 401 });
    }

    const requiredTags = INTENT_TO_TAGS[body.intent] || [];
    
    const hotels = await prisma.hotel.findMany({
      where: { status: "ACTIVE", city: body.city },
      include: { rooms: { where: { quantity: { gt: 0 } }, orderBy: { price: "asc" } } },
    });

    if (hotels.length === 0) {
      return NextResponse.json({ success: false, message: `Không tìm thấy khách sạn tại ${body.city}` });
    }

    const ranked = hotels
      .map(h => {
        const r = h.rooms[0];
        if (!r) return null;
        const matched = h.businessTags.filter((t: string) => requiredTags.includes(t));
        const score = (matched.length / Math.max(requiredTags.length, 1)) * 0.4 + (h.rating / 5) * 0.3 + (1 - Math.min(r.price / 2000000, 1)) * 0.3;
        return { hotel: h, room: r, score, matchedTags: matched };
      })
      .filter(Boolean)
      .sort((a, b) => b!.score - a!.score);

    const drafts = ranked.slice(0, 2).map((o: any, i: number) => ({
      id: `draft_${Date.now()}_${i}`,
      type: i === 0 ? "RECOMMENDED" : "ALTERNATIVE",
      hotel: { id: o.hotel.id, name: o.hotel.name, rating: o.hotel.rating, address: o.hotel.address, images: o.hotel.images },
      room: { id: o.room.id, name: o.room.name, price: o.room.price, amenities: o.room.amenities },
      booking: { checkIn: new Date(), checkOut: new Date(), nights: 1, guests: body.guests, totalPrice: o.room.price },
      reasoning: `Phù hợp ${body.intent}, Rating ${o.hotel.rating}/5`,
      optimizationScore: o.score,
    }));

    return NextResponse.json({ success: true, message: "Đã tìm được phòng phù hợp", drafts });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}
