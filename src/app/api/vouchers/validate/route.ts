import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { code, totalAmount } = await req.json();

    if (!code) {
      return NextResponse.json({ 
        valid: false, 
        message: "Vui lòng nhập mã voucher" 
      });
    }

    // Find voucher by code
    const voucher = await prisma.voucher.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (!voucher) {
      return NextResponse.json({ 
        valid: false, 
        message: "Mã voucher không tồn tại" 
      });
    }

    // Check if voucher is expired
    if (voucher.endDate < new Date()) {
      return NextResponse.json({ 
        valid: false, 
        message: "Mã voucher đã hết hạn" 
      });
    }

    // Check usage limit
    if (voucher.usedCount >= voucher.usageLimit) {
      return NextResponse.json({ 
        valid: false, 
        message: "Mã voucher đã hết lượt sử dụng" 
      });
    }

    // Check minimum spend requirement
    if (voucher.minSpend && totalAmount < voucher.minSpend) {
      return NextResponse.json({ 
        valid: false, 
        message: `Đơn hàng tối thiểu ${voucher.minSpend.toLocaleString()}đ để sử dụng voucher này` 
      });
    }

    return NextResponse.json({ 
      valid: true, 
      voucher: {
        id: voucher.id,
        code: voucher.code,
        discount: voucher.discount,
        type: voucher.type,
        description: voucher.description,
        minSpend: voucher.minSpend
      }
    });

  } catch (error) {
    console.error("Voucher validation error:", error);
    return NextResponse.json({ 
      valid: false, 
      message: "Có lỗi xảy ra khi kiểm tra voucher" 
    }, { status: 500 });
  }
}