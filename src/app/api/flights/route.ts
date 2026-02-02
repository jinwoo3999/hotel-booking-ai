import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Tìm kiếm chuyến bay
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const fromCity = searchParams.get("from") || "";
    const toCity = searchParams.get("to") || "";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const sortBy = searchParams.get("sortBy") || "price";
    const sortOrder = searchParams.get("sortOrder") || "asc";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Build filter conditions
    const where: Record<string, unknown> = {};

    if (query) {
      where.OR = [
        { airline: { contains: query, mode: "insensitive" } },
        { flightNumber: { contains: query, mode: "insensitive" } },
        { fromCity: { contains: query, mode: "insensitive" } },
        { toCity: { contains: query, mode: "insensitive" } },
      ];
    }

    if (fromCity) {
      where.fromCity = { contains: fromCity, mode: "insensitive" };
    }

    if (toCity) {
      where.toCity = { contains: toCity, mode: "insensitive" };
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) (where.price as Record<string, number>).gte = parseFloat(minPrice);
      if (maxPrice) (where.price as Record<string, number>).lte = parseFloat(maxPrice);
    }

    // Build sort options
    const orderBy: Record<string, string> = {};
    orderBy[sortBy] = sortOrder;

    const skip = (page - 1) * limit;

    const [flights, total] = await Promise.all([
      prisma.flight.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.flight.count({ where }),
    ]);

    return NextResponse.json({
      data: flights,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Search flights error:", error);
    return NextResponse.json(
      { error: "Lỗi khi tìm kiếm chuyến bay" },
      { status: 500 }
    );
  }
}

