import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Test endpoint to check if partner application creation works
export async function GET() {
  try {
    // Try to create a test application
    const testApp = await prisma.partnerApplication.create({
      data: {
        fullName: "API Test User",
        email: "apitest@example.com",
        phone: "0999999999",
        hotelName: "API Test Hotel",
        city: "Test City",
        address: "123 Test Street",
      }
    });

    return NextResponse.json({
      success: true,
      message: "Test application created successfully",
      applicationId: testApp.id
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
