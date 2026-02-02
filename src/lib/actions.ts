"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hash } from "bcryptjs";

// Tạo khách sạn mới
export async function createHotel(formData: FormData) {
  const session = await auth();
  if (!session || !session.user?.id) redirect("/login");
  
  // Chỉ partner/admin mới được tạo khách sạn
  if (session.user.role !== "PARTNER" && session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
    redirect("/");
  }

  const hotel = await prisma.hotel.create({
    data: {
      name: formData.get("name") as string,
      city: formData.get("city") as string,
      address: formData.get("address") as string,
      description: formData.get("description") as string,
      status: "ACTIVE", 
      rating: 5.0,
      ownerId: session.user.id,
      latitude: parseFloat(formData.get("latitude") as string) || 11.94,
      longitude: parseFloat(formData.get("longitude") as string) || 108.45,
      images: [(formData.get("imageUrl") as string) || "https://images.unsplash.com/photo-1566073771259-6a8506099945"],
      rooms: {
        create: [{
            name: (formData.get("roomName") as string) || "Standard Room",
            description: "Phòng tiêu chuẩn",
            price: parseFloat(formData.get("roomPrice") as string) || 0,
            quantity: parseInt(formData.get("roomQuantity") as string) || 5,
            capacity: parseInt(formData.get("maxGuests") as string) || 2,
            maxGuests: parseInt(formData.get("maxGuests") as string) || 2,
            amenities: ["Wifi", "AC", "TV"],
            images: [(formData.get("imageUrl") as string) || "https://images.unsplash.com/photo-1566073771259-6a8506099945"]
        }]
      }
    },
  });
  revalidatePath("/admin/hotels");
  redirect(`/admin/hotels/${hotel.id}`);
}

// Xóa khách sạn
export async function deleteHotel(hotelId: string) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "PARTNER" && session?.user?.role !== "SUPER_ADMIN") {
      return { error: "Không có quyền thực hiện." };
  }

  try {
    await prisma.hotel.delete({ where: { id: hotelId } });
    revalidatePath("/admin/hotels");
    return { success: true };
  } catch (error) {
    return { error: "Không thể xóa (Có thể do còn booking liên quan)." };
  }
}

// Tạo phòng mới
export async function createRoom(formData: FormData) {
  const hotelId = formData.get("hotelId") as string;
  await prisma.room.create({
    data: {
      hotelId,
      name: formData.get("name") as string,
      price: parseFloat(formData.get("price") as string) || 0,
      quantity: parseInt(formData.get("quantity") as string) || 1,
      maxGuests: parseInt(formData.get("maxGuests") as string) || 2,
      capacity: parseInt(formData.get("maxGuests") as string) || 2,
      description: formData.get("description") as string,
      images: [(formData.get("imageUrl") as string) || "https://images.unsplash.com/photo-1566073771259-6a8506099945"],
      amenities: ["Wifi", "TV", "AC"],
    },
  });
  revalidatePath(`/admin/hotels/${hotelId}`); 
}

// Cập nhật phòng
export async function updateRoom(formData: FormData) {
  const roomId = formData.get("roomId") as string;
  const hotelId = formData.get("hotelId") as string;
  await prisma.room.update({
    where: { id: roomId },
    data: {
      name: formData.get("name") as string,
      price: parseFloat(formData.get("price") as string) || 0,
      quantity: parseInt(formData.get("quantity") as string) || 1,
      maxGuests: parseInt(formData.get("maxGuests") as string) || 2,
      description: formData.get("description") as string,
      ...(formData.get("imageUrl") ? { images: [formData.get("imageUrl") as string] } : {}),
    },
  });
  revalidatePath(`/admin/hotels/${hotelId}`);
}

// Xóa phòng
export async function deleteRoom(roomId: string, hotelId: string) {
  if(!roomId) return;
  await prisma.room.delete({ where: { id: roomId } });
  revalidatePath(`/admin/hotels/${hotelId}`);
}

// Tạo booking mới
export async function createBooking(formData: FormData) {
  const session = await auth();
  if (!session || !session.user?.id) {
    return { error: "Vui lòng đăng nhập để đặt phòng", redirectTo: "/login" };
  }

  const hotelId = formData.get("hotelId") as string;
  const roomId = formData.get("roomId") as string;
  const checkIn = new Date(formData.get("checkIn") as string);
  const checkOut = new Date(formData.get("checkOut") as string);
  const totalPrice = parseFloat(formData.get("totalPrice") as string) || 0;

  console.log("🔄 Creating booking for user:", session.user.id);
  console.log("📋 Booking data:", { hotelId, roomId, checkIn, checkOut, totalPrice });

  try {
    // Kiểm tra user có tồn tại không
    let user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    // Nếu user không tồn tại, tìm theo email hoặc tạo mới
    if (!user && session.user.email) {
      user = await prisma.user.findUnique({
        where: { email: session.user.email }
      });
      
      if (!user) {
        // Tạo user mới từ session
        user = await prisma.user.create({
          data: {
            email: session.user.email,
            name: session.user.name || "Người dùng",
            role: "USER",
            emailVerified: new Date(),
          }
        });
        console.log("✅ Created new user from session:", user.id);
      }
    }

    if (!user) {
      console.error("❌ Cannot determine user information");
      return { error: "Không thể xác định thông tin người dùng" };
    }

    // Kiểm tra hotel và room có tồn tại không
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { hotel: true }
    });

    if (!room || room.hotelId !== hotelId) {
      console.error("❌ Room or hotel not found");
      return { error: "Phòng hoặc khách sạn không tồn tại" };
    }

    console.log("✅ Room found:", room.name, "at hotel:", room.hotel.name);

    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        hotelId,
        roomId,
        checkIn,
        checkOut,
        originalPrice: totalPrice,
        totalPrice,
        status: "PENDING",
        guestName: formData.get("guestName") as string || user.name || "Khách",
        guestPhone: formData.get("guestPhone") as string || "",
      },
    });

    console.log("✅ Booking created successfully:", booking.id);
    console.log("🔗 Should redirect to payment page:", `/payment/${booking.id}`);

    revalidatePath("/dashboard/history");
    
    // Trả về success với URL để redirect
    return { 
      success: true, 
      bookingId: booking.id,
      redirectTo: `/payment/${booking.id}`,
      message: "Đặt phòng thành công! Đang chuyển đến trang thanh toán..."
    };
    
  } catch (error) {
    console.error("❌ Booking creation error:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi đặt phòng";
    return { error: errorMessage };
  }
}

// Cập nhật trạng thái booking
export async function updateBookingStatus(bookingId: string, newStatus: string) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "PARTNER" && session?.user?.role !== "SUPER_ADMIN") return;

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: newStatus as any },
  });
  revalidatePath("/admin/bookings");
  revalidatePath("/dashboard/history");
}

export async function confirmBookingPayment(bookingId: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CONFIRMED" },
  });

  revalidatePath("/dashboard/history");
  redirect("/dashboard/history");
}

export async function requestPaymentConfirmation(bookingId: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "PENDING_PAYMENT" },
  });

  revalidatePath("/dashboard/history");
  redirect(`/payment/${bookingId}`);
}

// --- 4. USER ACTIONS ---

export async function deleteUser(userId: string) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") return;
  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/admin/users");
}

export async function register(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "Email tồn tại" };

  await prisma.user.create({
    data: {
      name, email,
      password: await hash(password, 10),
      role: "USER", 
      image: `https://ui-avatars.com/api/?name=${name}`,
    }
  });
  redirect("/login");
}

// --- 5. BLOG ACTIONS ---

export async function createBlogPost(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const slug = title.toLowerCase().replace(/\s+/g, "-");

  await prisma.blogPost.create({
    data: {
      title,
      slug,
      content,
      status: "PUBLISHED",
      authorId: session.user.id,
    },
  });

  revalidatePath("/blog");
  return { success: true };
}

export async function updateBlogStatus(blogId: string, status: "DRAFT" | "PUBLISHED") {
  const session = await auth();
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") return;

  await prisma.blogPost.update({
    where: { id: blogId },
    data: { status },
  });

  revalidatePath("/blog");
  revalidatePath("/admin/blogs");
}

export async function deleteBlogPost(blogId: string) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") return;

  await prisma.blogPost.delete({ where: { id: blogId } });
  revalidatePath("/blog");
  revalidatePath("/admin/blogs");
}

// --- 6. ATTRACTION ACTIONS ---

export async function createAttraction(
  _previousState: any,
  payload: FormData
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
    return { error: "Unauthorized" };
  }

  const name = payload.get("name") as string;
  const city = payload.get("city") as string;

  await prisma.attraction.create({
    data: {
      name,
      city,
      address: payload.get("address") as string || null,
      category: payload.get("category") as string || null,
      description: payload.get("description") as string || null,
      images: [payload.get("imageUrl") as string || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800"],
      status: "PUBLISHED",
    },
  });

  revalidatePath("/admin/attractions");
  return { success: true };
}

export async function deleteAttraction(id: string) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") return;

  await prisma.attraction.delete({ where: { id } });
  revalidatePath("/admin/attractions");
}

// --- 7. VOUCHER ACTIONS ---

export async function createVoucher(formData: FormData) {
  const code = formData.get("code") as string;
  const discount = parseFloat(formData.get("discount") as string) || 0;

  await prisma.voucher.create({
    data: {
      code: code.toUpperCase(),
      discount,
      type: "AMOUNT",
      description: formData.get("description") as string,
      endDate: new Date(formData.get("endDate") as string),
    }
  });
  revalidatePath("/admin/vouchers");
}

export async function deleteVoucher(voucherId: string) {
  await prisma.voucher.delete({ where: { id: voucherId } });
  revalidatePath("/admin/vouchers");
}

// --- 8. FLIGHT ACTIONS ---

export async function bookFlight(formData: FormData) {
  const session = await auth();
  if (!session) redirect("/login");
  
  const flightId = formData.get("flightId") as string;
  const flight = await prisma.flight.findUnique({ where: { id: flightId }});
  if(!flight) return;
  
  await prisma.flightBooking.create({
    data: { 
      userId: session.user.id, 
      flightId, 
      totalPrice: flight.price 
    }
  });
  redirect("/dashboard/history");
}

// --- 10. PARTNER APPLICATION ACTIONS ---

export async function submitPartnerApplication(formData: FormData) {
  console.log("🔄 Partner application submission started...");
  
  try {
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

    console.log("📋 Application data:", {
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

    if (existingUser) {
      // Nếu user đã tồn tại, tạo partner application
      const application = await prisma.partnerApplication.create({
        data: {
          ...applicationData,
          userId: existingUser.id
        }
      });
      console.log("✅ Application created with existing user:", application.id);
    } else {
      // Tạo partner application mà không cần userId
      const application = await prisma.partnerApplication.create({
        data: applicationData
      });
      console.log("✅ Application created without user:", application.id);
    }

    // Gửi email thông báo (có thể implement sau)
    console.log("📧 Email notification logged for:", applicationData.email);

    console.log("🔄 Revalidating path and redirecting...");
    revalidatePath("/become-partner");
    redirect("/become-partner/success");
    
  } catch (error) {
    console.error("❌ Partner application error:", error);
    redirect("/become-partner?error=true");
  }
}

export async function approvePartnerApplicationAction(formData: FormData) {
  const applicationId = formData.get("applicationId") as string;
  const session = await auth();
  
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
    redirect("/admin");
  }

  try {
    const application = await prisma.partnerApplication.update({
      where: { id: applicationId },
      data: { 
        status: "APPROVED",
        reviewedAt: new Date(),
        reviewedBy: session.user.id
      }
    });

    // Tạo user account nếu chưa có
    if (!application.userId) {
      const newUser = await prisma.user.create({
        data: {
          email: application.email,
          name: application.fullName,
          role: "PARTNER",
          emailVerified: new Date(),
        }
      });

      // Cập nhật application với userId mới
      await prisma.partnerApplication.update({
        where: { id: applicationId },
        data: { userId: newUser.id }
      });
    } else {
      // Cập nhật role của user hiện tại thành PARTNER
      await prisma.user.update({
        where: { id: application.userId },
        data: { role: "PARTNER" }
      });
    }

    revalidatePath("/admin/partner-applications");
  } catch (error) {
    console.error("Approve application error:", error);
  }
}

export async function rejectPartnerApplicationAction(formData: FormData) {
  const applicationId = formData.get("applicationId") as string;
  const session = await auth();
  
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
    redirect("/admin");
  }

  try {
    await prisma.partnerApplication.update({
      where: { id: applicationId },
      data: { 
        status: "REJECTED",
        reviewedAt: new Date(),
        reviewedBy: session.user.id,
        reviewNotes: "Đơn đăng ký không đáp ứng yêu cầu."
      }
    });

    revalidatePath("/admin/partner-applications");
  } catch (error) {
    console.error("Reject application error:", error);
  }
}