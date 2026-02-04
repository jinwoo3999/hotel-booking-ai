import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { priceWatchService } from "@/lib/ai/price-watch";

// GET - Get user's price watches
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const watches = await priceWatchService.getUserWatches(session.user.id);
    
    return NextResponse.json({ watches });
    
  } catch (error) {
    console.error("Get price watches error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create or deactivate watch
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { action, hotelId, watchId, options } = await req.json();
    
    if (action === 'create') {
      if (!hotelId) {
        return NextResponse.json({ error: "Missing hotelId" }, { status: 400 });
      }
      
      const watch = await priceWatchService.createWatch(session.user.id, hotelId, options);
      
      return NextResponse.json({ success: true, watch });
      
    } else if (action === 'deactivate') {
      if (!watchId) {
        return NextResponse.json({ error: "Missing watchId" }, { status: 400 });
      }
      
      await priceWatchService.deactivateWatch(watchId);
      
      return NextResponse.json({ success: true });
      
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
    
  } catch (error) {
    console.error("Price watch action error:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Internal server error" 
    }, { status: 500 });
  }
}
