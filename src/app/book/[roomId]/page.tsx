import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function CheckoutPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params;
  
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: { hotel: true },
  });

  if (!room) {
    return <div>Phòng không tồn tại</div>;
  }

  redirect(`/hotels/${room.hotelId}?roomId=${room.id}`);
}