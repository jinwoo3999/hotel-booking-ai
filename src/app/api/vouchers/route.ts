import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const vouchers = await prisma.voucher.findMany({
      where: {
        endDate: { gte: new Date() }, // Only active vouchers
        usedCount: { lt: prisma.voucher.fields.usageLimit } // Not fully used
      },
      select: {
        id: true,
        code: true,
        discount: true,
        type: true,
        description: true,
        minSpend: true,
        endDate: true,
        usageLimit: true,
        usedCount: true
      },
      orderBy: { discount: 'desc' }
    });

    return NextResponse.json({ 
      success: true, 
      vouchers 
    });

  } catch (error) {
    console.error("Error fetching vouchers:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Có lỗi xảy ra khi tải vouchers" 
    }, { status: 500 });
  }
}