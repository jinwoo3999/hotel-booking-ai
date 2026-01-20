import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    console.log("Đang tìm phòng với ID:", id);

    const room = await prisma.room.findUnique({
      where: { id: id }, 
    });

    if (!room) {
      console.log("❌ Không tìm thấy phòng");
      return NextResponse.json({ message: "Phòng không tồn tại" }, { status: 404 });
    }

    return NextResponse.json(room);
  } catch (error) {
    console.error("❌ Lỗi API:", error);
    return NextResponse.json({ message: "Lỗi Server" }, { status: 500 });
  }
}