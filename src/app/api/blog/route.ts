import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Lấy danh sách bài viết blog
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const status = searchParams.get("status") || "PUBLISHED";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Build filter conditions
    const where: Record<string, unknown> = {};

    if (status !== "all") {
      where.status = status;
    }

    if (query) {
      where.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { excerpt: { contains: query, mode: "insensitive" } },
        { content: { contains: query, mode: "insensitive" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.blogPost.count({ where }),
    ]);

    // Get status counts
    const statusCounts = await prisma.blogPost.groupBy({
      by: ["status"],
      _count: { status: true },
    });

    const stats = statusCounts.reduce((acc, item) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      data: posts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      stats,
    });
  } catch (error) {
    console.error("Get blog posts error:", error);
    return NextResponse.json(
      { error: "Lỗi khi lấy danh sách bài viết" },
      { status: 500 }
    );
  }
}

