import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, ArrowRight, Flame } from "lucide-react";
import Link from "next/link";

export async function TrendingHotels({ city }: { city?: string }) {
  const hotels = await prisma.hotel.findMany({
    where: {
      status: "ACTIVE",
      ...(city ? { city: { contains: city, mode: "insensitive" } } : {})
    },
    orderBy: { rating: 'desc' }, 
    take: 10, 
    include: { 
      rooms: {
        orderBy: { price: 'asc' },
        take: 1 
      }
    }
  });

  if (hotels.length === 0) return null;

  return (
    <section className="py-12">
      <div className="flex items-center justify-between mb-6 px-4">
        <div>
            <h2 className="text-3xl font-bold flex items-center gap-2">
                <Flame className="text-red-500 fill-red-500" /> 
                {city ? `Top Hot tại ${city}` : "Điểm đến đang Hot"}
            </h2>
            <p className="text-gray-500">Các khách sạn được yêu thích nhất hiện nay</p>
        </div>
        {!city && (
            <Link href="/search">
                <Button variant="ghost" className="text-indigo-600">Xem tất cả <ArrowRight className="ml-2 h-4 w-4"/></Button>
            </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
        {hotels.map((hotel) => (
            <Link key={hotel.id} href={`/hotels/${hotel.id}`} className="group">
                <Card className="h-full border-none shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
                    {/* Hình ảnh có hiệu ứng Zoom */}
                    <div className="relative h-60 overflow-hidden">
                        <img 
                            src={hotel.images[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945"} 
                            alt={hotel.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold flex items-center shadow-sm">
                            <Star className="h-3 w-3 text-yellow-500 mr-1 fill-yellow-500" />
                            {hotel.rating}
                        </div>
                        {/* Huy hiệu HOT */}
                        <div className="absolute top-3 left-3 bg-red-600 text-white px-2 py-1 rounded-md text-[10px] font-bold uppercase shadow-sm animate-pulse">
                            Trending
                        </div>
                    </div>

                    <CardContent className="p-4">
                        <h3 className="font-bold text-lg text-gray-900 line-clamp-1 mb-1 group-hover:text-indigo-600 transition-colors">
                            {hotel.name}
                        </h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mb-4">
                            <MapPin className="h-3 w-3 shrink-0" /> {hotel.address}, {hotel.city}
                        </p>
                        
                        <div className="flex items-end justify-between pt-4 border-t border-dashed">
                            <div>
                                <p className="text-xs text-gray-400">Giá chỉ từ</p>
                                <p className="text-xl font-black text-indigo-600">
                                    {hotel.rooms[0]?.price.toLocaleString() || "Liên hệ"}đ
                                </p>
                            </div>
                            <Button size="sm" className="rounded-full bg-gray-900 group-hover:bg-indigo-600">
                                Đặt ngay
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </Link>
        ))}
      </div>
    </section>
  );
}