"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Info, Sparkles, ArrowRight } from "lucide-react";
import { useState } from "react";

export default function AIResultPanel({ result }: any) {
  const [showDetail, setShowDetail] = useState<string | null>(null);

  // Validate result
  if (!result || !result.success) {
    return (
      <Card className="bg-red-50 border-red-200 p-6 rounded-2xl">
        <p className="text-red-800">{result?.message || 'Lỗi'}</p>
      </Card>
    );
  }

  // Get hotels
  const hotels = result.hotels || [];
  
  if (hotels.length === 0) {
    return (
      <Card className="bg-yellow-50 border-yellow-200 p-6 rounded-2xl">
        <p className="text-yellow-800">Không tìm thấy khách sạn</p>
      </Card>
    );
  }

  // Render hotels
  return (
    <div className="space-y-4">
      {/* Success message */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <div>
            <p className="font-bold text-indigo-900">
              Tìm được {hotels.length} khách sạn phù hợp
            </p>
            <p className="text-sm text-indigo-700">{result.message}</p>
          </div>
        </div>
      </div>

      {/* Hotels list */}
      {hotels.map((hotel: any, idx: number) => (
        <Card key={hotel.id} className="p-4 border-2 hover:shadow-lg transition-all">
          {idx === 0 && (
            <div className="bg-indigo-600 text-white px-3 py-1 rounded-t-lg -m-4 mb-4">
              <span className="text-sm font-bold">⭐ AI đề xuất tốt nhất</span>
            </div>
          )}
          
          <div className="flex gap-4">
            {/* Image */}
            <img
              src={hotel.images?.[0] || "https://via.placeholder.com/150"}
              alt={hotel.name}
              className="w-32 h-32 object-cover rounded-lg"
            />
            
            {/* Info */}
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-1">{hotel.name}</h3>
              
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>{hotel.rating}</span>
                <span>•</span>
                <MapPin className="w-3 h-3" />
                <span>{hotel.address}</span>
              </div>

              {/* Tags */}
              {hotel.businessTags && (
                <div className="flex gap-1 mb-3">
                  {hotel.businessTags.slice(0, 3).map((tag: string, i: number) => (
                    <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {tag.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              )}

              {/* Description */}
              {showDetail === hotel.id && hotel.description && (
                <p className="text-sm text-gray-600 mb-3 p-2 bg-gray-50 rounded">
                  {hotel.description}
                </p>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDetail(showDetail === hotel.id ? null : hotel.id)}
                >
                  <Info className="w-3 h-3 mr-1" />
                  {showDetail === hotel.id ? 'Ẩn' : 'Chi tiết'}
                </Button>
                <Button
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-700"
                  onClick={() => window.location.href = `/hotels/${hotel.id}`}
                >
                  Xem phòng
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
