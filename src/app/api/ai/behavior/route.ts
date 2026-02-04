import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { behaviorAnalysisEngine } from "@/lib/ai/behavior-analysis";

// GET - Get user behavior pattern
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const pattern = await behaviorAnalysisEngine.analyzePattern(session.user.id);
    
    return NextResponse.json({ pattern });
    
  } catch (error) {
    console.error("Get behavior pattern error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Track interaction
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const interaction = await req.json();
    
    if (!interaction.type) {
      return NextResponse.json({ error: "Missing interaction type" }, { status: 400 });
    }
    
    await behaviorAnalysisEngine.trackInteraction(session.user.id, interaction);
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error("Track interaction error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
