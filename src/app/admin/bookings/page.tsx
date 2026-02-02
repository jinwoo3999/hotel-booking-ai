import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { updateBookingStatus } from "@/lib/actions"; // Import action duyệt đơn
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { redirect } from "next/navigation";

export default async function AdminBookingsPage() {
  const session = await auth();
  if (!session) redirect("/login");
  
  const isSuperAdmin = session.user.role === "SUPER_ADMIN";

  // Lấy Booking (Phân quyền: Partner chỉ thấy đơn của khách sạn mình)
  const bookings = await prisma.booking.findMany({
    where: isSuperAdmin ? {} : {
        hotel: { ownerId: session.user.id }
    },
    include: {
        user: true,
        hotel: true,
        room: true
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Quản lý Đặt phòng</h1>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b">
                <tr>
                    <th className="px-6 py-4">Mã đơn</th>
                    <th className="px-6 py-4">Khách hàng</th>
                    <th className="px-6 py-4">Phòng & Ngày</th>
                    <th className="px-6 py-4 text-right">Tổng tiền</th>
                    <th className="px-6 py-4 text-center">Trạng thái</th>
                    <th className="px-6 py-4 text-right">Xử lý</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-mono text-xs text-gray-500">
                            #{booking.id.slice(-6).toUpperCase()}
                        </td>
                        <td className="px-6 py-4">
                            <p className="font-bold text-gray-900">{booking.guestName}</p>
                            <p className="text-xs text-gray-500">{booking.guestPhone}</p>
                        </td>
                        <td className="px-6 py-4">
                            <p className="font-bold text-indigo-600 line-clamp-1">{booking.hotel.name}</p>
                            <p className="text-xs text-gray-500 mb-1">{booking.room.name}</p>
                            <Badge variant="outline" className="text-[10px]">
                                {new Date(booking.checkIn).toLocaleDateString('vi-VN')} → {new Date(booking.checkOut).toLocaleDateString('vi-VN')}
                            </Badge>
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-gray-900">
                            {booking.totalPrice.toLocaleString()}đ
                        </td>
                        <td className="px-6 py-4 text-center">
                            <Badge className={`
                                ${booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : ''}
                                ${booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 animate-pulse' : ''}
                                ${booking.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : ''}
                            `}>
                                {booking.status === 'CONFIRMED' ? 'Đã duyệt' : 
                                 booking.status === 'PENDING' ? 'Chờ duyệt' : 'Đã hủy'}
                            </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                            {booking.status === 'PENDING' && (
                                <div className="flex justify-end gap-2">
                                    {/* Form Xác nhận */}
                                    <form action={updateBookingStatus.bind(null, booking.id, 'CONFIRMED')}>
                                        <Button size="sm" className="bg-green-600 hover:bg-green-700 h-8 w-8 p-0 rounded-full">
                                            <CheckCircle className="h-4 w-4" />
                                        </Button>
                                    </form>
                                    
                                    {/* Form Hủy */}
                                    <form action={updateBookingStatus.bind(null, booking.id, 'CANCELLED')}>
                                        <Button size="sm" variant="destructive" className="h-8 w-8 p-0 rounded-full">
                                            <XCircle className="h-4 w-4" />
                                        </Button>
                                    </form>
                                </div>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
}