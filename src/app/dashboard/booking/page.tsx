import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Wifi, Star, ArrowRight, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

export default async function AllRoomsPage() {
  const rooms = await prisma.room.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-2 mb-4">
         <Link href="/dashboard"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4"/></Button></Link>
         <div>
            <h1 className="text-3xl font-bold text-gray-900">Tất cả phòng nghỉ</h1>
            <p className="text-muted-foreground">Lựa chọn không gian hoàn hảo cho kỳ nghỉ của bạn.</p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Thêm type: any cho room */}
        {rooms.map((room: any) => (
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
                {/* Thêm type cho am, idx và sửa max-w-[100px] thành max-w-25 */}
                {room.amenities.slice(0, 2).map((am: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full truncate max-w-25"><Wifi className="h-3 w-3" /> {am}</div>
                ))}
              </div>
            </CardContent>

            <CardFooter className="p-4 border-t bg-gray-50/50 flex items-center justify-between mt-auto">
              <div>
                <span className="text-lg font-bold text-indigo-700 block">{formatCurrency(room.pricePerNight)}</span>
                <span className="text-xs text-muted-foreground">/ đêm</span>
              </div>
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 shadow-md h-9" asChild>
                  <Link href={`/dashboard/booking/${room.id}`}>
                    Đặt <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}