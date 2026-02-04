import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { proactiveSuggestionEngine } from "@/lib/ai/proactive-suggestion";

// GET - Lấy pending suggestions
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const suggestions = await proactiveSuggestionEngine.getPendingSuggestions(session.user.id);
    
    return NextResponse.json({ suggestions });
    
  } catch (error) {
    console.error("Get suggestions error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Mark suggestion as acted/dismissed
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { suggestionId, action } = await req.json();
    
    if (!suggestionId || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    
    if (action === 'acted') {
      await proactiveSuggestionEngine.markAsActed(suggestionId);
    } else if (action === 'dismissed') {
      await proactiveSuggestionEngine.dismissSuggestion(suggestionId);
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error("Update suggestion error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
