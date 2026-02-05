"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function submitPartnerApplication(formData: FormData) {
  try {
    // Validate required fields
    const fullName = formData.get("fullName") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const hotelName = formData.get("hotelName") as string;
    const city = formData.get("city") as string;
    const address = formData.get("address") as string;

    if (!fullName || !email || !phone || !hotelName || !city || !address) {
      console.error("❌ Missing required fields");
      redirect("/become-partner?error=missing_fields");
    }

    // Get form data
    const data = {
      fullName,
      email,
      phone,
      hotelName,
      city,
      address,
      roomCount: formData.get("roomCount") ? parseInt(formData.get("roomCount") as string) : null,
      description: (formData.get("description") as string) || null,
    };

    console.log("📋 Creating partner application:", data);

    // Create application
    const application = await prisma.partnerApplication.create({
      data
    });

    console.log("✅ Application created successfully!");
    console.log("   ID:", application.id);
    console.log("   Hotel:", application.hotelName);
    console.log("   Status:", application.status);

  } catch (error: any) {
    console.error("❌ Error creating application:");
    console.error("   Message:", error.message);
    console.error("   Code:", error.code);
    redirect("/become-partner?error=server_error");
  }
  
  // Redirect outside try-catch to avoid catching redirect error
  redirect("/become-partner/success");
}
