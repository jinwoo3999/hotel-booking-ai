import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const hotelId = searchParams.get('hotelId');

    if (!hotelId) {
      return NextResponse.json({ 
        success: false, 
        message: "Hotel ID is required" 
      }, { status: 400 });
    }

    const rooms = await prisma.room.findMany({
      where: {
        hotelId: hotelId,
        quantity: { gt: 0 } // Only available rooms
      },
      orderBy: {
        price: 'asc'
      }
    });

    return NextResponse.json({ 
      success: true, 
      rooms 
    });

  } catch (error) {
    console.error("Error fetching rooms:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to fetch rooms" 
    }, { status: 500 });
  }
}
