import { auth } from "@/auth";
import { ClientSiteHeader } from "@/components/layouts/ClientSiteHeader";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plane, CalendarDays, ArrowRight, Clock } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export default async function TransportPage({ searchParams }: { searchParams: Promise<{ from?: string, to?: string, date?: string }> }) {
  const session = await auth();
  const params = await searchParams;

  const fromCity = params.from || "";
  const toCity = params.to || "";
  
  // LOGIC TÌM KIẾM CHUYẾN BAY 
  const flights = await prisma.flight.findMany({
    where: {
      fromCity: { contains: fromCity, mode: "insensitive" },
      toCity: { contains: toCity, mode: "insensitive" },
    },
    orderBy: { departureTime: 'asc' }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <ClientSiteHeader session={session as any} className="bg-blue-600 border-none sticky top-0" />

      {/* SEARCH BAR */}
      <div className="bg-blue-600 pb-16 pt-8 px-4">
        <div className="container mx-auto max-w-5xl">
            <h1 className="text-3xl font-bold text-white mb-6 flex items-center gap-2">
                <Plane className="h-8 w-8" /> Đặt vé máy bay giá rẻ
            </h1>
            
            <form className="bg-white p-4 rounded-2xl shadow-xl flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Điểm đi</label>
                    <Input name="from" placeholder="Hà Nội (HAN)" defaultValue={fromCity} className="border-0 bg-gray-100 mt-1 font-bold text-lg" />
                </div>
                <div className="flex-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Điểm đến</label>
                    <Input name="to" placeholder="Hồ Chí Minh (SGN)" defaultValue={toCity} className="border-0 bg-gray-100 mt-1 font-bold text-lg" />
                </div>
                <div className="flex-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Ngày đi</label>
                    <Input name="date" type="date" className="border-0 bg-gray-100 mt-1 font-bold" />
                </div>
                <Button type="submit" size="lg" className="bg-orange-500 hover:bg-orange-600 text-white font-bold h-auto px-8 rounded-xl">
                    Tìm chuyến bay
                </Button>
            </form>
        </div>
      </div>

      {/* RESULT LIST */}
      <main className="container mx-auto px-4 -mt-8 pb-20">
        {flights.length > 0 ? (
            <div className="space-y-4 max-w-5xl mx-auto">
                {flights.map((flight) => (
                    <Card key={flight.id} className="border-none shadow-md hover:shadow-lg transition-all overflow-hidden">
                        <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                            {/* Hãng bay */}
                            <div className="flex items-center gap-4 min-w-[150px]">
                                <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <Plane className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-bold text-lg">{flight.airline}</p>
                                    <p className="text-sm text-gray-500">{flight.flightNumber}</p>
                                </div>
                            </div>

                            {/* Giờ bay */}
                            <div className="flex items-center gap-8 flex-1 justify-center">
                                <div className="text-center">
                                    <p className="text-2xl font-black text-gray-900">
                                        {format(flight.departureTime, "HH:mm")}
                                    </p>
                                    <p className="bg-gray-100 px-2 py-1 rounded text-xs font-bold text-gray-600 mt-1">
                                        {flight.fromCity}
                                    </p>
                                </div>
                                <div className="flex flex-col items-center">
                                    <p className="text-xs text-gray-400 mb-1">2h 10m</p>
                                    <div className="w-24 h-[2px] bg-gray-300 relative">
                                        <div className="absolute -right-1 -top-1 h-2 w-2 bg-gray-300 rounded-full" />
                                        <div className="absolute -left-1 -top-1 h-2 w-2 bg-gray-300 rounded-full" />
                                        <Plane className="h-4 w-4 text-gray-400 absolute left-1/2 -top-2 -ml-2 rotate-90" />
                                    </div>
                                    <p className="text-xs text-green-600 font-bold mt-1">Bay thẳng</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-black text-gray-900">
                                        {format(flight.arrivalTime, "HH:mm")}
                                    </p>
                                    <p className="bg-gray-100 px-2 py-1 rounded text-xs font-bold text-gray-600 mt-1">
                                        {flight.toCity}
                                    </p>
                                </div>
                            </div>

                            {/* Giá tiền */}
                            <div className="text-right min-w-[150px]">
                                <p className="text-xs text-gray-500 line-through">{(flight.price * 1.2).toLocaleString()}đ</p>
                                <p className="text-2xl font-bold text-orange-600">{flight.price.toLocaleString()}đ</p>
                                <p className="text-xs text-gray-500 mb-2">/ khách</p>
                                <Button className="w-full bg-blue-600 hover:bg-blue-700 font-bold rounded-lg">
                                    Chọn vé
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        ) : (
            <div className="bg-white p-12 rounded-2xl shadow-sm text-center">
                <div className="inline-flex bg-gray-100 p-4 rounded-full mb-4">
                    <Plane className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Chưa tìm thấy chuyến bay nào</h3>
                <p className="text-gray-500 mt-2">Hãy thử tìm “Hà Nội” hoặc “Hồ Chí Minh” xem sao.</p>
                <p className="text-sm text-red-500 mt-4">(Lưu ý: Bạn cần thêm dữ liệu vào bảng Flight trong DB)</p>
            </div>
        )}
      </main>
    </div>
  );
}