import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ClientSiteHeader } from "@/components/layouts/ClientSiteHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Hotel, ArrowRight, MapPin } from "lucide-react";
import Link from "next/link";
import HotelSearch from "@/components/hotels/HotelSearch";

// Hàm lấy ảnh an toàn
const getImg = (images: string[], index: number) => {
    return images?.[index] || "https://images.unsplash.com/photo-1566073771259-6a8506099945";
};

interface SearchParams {
  city?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: string;
}

export default async function HotelsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();
  const params = await searchParams;

  // Tạo điều kiện tìm kiếm
  const whereCondition: any = { status: "ACTIVE" };
  
  // Lọc theo thành phố nếu có
  if (params.city) {
    whereCondition.city = {
      contains: params.city,
      mode: 'insensitive'
    };
  }

  // Lấy danh sách khách sạn với điều kiện lọc
  const hotels = await prisma.hotel.findMany({
    where: whereCondition,
    include: { 
        rooms: {
            where: params.guests ? {
              maxGuests: { gte: parseInt(params.guests) || 2 }
            } : undefined,
            orderBy: { price: 'asc' },
            take: 1
        }
    },
    orderBy: { rating: 'desc' }
  });

  // Lọc ra những khách sạn có phòng phù hợp
  const filteredHotels = hotels.filter(hotel => hotel.rooms.length > 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      <div className="sticky top-0 z-50 bg-white shadow-sm border-b">
        <ClientSiteHeader session={session as any} />
      </div>

      <main className="container mx-auto max-w-7xl px-4 py-8">
        
        {/* THANH TÌM KIẾM */}
        <HotelSearch />

        {/* KẾT QUẢ TÌM KIẾM */}
        <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Hotel className="w-6 h-6 text-indigo-600"/> 
                {params.city ? `Khách sạn tại ${params.city}` : 'Khách sạn nổi bật'}
            </h2>
            <span className="text-sm text-gray-500">{filteredHotels.length} kết quả</span>
        </div>

        {/* Hiển thị bộ lọc đang áp dụng */}
        {(params.city || params.checkIn || params.guests) && (
          <div className="mb-6 flex flex-wrap gap-2">
            {params.city && (
              <Badge variant="secondary" className="px-3 py-1">
                📍 {params.city}
              </Badge>
            )}
            {params.checkIn && params.checkOut && (
              <Badge variant="secondary" className="px-3 py-1">
                📅 {new Date(params.checkIn).toLocaleDateString('vi-VN')} - {new Date(params.checkOut).toLocaleDateString('vi-VN')}
              </Badge>
            )}
            {params.guests && (
              <Badge variant="secondary" className="px-3 py-1">
                👥 {params.guests} khách
              </Badge>
            )}
          </div>
        )}

        {filteredHotels.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredHotels.map((hotel) => {
                    const minPrice = hotel.rooms[0]?.price || 0;

                    return (
                        <div key={hotel.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
                            {/* ẢNH BÌA */}
                            <div className="relative h-60 overflow-hidden">
                                <img 
                                    src={getImg(hotel.images, 0)} 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                    alt={hotel.name}
                                />
                                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-xs font-bold flex items-center shadow-sm">
                                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 mr-1"/> {hotel.rating}
                                </div>
                                {minPrice > 0 && (
                                    <div className="absolute bottom-3 left-3 bg-indigo-600 text-white px-3 py-1 rounded-lg text-sm font-bold shadow-md">
                                        Từ {minPrice.toLocaleString()}đ
                                    </div>
                                )}
                            </div>

                            {/* NỘI DUNG */}
                            <div className="p-5 flex-1 flex flex-col">
                                <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                                    {hotel.name}
                                </h3>
                                <div className="flex items-center text-gray-500 text-sm mb-3">
                                    <MapPin className="w-4 h-4 mr-1 text-gray-400"/> {hotel.city}
                                </div>
                                <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-1">
                                    {hotel.description || "Khách sạn tiện nghi với dịch vụ chất lượng cao..."}
                                </p>

                                <div className="border-t pt-4 mt-auto">
                                    <Link href={`/hotels/${hotel.id}`}>
                                        <Button className="w-full bg-white border-2 border-indigo-600 text-indigo-700 hover:bg-indigo-50 font-bold group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                            Xem phòng ngay <ArrowRight className="w-4 h-4 ml-2"/>
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        ) : (
            <div className="text-center py-20">
                <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Hotel className="w-8 h-8 text-gray-400"/>
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  {params.city ? `Không tìm thấy khách sạn tại ${params.city}` : 'Chưa có khách sạn nào'}
                </h3>
                <p className="text-gray-500 mt-2">
                  {params.city ? 'Thử tìm kiếm với từ khóa khác hoặc mở rộng khu vực tìm kiếm.' : 'Hệ thống đang cập nhật dữ liệu. Vui lòng quay lại sau.'}
                </p>
            </div>
        )}

      </main>
    </div>
  );
}