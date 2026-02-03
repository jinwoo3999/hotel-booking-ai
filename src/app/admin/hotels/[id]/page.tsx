import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import RoomManager from "@/components/admin/RoomManager"; 
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin } from "lucide-react";
import Link from "next/link";

export default async function AdminHotelDetailPage(props: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN" && session?.user?.role !== "PARTNER") redirect("/");

  const params = await props.params;
  const { id } = params;

  // Logic phân quyền: ADMIN/SUPER_ADMIN thấy tất cả, PARTNER chỉ thấy của mình
  const isAdmin = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN";

  const hotel = await prisma.hotel.findUnique({
    where: { 
      id,
      ...(isAdmin ? {} : { ownerId: session.user.id })
    },
    include: { rooms: true }
  });

  if (!hotel) return <div>Không tìm thấy khách sạn hoặc bạn không có quyền truy cập</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Nút quay lại */}
        <Link href="/admin/hotels">
            <Button variant="ghost" className="mb-4 pl-0 text-gray-500 hover:text-indigo-600">
                <ArrowLeft className="w-4 h-4 mr-2"/> Quay lại danh sách
            </Button>
        </Link>

        {/* Thông tin khách sạn */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{hotel.name}</h1>
                    <div className="flex items-center gap-2 text-gray-500">
                        <MapPin className="w-4 h-4"/> {hotel.address}, {hotel.city}
                    </div>
                </div>
                <Badge className={hotel.status === 'ACTIVE' ? "bg-green-100 text-green-700" : "bg-gray-100"}>
                    {hotel.status}
                </Badge>
            </div>
        </div>

        {/* KHU VỰC QUẢN LÝ PHÒNG */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
            <RoomManager hotelId={hotel.id} rooms={hotel.rooms} />
        </div>
      </div>
    </div>
  );
}