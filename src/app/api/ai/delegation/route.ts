import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const delegation = await prisma.aIDelegation.findUnique({
      where: { userId: session.user.id },
    });

    return NextResponse.json({ delegation });
  } catch (error) {
    console.error("Error fetching delegation:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const delegation = await prisma.aIDelegation.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        ...body,
      },
      update: body,
    });

    return NextResponse.json({ success: true, delegation });
  } catch (error) {
    console.error("Error saving delegation:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
