import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Wifi, Utensils, Wind } from "lucide-react";

interface HotelCardProps {
  hotel: {
    id: string;
    name: string;
    city: string;
    address?: string;
    rating: number;
    images: string[];
    rooms: Array<{ price: number }>;
  };
}

export function HotelCard({ hotel }: HotelCardProps) {
  // Giá thấp nhất của khách sạn 
  const minPrice = hotel.rooms[0]?.price || 0;

  return (
    <Link href={`/hotels/${hotel.id}`} className="group block h-full">
      <Card className="h-full border-none shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col rounded-2xl">
        {/* IMAGE SECTION */}
        <div className="relative h-56 w-full overflow-hidden">
          <Image
            src={hotel.images[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"}
            alt={hotel.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute top-3 left-3">
             <Badge className="bg-white/90 text-gray-900 font-bold hover:bg-white shadow-sm backdrop-blur-sm">
                🔥 Ưu đãi
             </Badge>
          </div>
          <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
             <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" /> {hotel.rating}
          </div>
        </div>

        {/* CONTENT SECTION */}
        <CardContent className="p-4 flex-1 flex flex-col gap-2">
            <div className="text-xs text-gray-500 flex items-center gap-1 font-medium">
                <MapPin className="h-3 w-3 text-indigo-500" /> {hotel.city}
            </div>
            <h3 className="font-bold text-lg text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                {hotel.name}
            </h3>
            
            {/* Tiện ích */}
            <div className="flex gap-2 mt-1">
                <div className="p-1.5 bg-gray-50 rounded-md text-gray-500"><Wifi className="h-3 w-3"/></div>
                <div className="p-1.5 bg-gray-50 rounded-md text-gray-500"><Utensils className="h-3 w-3"/></div>
                <div className="p-1.5 bg-gray-50 rounded-md text-gray-500"><Wind className="h-3 w-3"/></div>
                <span className="text-xs text-gray-400 flex items-center">+3</span>
            </div>
        </CardContent>

        {/* FOOTER SECTION */}
        <CardFooter className="p-4 pt-0 border-t border-gray-100 flex items-center justify-between mt-auto">
            <div className="flex flex-col">
                <span className="text-xs text-gray-400 line-through">
                    {(minPrice * 1.2).toLocaleString()}đ
                </span>
                <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold text-indigo-600">
                        {minPrice.toLocaleString()}đ
                    </span>
                    <span className="text-xs text-gray-500 font-medium">/ đêm</span>
                </div>
            </div>
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold">
                Xem phòng
            </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}