"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hash } from "bcryptjs";
import { enumerateNights, ensureFutureInventoryCalendar, ensureRoomInventoryRows, reserveRoomInventoryOrThrow, releaseRoomInventory } from "@/lib/inventory";
import type { BookingStatus } from "@prisma/client";
import { calculateBaseAmount, calculateFees, calculateTotal, evaluateVoucher } from "@/lib/pricing";

// --- 1. HOTEL ACTIONS ---

export async function createHotel(formData: FormData) {
  const session = await auth();
  if (!session || !session.user?.id) redirect("/login");
  // Only partner/admin roles can create hotels.
  if (session.user.role !== "PARTNER" && session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
    redirect("/");
  }

  const hotel = await prisma.hotel.create({
    data: {
      name: formData.get("name") as string,
      city: formData.get("city") as string,
      address: formData.get("address") as string,
      description: formData.get("description") as string,
      status: "ACTIVE", rating: 5.0,
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

export async function deleteHotel(hotelId: string) {
  // Check quyền Admin để bảo mật
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