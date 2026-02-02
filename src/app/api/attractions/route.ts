import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Lấy danh sách điểm vui chơi
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const city = searchParams.get("city") || "";
    const category = searchParams.get("category") || "";
    const status = searchParams.get("status") || "PUBLISHED";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    // Build filter conditions
    const where: Record<string, unknown> = {};

    if (status !== "all") {
      where.status = status;
    }

    if (query) {
      where.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { address: { contains: query, mode: "insensitive" } },
      ];
    }

    if (city) {
      where.city = { contains: city, mode: "insensitive" };
    }

    if (category) {
      where.category = { contains: category, mode: "insensitive" };
    }

    const skip = (page - 1) * limit;

    const [attractions, total] = await Promise.all([
      prisma.attraction.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.attraction.count({ where }),
    ]);

    // Get unique categories
    const categories = await prisma.attraction.groupBy({
      by: ["category"],
      where: { category: { not: null } },
      _count: { category: true },
    });

    return NextResponse.json({
      data: attractions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      categories: categories
        .filter((c) => c.category)
        .map((c) => ({
          name: c.category,
          count: c._count.category,
        })),
    });
  } catch (error) {
    console.error("Get attractions error:", error);
    return NextResponse.json(
      { error: "Lỗi khi lấy danh sách điểm vui chơi" },
      { status: 500 }
    );
  }
}

