import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ClientSiteHeader } from "@/components/layouts/ClientSiteHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Users, Check, Wifi, Tv, Coffee } from "lucide-react";
import BookingForm from "@/components/hotels/BookingForm";
import { SelectRoomButton } from "@/components/hotels/SelectRoomButton";
import HotelMap from "@/components/hotels/HotelMap"; 

const getImg = (images: string[], index: number) => {
    return images?.[index] || "https://images.unsplash.com/photo-1566073771259-6a8506099945";
};

export default async function HotelDetailPage(props: { params: Promise<{ id: string }>; searchParams?: Promise<{ roomId?: string }> }) {
  const session = await auth();
  const params = await props.params;
  const { id } = params;
  const searchParams = await props.searchParams;
  const defaultRoomId = searchParams?.roomId;

  const hotel = await prisma.hotel.findUnique({
    where: { id },
    include: { rooms: true }
  });

  if (!hotel) return <div className="p-20 text-center font-bold text-gray-500">Không tìm thấy khách sạn!</div>;

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const tmr = new Date(now);
  tmr.setDate(tmr.getDate() + 1);
  const tomorrowStr = tmr.toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      
      {/* HEADER: Z-index cao nhất (50) để đè lên mọi thứ khi cuộn */}
      <div className="sticky top-0 z-50 w-full bg-white shadow-sm border-b">
          <ClientSiteHeader session={session as any} />
      </div>

      <main className="container mx-auto max-w-7xl px-4 py-8 relative z-0">
        
        <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">{hotel.name}</h1>
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
                <span className="flex items-center gap-1 bg-white px-3 py-1 rounded-full border shadow-sm">
                    <MapPin className="w-4 h-4 text-indigo-600"/> {hotel.address}, {hotel.city}
                </span>
                <span className="flex items-center gap-1 bg-white px-3 py-1 rounded-full border shadow-sm">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500"/> {hotel.rating} (Tuyệt vời)
                </span>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-12 h-[400px] md:h-[480px] rounded-3xl overflow-hidden shadow-lg relative z-0">
             <div className="md:col-span-3 h-full relative group cursor-pointer">
                <img src={getImg(hotel.images, 0)} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Main" />
                <Badge className="absolute top-4 left-4 bg-white text-black font-bold shadow-lg border-none px-3 py-1 z-10">Phổ biến nhất</Badge>
             </div>
             <div className="hidden md:flex flex-col gap-3 h-full">
                <div className="h-1/2 relative overflow-hidden group">
                    <img src={getImg(hotel.images, 1)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Sub 1" />
                </div>
                <div className="h-1/2 relative overflow-hidden group">
                     <img src={getImg(hotel.images, 2)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Sub 2" />
                </div>
             </div>
        </div>

        {/* LAYOUT CHÍNH: Grid 12 cột */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start relative">
            
            {/* CỘT TRÁI: 8/12 */}
            <div className="lg:col-span-8 space-y-8">
                <h2 className="text-2xl font-bold text-gray-900 border-b pb-4">Các loại phòng có sẵn</h2>
                
                {hotel.rooms.length > 0 ? hotel.rooms.map((room) => (
                    <div key={room.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col md:flex-row hover:shadow-xl transition-all duration-300 group">
                        <div className="w-full md:w-72 h-64 md:h-auto relative bg-gray-100 shrink-0 overflow-hidden">
                             <img src={getImg(room.images, 0)} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={room.name} />
                        </div>
                        <div className="p-6 flex-1 flex flex-col justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{room.name}</h3>
                                <p className="text-gray-500 text-sm line-clamp-2 mb-4">{room.description}</p>
                                <div className="flex gap-4 text-xs text-gray-500 mb-4">
                                    <span className="flex items-center gap-1"><Wifi className="w-3 h-3"/> Wifi free</span>
                                    <span className="flex items-center gap-1"><Tv className="w-3 h-3"/> Smart TV</span>
                                    <span className="flex items-center gap-1"><Coffee className="w-3 h-3"/> Ăn sáng</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <Badge variant="secondary" className="bg-indigo-50 text-indigo-700"><Users className="w-3 h-3 mr-1"/> {room.maxGuests} người</Badge>
                                    <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50"><Check className="w-3 h-3 mr-1"/> Có thể hủy</Badge>
                                </div>
                            </div>
                            <div className="mt-6 pt-4 border-t border-dashed flex items-end justify-between">
                                <div>
                                    <p className="text-xs text-gray-400 line-through">{(room.price * 1.3).toLocaleString()}đ</p>
                                    <p className="text-2xl font-bold text-indigo-600">{room.price.toLocaleString()}đ <span className="text-xs font-normal text-gray-500">/ đêm</span></p>
                                </div>
                                <SelectRoomButton hotelId={hotel.id} roomId={room.id} />
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="text-center p-12 bg-gray-50 rounded-2xl border border-dashed text-gray-500">Chưa có phòng nào.</div>
                )}

                {/* Map Section */}
                <div className="border-t pt-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Vị trí</h2>
                    
                    {/* Only show map if coordinates are not default */}
                    {(hotel.latitude !== 11.940419 || hotel.longitude !== 108.458313) ? (
                      <>
                        <HotelMap 
                            lat={hotel.latitude} 
                            lng={hotel.longitude} 
                            hotelName={hotel.name}
                            address={`${hotel.address}, ${hotel.city}`}
                        />
                        <div className="mt-4 flex items-center gap-2 text-gray-600">
                            <MapPin className="w-5 h-5 text-indigo-600" />
                            <span>{hotel.address}, {hotel.city}</span>
                        </div>
                      </>
                    ) : (
                      <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
                        <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium mb-2">Bản đồ đang được cập nhật</p>
                        <p className="text-sm text-gray-400">
                          <strong>Địa chỉ:</strong> {hotel.address}, {hotel.city}
                        </p>
                      </div>
                    )}
                </div>
            </div>

            {/* CỘT PHẢI: 4/12 (Form Sticky) */}
            <div className="lg:col-span-4 relative">
                {/* Z-Index 30: Thấp hơn Header (50) để khi cuộn Header sẽ đè lên Form */}
                <div className="lg:sticky lg:top-24 z-30 space-y-6">
                    <div id="booking-form">
                        <BookingForm 
                            hotelId={hotel.id} 
                            rooms={hotel.rooms} 
                            user={session?.user as any}
                            defaultToday={todayStr}       
                            defaultTomorrow={tomorrowStr}
                            defaultRoomId={defaultRoomId}
                        />
                    </div>
                    <div className="bg-indigo-50 rounded-2xl p-6 text-indigo-900 shadow-sm border border-indigo-100">
                        <h4 className="font-bold text-lg mb-2">Hỗ trợ 24/7</h4>
                        <p className="text-sm mb-4">Liên hệ ngay nếu bạn cần giúp đỡ.</p>
                        <Button className="w-full bg-white text-indigo-700 font-bold hover:bg-indigo-100">1900 6789</Button>
                    </div>
                </div>
            </div>

        </div>
      </main>
    </div>
  );
}