import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}
const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('vi-VN');
}

export default async function HistoryPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const bookings = await prisma.booking.findMany({
    where: { user: { email: session.user?.email || undefined } },
    include: { room: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Lịch sử đặt phòng</h1>
        <Link href="/dashboard"><Button variant="outline">Đặt thêm phòng mới</Button></Link>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed">
            <p className="text-muted-foreground mb-4">Bạn chưa có chuyến đi nào.</p>
            <Link href="/dashboard/booking"><Button>Khám phá phòng ngay</Button></Link>
        </div>
      ) : (
        <div className="space-y-4">
            {bookings.map((item) => (
                <Card key={item.id} className="flex flex-col md:flex-row overflow-hidden hover:shadow-md transition-shadow">
                    <div className="w-full md:w-64 h-48 md:h-auto relative bg-gray-200">
                        {item.room.images[0] && <Image src={item.room.images[0]} alt={item.room.name} fill className="object-cover" />}
                    </div>
                    <div className="flex-1 p-6 flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-bold">{item.room.name}</h3>
                                <Badge className={item.status === "CONFIRMED" ? "bg-green-600" : "bg-gray-500"}>{item.status === "CONFIRMED" ? "Đã xác nhận" : item.status}</Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                                <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-indigo-600" />Check-in: <span className="font-semibold text-gray-900">{formatDate(item.checkIn)}</span></div>
                                <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-indigo-600" />Check-out: <span className="font-semibold text-gray-900">{formatDate(item.checkOut)}</span></div>
                                <div className="flex items-center gap-2 col-span-2"><MapPin className="h-4 w-4 text-indigo-600" />Đà Nẵng, Việt Nam</div>
                            </div>
                        </div>
                        <div className="flex justify-between items-end border-t pt-4">
                            <div className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> Đặt lúc: {formatDate(item.createdAt)}</div>
                            <div className="text-right"><span className="text-xs text-muted-foreground">Tổng thanh toán</span><p className="text-xl font-bold text-indigo-600">{formatCurrency(item.totalPrice)}</p></div>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
      )}
    </div>
  );
}