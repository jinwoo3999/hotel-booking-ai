"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Check, Wifi, Tv, Coffee } from "lucide-react";
import { SelectRoomButton } from "./SelectRoomButton";

interface RoomCardProps {
  room: {
    id: string;
    name: string;
    description: string;
    price: number;
    maxGuests: number;
    images: string[];
    amenities: string[];
  };
  hotelId: string;
}

export function RoomCard({ room, hotelId }: RoomCardProps) {
  const [showModal, setShowModal] = useState(false);

  const getImg = (images: string[], index: number) => {
    return images?.[index] || "https://images.unsplash.com/photo-1566073771259-6a8506099945";
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col md:flex-row hover:shadow-xl transition-all duration-300 group">
        <div className="w-full md:w-72 h-64 md:h-auto relative bg-gray-100 shrink-0 overflow-hidden">
          <img 
            src={getImg(room.images, 0)} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
            alt={room.name} 
          />
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
              <Badge variant="secondary" className="bg-indigo-50 text-indigo-700">
                <Users className="w-3 h-3 mr-1"/> {room.maxGuests} người
              </Badge>
              <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                <Check className="w-3 h-3 mr-1"/> Có thể hủy
              </Badge>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-dashed flex items-end justify-between gap-3">
            <div>
              <p className="text-xs text-gray-400 line-through">{(room.price * 1.3).toLocaleString()}đ</p>
              <p className="text-2xl font-bold text-indigo-600">
                {room.price.toLocaleString()}đ <span className="text-xs font-normal text-gray-500">/ đêm</span>
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
                onClick={() => setShowModal(true)}
              >
                Xem phòng
              </Button>
              <SelectRoomButton hotelId={hotelId} roomId={room.id} />
            </div>
          </div>
        </div>
      </div>

      {/* Room Detail Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" 
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center z-10">
              <h3 className="text-xl font-bold">{room.name}</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                {room.images.map((img: string, idx: number) => (
                  <img 
                    key={idx} 
                    src={img} 
                    alt={`${room.name} ${idx + 1}`} 
                    className="w-full h-48 object-cover rounded-lg" 
                  />
                ))}
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-lg mb-2">Mô tả</h4>
                  <p className="text-gray-600">{room.description}</p>
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-2">Tiện nghi</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {room.amenities.map((amenity: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                        <Check className="w-4 h-4 text-green-600" />
                        {amenity}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <p className="text-sm text-gray-500">Giá mỗi đêm</p>
                    <p className="text-3xl font-bold text-indigo-600">{room.price.toLocaleString()}đ</p>
                  </div>
                  <SelectRoomButton hotelId={hotelId} roomId={room.id} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
