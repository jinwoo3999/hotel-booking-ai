import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, CalendarDays, Hotel, AlertCircle, CreditCard, Wallet } from "lucide-react"; // Import thêm icon
import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export default async function HistoryPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const bookings = await prisma.booking.findMany({
    where: { userId: session.user.id },
    include: { hotel: true, room: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="pb-20">
      <main className="container mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Lịch sử chuyến đi</h1>
            <Link href="/dashboard">
                <Button variant="outline">Quay lại Dashboard</Button>
            </Link>
        </div>

        <div className="space-y-4">
            {bookings.length > 0 ? bookings.map((booking) => (
                <Card key={booking.id} className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all">
                    <div className="flex flex-col md:flex-row">
                        <div className="w-full md:w-48 h-40 bg-gray-200 relative">
                            <img 
                                src={booking.hotel.images[0] || booking.room.images[0]} 
                                alt={booking.hotel.name}
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                            <div className="absolute top-2 left-2">
                                <Badge className={
                                    booking.status === 'CONFIRMED' ? "bg-green-500" : 
                                    booking.status === 'PENDING' ? "bg-yellow-500" : "bg-red-500"
                                }>
                                    {booking.status === 'CONFIRMED' ? 'Đã xác nhận' : 
                                     booking.status === 'PENDING' ? 'Chờ duyệt' : 'Đã hủy'}
                                </Badge>
                            </div>
                        </div>

                        <div className="flex-1 p-6 flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start">
                                    <h3 className="text-xl font-bold text-gray-900">{booking.hotel.name}</h3>
                                    <span className="font-mono text-xs text-gray-400">#{booking.id.slice(-6).toUpperCase()}</span>
                                </div>
                                <p className="text-sm text-gray-500 flex items-center gap-1 mb-2">
                                    <MapPin className="h-3 w-3" /> {booking.hotel.address}
                                </p>
                                <p className="text-sm font-medium text-indigo-600 flex items-center gap-1 mb-3">
                                    <Hotel className="h-3 w-3" /> {booking.room.name}
                                </p>
                                
                                <div className="flex flex-wrap items-center gap-4 text-sm bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <CalendarDays className="h-4 w-4 text-gray-400" />
                                        <span className="font-medium">
                                            {format(booking.checkIn, "dd/MM/yyyy", { locale: vi })} 
                                            {" - "} 
                                            {format(booking.checkOut, "dd/MM/yyyy", { locale: vi })}
                                        </span>
                                    </div>
                                    <div className="text-gray-400">|</div>
                                    <div>
                                        <span className="font-bold text-gray-900">{booking.totalPrice.toLocaleString()}đ</span>
                                    </div>
                                    
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
                        </div>
                    </div>
                </Card>
            )) : (
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