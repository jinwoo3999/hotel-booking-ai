import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { evaluateVoucher, calculateBaseAmount } from "@/lib/pricing";

// GET - Validate voucher code
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const amount = searchParams.get("amount");

    if (!code) {
      return NextResponse.json(
        { error: "Thiếu mã voucher" },
        { status: 400 }
      );
    }

    const voucher = await prisma.voucher.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!voucher) {
      return NextResponse.json(
        { valid: false, error: "Mã voucher không tồn tại" },
        { status: 404 }
      );
    }

    const now = new Date();

    // Check if expired
    if (voucher.endDate < now) {
      return NextResponse.json({
        valid: false,
        error: "Voucher đã hết hạn",
        expiredDate: voucher.endDate,
      });
    }

    // Check usage limit
    if (voucher.usedCount >= voucher.usageLimit) {
      return NextResponse.json({
        valid: false,
        error: "Voucher đã hết lượt sử dụng",
      });
    }

    // Check minimum spend if amount provided
    const parsedAmount = amount ? parseFloat(amount) : 0;
    if (voucher.minSpend && parsedAmount > 0 && parsedAmount < voucher.minSpend) {
      return NextResponse.json({
        valid: false,
        error: `Đơn hàng tối thiểu ${voucher.minSpend.toLocaleString("vi-VN")} VNĐ`,
        minSpend: voucher.minSpend,
      });
    }

    // Calculate discount
    let discount = 0;
    if (parsedAmount > 0) {
      const evaluation = evaluateVoucher(voucher, parsedAmount);
      if (evaluation.ok) {
        discount = evaluation.discount;
      }
    }

    return NextResponse.json({
      valid: true,
      voucher: {
        code: voucher.code,
        discount: voucher.discount,
        type: voucher.type,
        minSpend: voucher.minSpend,
        endDate: voucher.endDate,
        remainingUses: voucher.usageLimit - voucher.usedCount,
      },
      discount,
      finalAmount: parsedAmount > 0 ? Math.max(0, parsedAmount - discount) : null,
    });
  } catch (error) {
    console.error("Voucher validation error:", error);
    return NextResponse.json(
      { error: "Lỗi khi kiểm tra voucher" },
      { status: 500 }
    );
  }
}

// POST - Apply voucher to calculate discount
export async function POST(req: Request) {
  try {
    const session = await auth();
    // Voucher validation doesn't require auth for browsing
    const body = await req.json();
    const { code, subtotal } = body;

    if (!code) {
      return NextResponse.json(
        { error: "Thiếu mã voucher" },
        { status: 400 }
      );
    }

    if (!subtotal || subtotal <= 0) {
      return NextResponse.json(
        { error: "Tổng tiền không hợp lệ" },
        { status: 400 }
      );
    }

    const voucher = await prisma.voucher.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!voucher) {
      return NextResponse.json(
        { valid: false, error: "Mã voucher không tồn tại" },
        { status: 404 }
      );
    }

    const now = new Date();

    // Check if expired
    if (voucher.endDate < now) {
      return NextResponse.json({
        valid: false,
        error: "Voucher đã hết hạn",
        expiredDate: voucher.endDate,
      });
    }

    // Check usage limit
    if (voucher.usedCount >= voucher.usageLimit) {
      return NextResponse.json({
        valid: false,
        error: "Voucher đã hết lượt sử dụng",
      });
    }

    // Check minimum spend
    if (voucher.minSpend && subtotal < voucher.minSpend) {
      return NextResponse.json({
        valid: false,
        error: `Đơn hàng tối thiểu ${voucher.minSpend.toLocaleString("vi-VN")} VNĐ`,
        minSpend: voucher.minSpend,
        currentAmount: subtotal,
      });
    }

    // Calculate discount
    const evaluation = evaluateVoucher(voucher, subtotal);
    
    if (!evaluation.ok) {
      return NextResponse.json({
        valid: false,
        error: evaluation.reason,
      });
    }

    const discount = evaluation.discount;
    const finalAmount = Math.max(0, subtotal - discount);

    return NextResponse.json({
      valid: true,
      voucher: {
        code: voucher.code,
        description: voucher.description,
        discount: voucher.discount,
        type: voucher.type,
      },
      breakdown: {
        subtotal,
        discount,
        finalAmount,
      },
    });
  } catch (error) {
    console.error("Apply voucher error:", error);
    return NextResponse.json(
      { error: "Lỗi khi áp dụng voucher" },
      { status: 500 }
    );
  }
}

