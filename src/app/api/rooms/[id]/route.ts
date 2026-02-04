import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const room = await prisma.room.findUnique({
      where: { id: id },
      include: {
        hotel: true
      }
    });

    if (!room) {
      return NextResponse.json({ 
        success: false,
        message: "Phòng không tồn tại" 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      room
    });
  } catch (error) {
    console.error("Error fetching room:", error);
    return NextResponse.json({ 
      success: false,
      message: "Lỗi Server" 
    }, { status: 500 });
  }
}
