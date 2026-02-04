import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { consentManager } from "@/lib/ai/consent-manager";

// GET - Lấy consent settings
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    let consent = await consentManager.getConsent(session.user.id);
    
    // Tạo consent mặc định nếu chưa có
    if (!consent) {
      consent = await consentManager.createDefaultConsent(session.user.id);
    }
    
    return NextResponse.json({ consent });
    
  } catch (error) {
    console.error("Get consent error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Cập nhật consent settings
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const updates = await req.json();
    
    // Validate updates
    const allowedFields = [
      'autoBookingEnabled',
      'autoRoomHoldEnabled',
      'autoVoucherEnabled',
      'priceAlertsEnabled',
      'proactiveSuggestionsEnabled',
      'maxAutoBookingAmount'
    ];
    
    const validUpdates: any = {};
    for (const field of allowedFields) {
      if (field in updates) {
        validUpdates[field] = updates[field];
      }
    }
    
    await consentManager.updateConsent(session.user.id, validUpdates);
    
    const updatedConsent = await consentManager.getConsent(session.user.id);
    
    return NextResponse.json({ 
      success: true,
      consent: updatedConsent 
    });
    
  } catch (error) {
    console.error("Update consent error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
