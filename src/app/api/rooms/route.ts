import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { enumerateNights, getRoomAvailabilitySummary } from "@/lib/inventory";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Search parameters
    const hotelId = searchParams.get("hotelId") || "";
    const query = searchParams.get("q") || "";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const minGuests = searchParams.get("minGuests");
    const amenities = searchParams.get("amenities");
    const checkIn = searchParams.get("checkIn");
    const checkOut = searchParams.get("checkOut");
    const sortBy = searchParams.get("sortBy") || "price";
    const sortOrder = searchParams.get("sortOrder") || "asc";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Build filter conditions
    const where: Record<string, unknown> = {};

    if (hotelId) {
      where.hotelId = hotelId;
    }

    // Text search
    if (query) {
      where.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ];
    }

    // Price filter
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) (where.price as Record<string, number>).gte = parseFloat(minPrice);
      if (maxPrice) (where.price as Record<string, number>).lte = parseFloat(maxPrice);
    }

    // Guest capacity filter
    if (minGuests) {
      where.maxGuests = { gte: parseInt(minGuests) };
    }

    // Amenities filter
    if (amenities) {
      const amenitiesList = amenities.split(",").map((a) => a.trim());
      where.amenities = { hasEvery: amenitiesList };
    }

    // Build sort options
    const orderBy: Record<string, string> = {};
    orderBy[sortBy] = sortOrder;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [rooms, total] = await Promise.all([
      prisma.room.findMany({
        where,
        include: {
          hotel: {
            select: {
              id: true,
              name: true,
              city: true,
              address: true,
              rating: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.room.count({ where }),
    ]);

    // Check availability if dates provided
    let roomsWithAvailability: typeof rooms & { availability?: { available: boolean; remaining: number; error?: string } }[] = rooms;
    if (checkIn && checkOut) {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      
      roomsWithAvailability = await Promise.all(
        rooms.map(async (room) => {
          try {
            const availability = await getRoomAvailabilitySummary(room.id, checkInDate, checkOutDate);
            return {
              ...room,
              availability: {
                available: availability.available,
                remaining: availability.remainingMin,
              },
            };
          } catch {
            return {
              ...room,
              availability: {
                available: false,
                remaining: 0,
                error: "Không thể kiểm tra tồn kho",
              },
            };
          }
        })
      );

      // Filter to only available rooms if requested
      const onlyAvailable = searchParams.get("onlyAvailable") === "true";
      if (onlyAvailable) {
        roomsWithAvailability = (roomsWithAvailability as Array<typeof rooms[0] & { availability?: { available: boolean; remaining: number; error?: string } }>).filter(
          (room) => room.availability?.available
        );
      }
    }

    return NextResponse.json({
      data: roomsWithAvailability,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Search rooms error:", error);
    return NextResponse.json(
      { error: "Lỗi khi tìm kiếm phòng" },
      { status: 500 }
    );
  }
}

