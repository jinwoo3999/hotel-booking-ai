import { NextRequest, NextResponse } from "next/server";
import { autoRoomHolder } from "@/lib/ai/room-holder";

// Cron job để cleanup expired holds (chạy mỗi 5 phút)
export async function GET(req: NextRequest) {
  try {
    // Verify cron secret (optional security)
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    console.log('🧹 Running cleanup holds cron job...');
    
    const cleanedCount = await autoRoomHolder.cleanupExpiredHolds();
    
    console.log(`✅ Cleanup completed. Expired holds: ${cleanedCount}`);
    
    return NextResponse.json({ 
      success: true, 
      cleanedCount,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("Cleanup holds cron error:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Internal server error" 
    }, { status: 500 });
  }
}
