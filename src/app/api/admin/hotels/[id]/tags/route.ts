import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only ADMIN and SUPER_ADMIN can manage tags
    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const { tags } = await req.json();

    // Update hotel businessTags
    const hotel = await prisma.hotel.update({
      where: { id },
      data: {
        businessTags: tags,
      },
    });

    return NextResponse.json({ success: true, hotel });
  } catch (error) {
    console.error("Error updating hotel tags:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
