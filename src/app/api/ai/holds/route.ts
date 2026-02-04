import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { autoRoomHolder } from "@/lib/ai/room-holder";

// GET - Get active holds
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const holds = await autoRoomHolder.getActiveHolds(session.user.id);
    
    return NextResponse.json({ holds });
    
  } catch (error) {
    console.error("Get holds error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create or release hold
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { action, roomId, holdId, duration } = await req.json();
    
    if (action === 'hold') {
      if (!roomId) {
        return NextResponse.json({ error: "Missing roomId" }, { status: 400 });
      }
      
      const hold = await autoRoomHolder.holdRoom(roomId, session.user.id, duration);
      
      return NextResponse.json({ success: true, hold });
      
    } else if (action === 'release') {
      if (!holdId) {
        return NextResponse.json({ error: "Missing holdId" }, { status: 400 });
      }
      
      await autoRoomHolder.releaseHold(holdId);
      
      return NextResponse.json({ success: true });
      
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
    
  } catch (error) {
    console.error("Hold action error:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Internal server error" 
    }, { status: 500 });
  }
}
