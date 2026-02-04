import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Check if requesting single hotel by ID
    const id = searchParams.get("id");
    if (id) {
      const hotel = await prisma.hotel.findUnique({
        where: { id },
        include: {
          rooms: {
            where: { quantity: { gt: 0 } },
            orderBy: { price: 'asc' }
          }
        }
      });
      
      if (!hotel) {
        return NextResponse.json({ 
          success: false,
          message: "Khách sạn không tồn tại" 
        }, { status: 404 });
      }
      
      return NextResponse.json({
        success: true,
        hotels: [hotel]
      });
    }
    
    // Search parameters
    const query = searchParams.get("q") || "";
    const city = searchParams.get("city") || "";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const minRating = searchParams.get("minRating");
    const sortBy = searchParams.get("sortBy") || "rating";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const status = searchParams.get("status") || "ACTIVE";

    // Build filter conditions
    const where: Record<string, unknown> = {
      status: status === "all" ? undefined : status,
    };

    // Text search
    if (query) {
      where.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { city: { contains: query, mode: "insensitive" } },
        { address: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ];
    }

    // City filter
    if (city) {
      where.city = { contains: city, mode: "insensitive" };
    }

    // Rating filter
    if (minRating) {
      where.rating = { gte: parseFloat(minRating) };
    }

    // Build sort options
    const orderBy: Record<string, string> = {};
    orderBy[sortBy] = sortOrder;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [hotels, total] = await Promise.all([
      prisma.hotel.findMany({
        where,
        include: {
          rooms: {
            select: {
              price: true,
              maxGuests: true,
              amenities: true,
            },
          },
          _count: {
            select: { bookings: true, rooms: true },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.hotel.count({ where }),
    ]);

    // Process results to get min price
    const processedHotels = hotels.map((hotel) => {
      const prices = hotel.rooms.map((r) => r.price).filter((p) => p > 0);
      const minRoomPrice = prices.length > 0 ? Math.min(...prices) : null;
      return {
        ...hotel,
        minPrice: minRoomPrice,
        roomCount: hotel.rooms.length,
      };
    });

    // Price filter (post-query for complex filtering)
    let filteredHotels = processedHotels;
    if (minPrice || maxPrice) {
      filteredHotels = processedHotels.filter((hotel) => {
        if (hotel.minPrice === null) return false;
        if (minPrice && hotel.minPrice < parseFloat(minPrice)) return false;
        if (maxPrice && hotel.minPrice > parseFloat(maxPrice)) return false;
        return true;
      });
    }

    return NextResponse.json({
      data: filteredHotels,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Search hotels error:", error);
    return NextResponse.json(
      { error: "Lỗi khi tìm kiếm khách sạn" },
      { status: 500 }
    );
  }
}

