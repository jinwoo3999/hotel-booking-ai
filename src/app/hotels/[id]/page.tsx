import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ClientSiteHeader } from "@/components/layouts/ClientSiteHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Users, Check, Wifi, Tv, Coffee } from "lucide-react";
import BookingForm from "@/components/hotels/BookingForm";
import { SelectRoomButton } from "@/components/hotels/SelectRoomButton";
import HotelMap from "@/components/hotels/HotelMap";
import { RoomCard } from "@/components/hotels/RoomCard"; 

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

      <main className="container mx-auto max-w-7xl px-4 py-8 relative z-0 mt-12">
        
        <div className="mb-8 bg-white rounded-2xl p-6 shadow-sm border">
            <div className="flex items-start gap-6">
                <img 
                    src={getImg(hotel.images, 0)} 
                    alt={hotel.name}
                    className="w-32 h-32 object-cover rounded-xl shadow-md"
                />
                <div className="flex-1">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">{hotel.name}</h1>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1 bg-gray-50 px-3 py-1.5 rounded-full border">
                            <MapPin className="w-4 h-4 text-indigo-600"/> {hotel.address}, {hotel.city}
                        </span>
                        <span className="flex items-center gap-1 bg-yellow-50 px-3 py-1.5 rounded-full border border-yellow-200">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500"/> {hotel.rating} (Tuyệt vời)
                        </span>
                        <span className="flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-200 text-indigo-700 font-medium">
                            {hotel.rooms.length} loại phòng
                        </span>
                    </div>
                </div>
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
                    <RoomCard key={room.id} room={room} hotelId={hotel.id} />
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