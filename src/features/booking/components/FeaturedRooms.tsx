import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Wifi, Star, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

export async function FeaturedRooms() {
  const rooms = await prisma.room.findMany({
    take: 4,
    orderBy: { createdAt: 'desc' },
  });

  if (rooms.length === 0) {
    return (
      <section className="py-8 text-center border-2 border-dashed rounded-2xl bg-gray-50">
           <p className="text-muted-foreground">Chưa có dữ liệu phòng nào.</p>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div>
            <h2 className="text-2xl font-bold text-gray-900">Phòng nổi bật</h2>
            <p className="text-muted-foreground">Các phòng được khách hàng yêu thích nhất.</p>
        </div>
        <Link href="/dashboard/booking"><Button variant="ghost" className="text-indigo-600">Xem tất cả &rarr;</Button></Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {rooms.map((room) => (
          <Card key={room.id} className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full">
            {/* Sửa aspect-[4/3] thành aspect-4/3 */}
            <div className="relative aspect-4/3 overflow-hidden bg-gray-100">
              {room.images[0] ? (
                 <Image src={room.images[0]} alt={room.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110"/>
              ) : <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>}
              
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-xs font-bold text-gray-900 flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" /> 4.8
              </div>
              {room.isFeatured && <Badge className="absolute top-3 left-3 bg-indigo-600 shadow-lg">Popular</Badge>}
            </div>

            <CardHeader className="p-4 pb-2">
              <CardTitle className="line-clamp-1 text-lg group-hover:text-indigo-600 transition-colors">{room.name}</CardTitle>
              <CardDescription className="line-clamp-1 text-xs mt-1">{room.description}</CardDescription>
            </CardHeader>
            
            <CardContent className="p-4 pt-0 flex-1">
              <div className="flex flex-wrap gap-2 mb-3">
                <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full"><Users className="h-3 w-3" /> {room.capacity}</div>
                {/* Sửa max-w-[100px] thành max-w-25 */}
                {room.amenities.slice(0, 2).map((am, idx) => (
                  <div key={idx} className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full truncate max-w-25"><Wifi className="h-3 w-3" /> {am}</div>
                ))}
              </div>
            </CardContent>

            <CardFooter className="p-4 border-t bg-gray-50/50 flex items-center justify-between mt-auto">
              <div>
                <span className="text-lg font-bold text-indigo-700 block">{formatCurrency(room.pricePerNight)}</span>
                <span className="text-xs text-muted-foreground">/ đêm</span>
              </div>
              
              <Button asChild size="sm" className="bg-indigo-600 hover:bg-indigo-700 shadow-md h-9 cursor-pointer">
                  <Link href={`/dashboard/booking/${room.id}`}>
                    Đặt <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
              </Button>

            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
}