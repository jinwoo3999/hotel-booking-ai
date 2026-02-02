import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// GET - Lấy danh sách reviews của một hotel
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const hotelId = searchParams.get("hotelId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!hotelId) {
      return NextResponse.json(
        { error: "Thiếu hotelId" },
        { status: 400 }
      );
    }

    const skip = (page - 1) * limit;

    const [reviews, total, stats] = await Promise.all([
      prisma.review.findMany({
        where: { hotelId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.review.count({ where: { hotelId } }),
      prisma.review.aggregate({
        where: { hotelId },
        _avg: { rating: true },
        _count: { rating: true },
      }),
    ]);

    // Calculate rating distribution
    const distribution = await prisma.review.groupBy({
      by: ["rating"],
      where: { hotelId },
      _count: { rating: true },
    });

    const ratingDistribution = [1, 2, 3, 4, 5].map((star) => ({
      star,
      count: distribution.find((d) => d.rating === star)?._count.rating || 0,
    }));

    return NextResponse.json({
      data: reviews,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        averageRating: stats._avg.rating || 0,
        totalReviews: stats._count.rating,
        distribution: ratingDistribution,
      },
    });
  } catch (error) {
    console.error("Get reviews error:", error);
    return NextResponse.json(
      { error: "Lỗi khi lấy danh sách đánh giá" },
      { status: 500 }
    );
  }
}

// POST - Tạo review mới
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập để đánh giá" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { hotelId, rating, comment } = body;

    // Validate input
    if (!hotelId || !rating) {
      return NextResponse.json(
        { error: "Thiếu thông tin bắt buộc" },
        { status: 400 }
      );
    }

    // Validate rating
    const parsedRating = parseInt(rating);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return NextResponse.json(
        { error: "Đánh giá phải từ 1-5 sao" },
        { status: 400 }
      );
    }

    // Check if hotel exists
    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelId },
    });

    if (!hotel) {
      return NextResponse.json(
        { error: "Khách sạn không tồn tại" },
        { status: 404 }
      );
    }

    // Check if user has already reviewed this hotel
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: session.user.id,
        hotelId,
      },
    });

    if (existingReview) {
      // Update existing review
      const updatedReview = await prisma.review.update({
        where: { id: existingReview.id },
        data: {
          rating: parsedRating,
          comment: comment?.trim() || null,
        },
      });

      // Recalculate hotel rating
      await updateHotelRating(hotelId);

      return NextResponse.json({
        message: "Cập nhật đánh giá thành công",
        review: updatedReview,
      });
    }

    // Create new review
    const review = await prisma.review.create({
      data: {
        userId: session.user.id,
        hotelId,
        rating: parsedRating,
        comment: comment?.trim() || null,
      },
    });

    // Recalculate hotel rating
    await updateHotelRating(hotelId);

    return NextResponse.json({
      message: "Đánh giá thành công",
      review,
    }, { status: 201 });
  } catch (error) {
    console.error("Create review error:", error);
    return NextResponse.json(
      { error: "Lỗi khi tạo đánh giá" },
      { status: 500 }
    );
  }
}

// DELETE - Xóa review
export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const reviewId = searchParams.get("id");

    if (!reviewId) {
      return NextResponse.json(
        { error: "Thiếu reviewId" },
        { status: 400 }
      );
    }

    // Find review
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return NextResponse.json(
        { error: "Đánh giá không tồn tại" },
        { status: 404 }
      );
    }

    // Check ownership or admin
    const isAdmin = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN";
    if (review.userId !== session.user.id && !isAdmin) {
      return NextResponse.json(
        { error: "Bạn không có quyền xóa đánh giá này" },
        { status: 403 }
      );
    }

    const hotelId = review.hotelId;

    // Delete review
    await prisma.review.delete({
      where: { id: reviewId },
    });

    // Recalculate hotel rating
    await updateHotelRating(hotelId);

    return NextResponse.json({
      message: "Xóa đánh giá thành công",
    });
  } catch (error) {
    console.error("Delete review error:", error);
    return NextResponse.json(
      { error: "Lỗi khi xóa đánh giá" },
      { status: 500 }
    );
  }
}

// Helper function to update hotel rating
async function updateHotelRating(hotelId: string) {
  const stats = await prisma.review.aggregate({
    where: { hotelId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  await prisma.hotel.update({
    where: { id: hotelId },
    data: {
      rating: stats._avg.rating || 0,
    },
  });
}

