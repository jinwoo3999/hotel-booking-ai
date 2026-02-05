import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(request: NextRequest) {
  console.log("🔄 Partner application API route called...");
  
  try {
    const session = await auth();
    const formData = await request.formData();
    
    // Log all form data for debugging
    console.log("📝 Form data received:");
    for (const [key, value] of formData.entries()) {
      console.log(`  ${key}: ${value}`);
    }
    
    // Lấy dữ liệu từ form
    const applicationData = {
      fullName: formData.get("fullName") as string,
      position: (formData.get("position") as string) || null,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      hotelName: formData.get("hotelName") as string,
      city: formData.get("city") as string,
      roomCount: formData.get("roomCount") ? parseInt(formData.get("roomCount") as string) : null,
      address: formData.get("address") as string,
      website: (formData.get("website") as string) || null,
      businessLicense: (formData.get("businessLicense") as string) || null,
      taxCode: (formData.get("taxCode") as string) || null,
      description: (formData.get("description") as string) || null,
      experience: (formData.get("experience") as string) || null,
      notes: (formData.get("notes") as string) || null,
      userId: session?.user?.id || null,
    };

    // Validate required fields
    if (!applicationData.fullName || !applicationData.email || !applicationData.phone || 
        !applicationData.hotelName || !applicationData.city || !applicationData.address) {
      console.error("❌ Missing required fields");
      return NextResponse.redirect(new URL('/become-partner?error=missing_fields', request.url));
    }

    console.log("📋 Application data to save:", applicationData);

    // Tạo partner application
    const application = await prisma.partnerApplication.create({
      data: applicationData
    });
    
    console.log("✅ Application created successfully:", application.id);

    // Redirect to success page
    return NextResponse.redirect(new URL('/become-partner/success', request.url));
    
  } catch (error) {
    console.error("❌ Partner application API error:", error);
    console.error("Error details:", error instanceof Error ? error.message : String(error));
    if (error instanceof Error && 'code' in error) {
      console.error("Error code:", (error as any).code);
    }
    return NextResponse.redirect(new URL('/become-partner?error=server_error', request.url));
  }
}