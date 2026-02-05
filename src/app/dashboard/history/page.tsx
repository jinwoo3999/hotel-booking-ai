import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, CalendarDays, Hotel, AlertCircle, CreditCard, Wallet } from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { BookingImage } from "@/components/booking/BookingImage";

export default async function HistoryPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  let bookings = [];
  let error = null;

  try {
    bookings = await prisma.booking.findMany({
      where: { 
        userId: session.user.id 
      },
      include: { 
        hotel: true, 
        room: true,
        voucher: {
          select: {
            code: true,
            discount: true,
            type: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`Found ${bookings.length} bookings for user ${session.user.id}`);
  } catch (err) {
    console.error("Error fetching bookings:", err);
    error = err;
  }

  return (
    <div className="pb-20">
      <main className="container mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Lịch sử chuyến đi</h1>
            <Link href="/dashboard">
                <Button variant="outline">Quay lại Dashboard</Button>
            </Link>
        </div>

        {error && (
          <Card className="p-6 mb-4 border-red-200 bg-red-50">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <p>Có lỗi khi tải lịch sử đặt phòng. Vui lòng thử lại sau.</p>
            </div>
          </Card>
        )}

        <div className="space-y-4">
            {bookings.length > 0 ? bookings.map((booking) => {
              // Safe image handling
              const hotelImage = booking.hotel?.images?.[0];
              const roomImage = booking.room?.images?.[0];
              const displayImage = hotelImage || roomImage || 'https://images.unsplash.com/photo-1566073771259-6a8506099945';
              
              return (
                <Card key={booking.id} className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all">
                    <div className="flex flex-col md:flex-row">
                        <div className="w-full md:w-48 h-40 bg-gray-200 relative">
                            <BookingImage
                                src={displayImage}
                                alt={booking.hotel?.name || 'Hotel'}
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                            <div className="absolute top-2 left-2">
                                <Badge className={
                                    booking.status === 'CONFIRMED' ? "bg-green-500" : 
                                    booking.status === 'PENDING' ? "bg-yellow-500" : 
                                    booking.status === 'PENDING_PAYMENT' ? "bg-orange-500" :
                                    "bg-red-500"
                                }>
                                    {booking.status === 'CONFIRMED' ? 'Đã xác nhận' : 
                                     booking.status === 'PENDING' ? 'Chờ duyệt' : 
                                     booking.status === 'PENDING_PAYMENT' ? 'Chờ thanh toán' :
                                     'Đã hủy'}
                                </Badge>
                            </div>
                        </div>

                        <div className="flex-1 p-6 flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start">
                                    <h3 className="text-xl font-bold text-gray-900">{booking.hotel?.name || 'N/A'}</h3>
                                    <span className="font-mono text-xs text-gray-400">#{booking.id.slice(-6).toUpperCase()}</span>
                                </div>
                                <p className="text-sm text-gray-500 flex items-center gap-1 mb-2">
                                    <MapPin className="h-3 w-3" /> {booking.hotel?.address || 'N/A'}
                                </p>
                                <p className="text-sm font-medium text-indigo-600 flex items-center gap-1 mb-3">
                                    <Hotel className="h-3 w-3" /> {booking.room?.name || 'N/A'}
                                </p>
                                
                                <div className="flex flex-wrap items-center gap-4 text-sm bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <CalendarDays className="h-4 w-4 text-gray-400" />
                                        <span className="font-medium">
                                            {format(new Date(booking.checkIn), "dd/MM/yyyy", { locale: vi })} 
                                            {" - "} 
                                            {format(new Date(booking.checkOut), "dd/MM/yyyy", { locale: vi })}
                                        </span>
                                    </div>
                                    <div className="text-gray-400">|</div>
                                    <div>
                                        <span className="font-bold text-gray-900">{booking.totalPrice.toLocaleString()}đ</span>
                                    </div>
                                    
                                    {/* Voucher info */}
                                    {booking.voucher && (
                                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                                        🎫 {booking.voucher.code}
                                      </Badge>
                                    )}
                                    
                                    {/* HIỂN THỊ PHƯƠNG THỨC THANH TOÁN */}
                                    <div className="ml-auto">
                                        {booking.paymentMethod === 'PAY_NOW' ? (
                                            <Badge variant="secondary" className="bg-green-100 text-green-700 flex items-center gap-1">
                                                <CreditCard className="h-3 w-3"/> Thanh toán online
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary" className="bg-gray-200 text-gray-700 flex items-center gap-1">
                                                <Wallet className="h-3 w-3"/> Trả tại khách sạn
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Action buttons */}
                            <div className="mt-4 flex gap-2">
                              <Link href={`/dashboard/booking/${booking.id}`}>
                                <Button variant="outline" size="sm">Xem chi tiết</Button>
                              </Link>
                              {booking.status === 'PENDING_PAYMENT' && (
                                <Link href={`/payment/${booking.id}`}>
                                  <Button size="sm" className="bg-indigo-600">Thanh toán ngay</Button>
                                </Link>
                              )}
                            </div>
                        </div>
                    </div>
                </Card>
              );
            }) : (
                <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-dashed">
                    <p className="text-gray-500 mb-4">Bạn chưa có lịch sử đặt phòng nào.</p>
                    <Link href="/">
                        <Button className="bg-indigo-600">Đặt chuyến đi đầu tiên</Button>
                    </Link>
                </div>
            )}
        </div>
      </main>
    </div>
  );
}