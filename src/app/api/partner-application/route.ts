import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  console.log("🔄 Partner application API route called...");
  
  try {
    const formData = await request.formData();
    
    // Lấy dữ liệu từ form
    const applicationData = {
      fullName: formData.get("fullName") as string,
      position: formData.get("position") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      hotelName: formData.get("hotelName") as string,
      city: formData.get("city") as string,
      roomCount: parseInt(formData.get("roomCount") as string) || 0,
      address: formData.get("address") as string,
      website: formData.get("website") as string,
      businessLicense: formData.get("businessLicense") as string,
      taxCode: formData.get("taxCode") as string,
      description: formData.get("description") as string,
      experience: formData.get("experience") as string,
      notes: formData.get("notes") as string,
      status: "PENDING" as const,
      submittedAt: new Date(),
    };

    console.log("📋 Application data received:", {
      fullName: applicationData.fullName,
      email: applicationData.email,
      hotelName: applicationData.hotelName,
      city: applicationData.city
    });

    // Kiểm tra email đã tồn tại chưa
    const existingUser = await prisma.user.findUnique({
      where: { email: applicationData.email }
    });

    console.log("👤 Existing user check:", existingUser ? "Found" : "Not found");

    let application;
    if (existingUser) {
      // Nếu user đã tồn tại, tạo partner application
      application = await prisma.partnerApplication.create({
        data: {
          ...applicationData,
          userId: existingUser.id
        }
      });
      console.log("✅ Application created with existing user:", application.id);
    } else {
      // Tạo partner application mà không cần userId
      application = await prisma.partnerApplication.create({
        data: applicationData
      });
      console.log("✅ Application created without user:", application.id);
    }

    console.log("📧 Email notification logged for:", applicationData.email);

    // Redirect to success page
    return NextResponse.redirect(new URL('/become-partner/success', request.url));
    
  } catch (error) {
    console.error("❌ Partner application API error:", error);
    return NextResponse.redirect(new URL('/become-partner?error=true', request.url));
  }
}