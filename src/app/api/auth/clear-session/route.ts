import { signOut } from "@/auth";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    await signOut({ redirect: false });
    
    const response = NextResponse.json({ success: true, message: "Session cleared" });
    
    // Clear all auth-related cookies
    response.cookies.delete("authjs.session-token");
    response.cookies.delete("__Secure-authjs.session-token");
    response.cookies.delete("authjs.csrf-token");
    response.cookies.delete("__Host-authjs.csrf-token");
    
    return response;
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Failed to clear session" 
    }, { status: 500 });
  }
}