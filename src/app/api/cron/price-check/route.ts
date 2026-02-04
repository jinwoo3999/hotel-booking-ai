import { NextRequest, NextResponse } from "next/server";
import { priceWatchService } from "@/lib/ai/price-watch";

// Cron job để check prices (chạy mỗi giờ)
export async function GET(req: NextRequest) {
  try {
    // Verify cron secret (optional security)
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    console.log('🔍 Running price check cron job...');
    
    const alertsSent = await priceWatchService.checkPrices();
    
    console.log(`✅ Price check completed. Alerts sent: ${alertsSent}`);
    
    return NextResponse.json({ 
      success: true, 
      alertsSent,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("Price check cron error:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Internal server error" 
    }, { status: 500 });
  }
}
