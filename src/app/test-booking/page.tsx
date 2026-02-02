import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ClientSiteHeader } from "@/components/layouts/ClientSiteHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { CheckCircle2, User, Hotel, Calendar, CreditCard } from "lucide-react";

export default async function TestBookingPage() {
  const session = await auth();
  if (!session) redirect("/login");

  // Lấy dữ liệu test
  const hotels = await prisma.hotel.findMany({
    include: { rooms: true },
    take: 2
  });

  const userBookings = await prisma.booking.findMany({
    where: { userId: session.user.id },
    include: { hotel: true, room: true },
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <ClientSiteHeader session={session as any} className="bg-white sticky top-0 border-b z-40" />

      <main className="container mx-auto max-w-6xl px-4 py-8">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🧪 Test Booking Flow</h1>
          <p className="text-gray-600">Trang test để kiểm tra tính năng đặt phòng</p>
          <Badge className="mt-2 bg-green-100 text-green-800">
            Đăng nhập: {session.user?.name} ({session.user?.email})
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Test Hotels */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hotel className="w-5 h-5" />
                Khách sạn có sẵn để test
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {hotels.map(hotel => (
                <div key={hotel.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex gap-3">
                    <img src={hotel.images[0]} className="w-16 h-16 rounded-lg object-cover" />
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{hotel.name}</h3>
                      <p className="text-sm text-gray-500">{hotel.city}</p>
                      <p className="text-xs text-gray-400">{hotel.rooms.length} phòng có sẵn</p>
                      <div className="mt-2">
                        <Link href={`/hotels/${hotel.id}`}>
                          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                            Test đặt phòng
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {hotels.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Không có khách sạn nào. Chạy seed data trước.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Booking History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Lịch sử đặt phòng của bạn
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {userBookings.map(booking => (
                <div key={booking.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-sm">{booking.hotel.name}</h4>
                      <p className="text-xs text-gray-500">{booking.room.name}</p>
                    </div>
                    <Badge variant={booking.status === 'CONFIRMED' ? 'default' : 'secondary'}>
                      {booking.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>Khách: {booking.guestName}</p>
                    <p>Ngày: {new Date(booking.checkIn).toLocaleDateString('vi-VN')} - {new Date(booking.checkOut).toLocaleDateString('vi-VN')}</p>
                    <p>Tổng tiền: {booking.totalPrice.toLocaleString()}đ</p>
                  </div>
                  {booking.status === 'PENDING' && (
                    <div className="mt-2">
                      <Link href={`/payment/${booking.id}`}>
                        <Button size="sm" variant="outline" className="text-xs">
                          Thanh toán
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              ))}
              
              {userBookings.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Chưa có booking nào.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Test Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Hướng dẫn test
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div>
                <h4 className="font-bold text-indigo-600 mb-2">1. Test đặt phòng</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Click "Test đặt phòng" ở khách sạn</li>
                  <li>• Chọn phòng, ngày, điền thông tin</li>
                  <li>• Click "Xác nhận Đặt phòng"</li>
                  <li>• Kiểm tra có chuyển đến trang thanh toán không</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-indigo-600 mb-2">2. Test thanh toán</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Kiểm tra thông tin booking đúng không</li>
                  <li>• Kiểm tra QR code hiển thị</li>
                  <li>• Test nút "Gửi yêu cầu xác nhận"</li>
                  <li>• Kiểm tra status có update không</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-indigo-600 mb-2">3. Test lịch sử</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Vào /dashboard/history</li>
                  <li>• Kiểm tra booking mới có hiện không</li>
                  <li>• Test các nút action</li>
                  <li>• Kiểm tra filter và search</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-8 text-center space-x-4">
          <Link href="/dashboard/history">
            <Button variant="outline">
              Xem lịch sử đặt phòng
            </Button>
          </Link>
          <Link href="/admin">
            <Button variant="outline">
              Trang Admin
            </Button>
          </Link>
          <Link href="/">
            <Button>
              Về trang chủ
            </Button>
          </Link>
        </div>

      </main>
    </div>
  );
}