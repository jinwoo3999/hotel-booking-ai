"use client";

import { BookingForm } from "@/features/booking/components/BookingForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wifi, Tv, Coffee, Car, MapPin, Share2, Heart } from "lucide-react";
import Image from "next/image";

// Mock Data cho 1 phòng cụ thể
const ROOM_DATA = {
  id: "1",
  name: "Luxury Ocean View Suite - Đà Nẵng",
  address: "123 Võ Nguyên Giáp, Quận Sơn Trà, Đà Nẵng",
  description: "Tận hưởng kỳ nghỉ đẳng cấp tại Suite hướng biển của chúng tôi. Phòng được thiết kế theo phong cách hiện đại, ban công rộng rãi nhìn thẳng ra biển Mỹ Khê. Thích hợp cho các cặp đôi hoặc gia đình nhỏ.",
  price: 2500000,
  images: [
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=80",
    "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80",
    "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80",
    "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&q=80",
  ],
  amenities: [
    { icon: Wifi, name: "Wifi tốc độ cao" },
    { icon: Tv, name: "Smart TV 4K" },
    { icon: Coffee, name: "Máy pha cà phê" },
    { icon: Car, name: "Đưa đón sân bay" },
  ]
};

export default function RoomDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{ROOM_DATA.name}</h1>
          <div className="flex items-center text-muted-foreground">
            <MapPin className="h-4 w-4 mr-1" />
            {ROOM_DATA.address}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Share2 className="h-4 w-4" /> Chia sẻ
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Heart className="h-4 w-4" /> Lưu tin
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-8">
        {/* Ảnh chính to nhất bên trái */}
        <div className="md:col-span-2 md:row-span-2 relative h-full">
          <img 
            src={ROOM_DATA.images[0]} 
            alt="Main room" 
            className="w-full h-full object-cover hover:opacity-95 transition-opacity cursor-pointer"
          />
        </div>
        <div className="relative h-full">
           <img src={ROOM_DATA.images[1]} alt="Room 2" className="w-full h-full object-cover hover:opacity-95 transition-opacity cursor-pointer" />
        </div>
        <div className="relative h-full">
           <img src={ROOM_DATA.images[2]} alt="Room 3" className="w-full h-full object-cover hover:opacity-95 transition-opacity cursor-pointer" />
        </div>
        <div className="md:col-span-2 relative h-full">
           <img src={ROOM_DATA.images[3]} alt="Room 4" className="w-full h-full object-cover hover:opacity-95 transition-opacity cursor-pointer" />
           <Button variant="secondary" className="absolute bottom-4 right-4 shadow-lg">
             Xem tất cả ảnh
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          {/* Mô tả */}
          <div>
            <h2 className="text-xl font-bold mb-4">Giới thiệu phòng</h2>
            <p className="text-gray-600 leading-relaxed text-lg">
              {ROOM_DATA.description}
            </p>
          </div>

          {/* Tiện nghi */}
          <div>
             <h2 className="text-xl font-bold mb-4">Tiện nghi nổi bật</h2>
             <div className="grid grid-cols-2 gap-4">
                {ROOM_DATA.amenities.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <item.icon className="h-6 w-6 text-indigo-600" />
                    <span className="font-medium text-gray-700">{item.name}</span>
                  </div>
                ))}
             </div>
          </div>

          {/* Quy định (Example) */}
          <div className="border-t pt-8">
             <h2 className="text-xl font-bold mb-4">Quy định chung</h2>
             <ul className="list-disc list-inside text-gray-600 space-y-2">
               <li>Nhận phòng: Sau 14:00</li>
               <li>Trả phòng: Trước 12:00</li>
               <li>Không hút thuốc trong phòng</li>
               <li>Không mang theo vật nuôi</li>
             </ul>
          </div>
        </div>

        {/* Cột phải: Form Đặt Phòng (Sticky) */}
        <div className="relative">
          <BookingForm pricePerNight={ROOM_DATA.price} />
        </div>

      </div>
    </div>
  );
}