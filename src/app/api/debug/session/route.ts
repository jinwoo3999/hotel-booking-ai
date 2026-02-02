import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    
    // Get all users from database
    const allUsers = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true }
    });
    
    // Check if session user exists in database
    let userExists = null;
    if (session?.user?.id) {
      userExists = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, email: true, name: true, role: true }
      });
    }
    
    return NextResponse.json({
      session: session ? {
        user: session.user,
        expires: session.expires
      } : null,
      userExistsInDB: userExists,
      allUsersInDB: allUsers,
      sessionUserId: session?.user?.id || null
    });
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : null
    }, { status: 500 });
  }
}