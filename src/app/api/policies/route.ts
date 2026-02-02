import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// GET - Lấy thông tin chính sách
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const policyId = searchParams.get("id") || "default";

    const policy = await prisma.policy.findUnique({
      where: { id: policyId },
    });

    if (!policy) {
      // Return default policy if none exists
      return NextResponse.json({
        id: "default",
        checkInTime: "14:00",
        checkOutTime: "12:00",
        cancellationDeadlineHours: 24,
        refundPercent: 100,
        refundPolicyText: "Hoàn 100% nếu hủy trước 24 giờ so với thời gian nhận phòng.",
        serviceFeePercent: 0,
        taxPercent: 0,
        isDefault: true,
      });
    }

    return NextResponse.json(policy);
  } catch (error) {
    console.error("Get policy error:", error);
    return NextResponse.json(
      { error: "Lỗi khi lấy thông tin chính sách" },
      { status: 500 }
    );
  }
}

// PUT - Cập nhật chính sách (Admin only)
export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập" },
        { status: 401 }
      );
    }

    // Check admin role
    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Chỉ Admin mới có quyền cập nhật chính sách" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      id = "default",
      checkInTime,
      checkOutTime,
      cancellationDeadlineHours,
      refundPercent,
      refundPolicyText,
      serviceFeePercent,
      taxPercent,
    } = body;

    // Validate input
    if (checkInTime && !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(checkInTime)) {
      return NextResponse.json(
        { error: "Thời gian check-in không hợp lệ (định dạng HH:mm)" },
        { status: 400 }
      );
    }

    if (checkOutTime && !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(checkOutTime)) {
      return NextResponse.json(
        { error: "Thời gian check-out không hợp lệ (định dạng HH:mm)" },
        { status: 400 }
      );
    }

    if (cancellationDeadlineHours !== undefined) {
      if (isNaN(cancellationDeadlineHours) || cancellationDeadlineHours < 0) {
        return NextResponse.json(
          { error: "Thời hạn hủy phải là số dương" },
          { status: 400 }
        );
      }
    }

    if (refundPercent !== undefined) {
      if (isNaN(refundPercent) || refundPercent < 0 || refundPercent > 100) {
        return NextResponse.json(
          { error: "Phần trăm hoàn tiền phải từ 0-100" },
          { status: 400 }
        );
      }
    }

    // Upsert policy
    const policy = await prisma.policy.upsert({
      where: { id },
      update: {
        ...(checkInTime && { checkInTime }),
        ...(checkOutTime && { checkOutTime }),
        ...(cancellationDeadlineHours !== undefined && { cancellationDeadlineHours }),
        ...(refundPercent !== undefined && { refundPercent }),
        ...(refundPolicyText !== undefined && { refundPolicyText }),
        ...(serviceFeePercent !== undefined && { serviceFeePercent }),
        ...(taxPercent !== undefined && { taxPercent }),
      },
      create: {
        id,
        checkInTime: checkInTime || "14:00",
        checkOutTime: checkOutTime || "12:00",
        cancellationDeadlineHours: cancellationDeadlineHours || 24,
        refundPercent: refundPercent ?? 100,
        refundPolicyText: refundPolicyText || "Hoàn 100% nếu hủy trước 24 giờ.",
        serviceFeePercent: serviceFeePercent || 0,
        taxPercent: taxPercent || 0,
      },
    });

    return NextResponse.json({
      message: "Cập nhật chính sách thành công",
      policy,
    });
  } catch (error) {
    console.error("Update policy error:", error);
    return NextResponse.json(
      { error: "Lỗi khi cập nhật chính sách" },
      { status: 500 }
    );
  }
}

// POST - Tạo mới policy (Admin only)
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập" },
        { status: 401 }
      );
    }

    // Check admin role
    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Chỉ Admin mới có quyền tạo chính sách" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      id,
      checkInTime,
      checkOutTime,
      cancellationDeadlineHours,
      refundPercent,
      refundPolicyText,
      serviceFeePercent,
      taxPercent,
    } = body;

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: "ID chính sách là bắt buộc" },
        { status: 400 }
      );
    }

    // Check if policy already exists
    const existing = await prisma.policy.findUnique({
      where: { id },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Chính sách đã tồn tại, vui lòng sử dụng PUT để cập nhật" },
        { status: 409 }
      );
    }

    const policy = await prisma.policy.create({
      data: {
        id,
        checkInTime: checkInTime || "14:00",
        checkOutTime: checkOutTime || "12:00",
        cancellationDeadlineHours: cancellationDeadlineHours || 24,
        refundPercent: refundPercent ?? 100,
        refundPolicyText: refundPolicyText || "Hoàn 100% nếu hủy trước 24 giờ.",
        serviceFeePercent: serviceFeePercent || 0,
        taxPercent: taxPercent || 0,
      },
    });

    return NextResponse.json({
      message: "Tạo chính sách thành công",
      policy,
    }, { status: 201 });
  } catch (error) {
    console.error("Create policy error:", error);
    return NextResponse.json(
      { error: "Lỗi khi tạo chính sách" },
      { status: 500 }
    );
  }
}

// DELETE - Xóa policy (Admin only)
export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập" },
        { status: 401 }
      );
    }

    // Check admin role
    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Chỉ Admin mới có quyền xóa chính sách" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const policyId = searchParams.get("id");

    if (!policyId) {
      return NextResponse.json(
        { error: "Thiếu policyId" },
        { status: 400 }
      );
    }

    // Prevent deleting default policy
    if (policyId === "default") {
      return NextResponse.json(
        { error: "Không thể xóa chính sách mặc định" },
        { status: 400 }
      );
    }

    await prisma.policy.delete({
      where: { id: policyId },
    });

    return NextResponse.json({
      message: "Xóa chính sách thành công",
    });
  } catch (error) {
    console.error("Delete policy error:", error);
    return NextResponse.json(
      { error: "Lỗi khi xóa chính sách" },
      { status: 500 }
    );
  }
}

