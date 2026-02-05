"use client";

import { useState, useMemo } from "react";
import { HotelFilters, FilterState } from "./HotelFilters";
import { HotelCard } from "./HotelCard";
import { Info } from "lucide-react";

interface Hotel {
  id: string;
  name: string;
  city: string;
  rating: number;
  images: string[];
  rooms: Array<{
    id: string;
    price: number;
    amenities: string[];
  }>;
  [key: string]: any;
}

interface HotelSearchResultsProps {
  hotels: Hotel[];
}

export function HotelSearchResults({ hotels }: HotelSearchResultsProps) {
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 5000000],
    minRating: 0,
    amenities: [],
    sortBy: "rating-desc"
  });

  // Filter và sort hotels
  const filteredHotels = useMemo(() => {
    let result = hotels.filter(hotel => {
      // Filter by price
      const minPrice = hotel.rooms[0]?.price || 0;
      if (minPrice < filters.priceRange[0] || minPrice > filters.priceRange[1]) {
        return false;
      }

      // Filter by rating
      if (hotel.rating < filters.minRating) {
        return false;
      }

      // Filter by amenities
      if (filters.amenities.length > 0) {
        const hotelAmenities = hotel.rooms[0]?.amenities || [];
        const hasAllAmenities = filters.amenities.every(amenity =>
          hotelAmenities.some(ha => 
            ha.toLowerCase().includes(amenity.toLowerCase()) ||
            amenity.toLowerCase().includes(ha.toLowerCase())
          )
        );
        if (!hasAllAmenities) {
          return false;
        }
      }

      return true;
    });

    // Sort
    switch (filters.sortBy) {
      case "rating-desc":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "price-asc":
        result.sort((a, b) => (a.rooms[0]?.price || 0) - (b.rooms[0]?.price || 0));
        break;
      case "price-desc":
        result.sort((a, b) => (b.rooms[0]?.price || 0) - (a.rooms[0]?.price || 0));
        break;
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return result;
  }, [hotels, filters]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Filters Sidebar */}
      <div className="lg:col-span-1">
        <div className="lg:sticky lg:top-24">
          <HotelFilters
            onFilterChange={setFilters}
            totalResults={filteredHotels.length}
          />
        </div>
      </div>

      {/* Results */}
      <div className="lg:col-span-3">
        {filteredHotels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredHotels.map((hotel, index) => (
              <div key={hotel.id} className="relative group h-full">
                {/* Top badge */}
                {index < 3 && (
                  <div className="absolute -top-3 -left-3 z-20 h-10 w-10 bg-yellow-400 text-black font-black flex items-center justify-center rounded-full shadow-lg border-2 border-white">
                    #{index + 1}
                  </div>
                )}
                <HotelCard hotel={hotel} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <Info className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900 text-lg">
              Không tìm thấy khách sạn phù hợp
            </h3>
            <p className="text-gray-500 mb-6">
              Thử điều chỉnh bộ lọc để xem thêm kết quả
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
