import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Lấy danh sách các thành phố có khách sạn
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const limit = parseInt(searchParams.get("limit") || "10");

    // Get distinct cities with active hotels
    const cities = await prisma.hotel.groupBy({
      by: ["city"],
      where: {
        status: "ACTIVE",
        ...(query
          ? {
              city: {
                contains: query,
                mode: "insensitive" as const,
              },
            }
          : {}),
      },
      _count: {
        city: true,
      },
      orderBy: {
        _count: {
          city: "desc",
        },
      },
      take: limit,
    });

    // Get hotel count and min price for each city
    const citiesWithStats = await Promise.all(
      cities.map(async (city) => {
        const [hotelCount, minPrice] = await Promise.all([
          prisma.hotel.count({
            where: { city: city.city, status: "ACTIVE" },
          }),
          prisma.room.findFirst({
            where: { hotel: { city: city.city, status: "ACTIVE" } },
            select: { price: true },
            orderBy: { price: "asc" },
          }),
        ]);

        return {
          city: city.city,
          hotelCount,
          minPrice: minPrice?.price || null,
        };
      })
    );

    return NextResponse.json({
      data: citiesWithStats,
    });
  } catch (error) {
    console.error("Get cities error:", error);
    return NextResponse.json(
      { error: "Lỗi khi lấy danh sách thành phố" },
      { status: 500 }
    );
  }
}

