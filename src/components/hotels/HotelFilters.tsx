"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SlidersHorizontal, X, Star } from "lucide-react";

interface HotelFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  totalResults: number;
}

export interface FilterState {
  priceRange: [number, number];
  minRating: number;
  amenities: string[];
  sortBy: string;
}

const AMENITIES = [
  { id: "wifi", label: "WiFi miễn phí" },
  { id: "pool", label: "Hồ bơi" },
  { id: "gym", label: "Phòng gym" },
  { id: "parking", label: "Bãi đỗ xe" },
  { id: "restaurant", label: "Nhà hàng" },
  { id: "spa", label: "Spa" },
  { id: "breakfast", label: "Ăn sáng" },
  { id: "ac", label: "Điều hòa" },
];

const SORT_OPTIONS = [
  { value: "rating-desc", label: "Rating cao → thấp" },
  { value: "price-asc", label: "Giá thấp → cao" },
  { value: "price-desc", label: "Giá cao → thấp" },
  { value: "name-asc", label: "Tên A → Z" },
];

export function HotelFilters({ onFilterChange, totalResults }: HotelFiltersProps) {
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000000]);
  const [minRating, setMinRating] = useState(0);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("rating-desc");
  const [isOpen, setIsOpen] = useState(false);

  const handlePriceChange = (value: number[]) => {
    const newRange: [number, number] = [value[0], value[1]];
    setPriceRange(newRange);
    applyFilters({ priceRange: newRange, minRating, amenities, sortBy });
  };

  const handleRatingChange = (rating: number) => {
    setMinRating(rating);
    applyFilters({ priceRange, minRating: rating, amenities, sortBy });
  };

  const handleAmenityToggle = (amenityId: string) => {
    const newAmenities = amenities.includes(amenityId)
      ? amenities.filter(a => a !== amenityId)
      : [...amenities, amenityId];
    setAmenities(newAmenities);
    applyFilters({ priceRange, minRating, amenities: newAmenities, sortBy });
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    applyFilters({ priceRange, minRating, amenities, sortBy: value });
  };

  const applyFilters = (filters: FilterState) => {
    onFilterChange(filters);
  };

  const resetFilters = () => {
    setPriceRange([0, 5000000]);
    setMinRating(0);
    setAmenities([]);
    setSortBy("rating-desc");
    applyFilters({
      priceRange: [0, 5000000],
      minRating: 0,
      amenities: [],
      sortBy: "rating-desc"
    });
  };

  const activeFiltersCount = 
    (priceRange[0] > 0 || priceRange[1] < 5000000 ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    amenities.length;

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="lg:hidden mb-4">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          variant="outline"
          className="w-full"
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Lọc & Sắp xếp
          {activeFiltersCount > 0 && (
            <Badge className="ml-2" variant="secondary">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Filters Sidebar */}
      <div className={`
        lg:block bg-white rounded-xl border border-gray-200 p-6 space-y-6
        ${isOpen ? 'block' : 'hidden'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-indigo-600" />
            <h3 className="font-bold text-gray-900">Bộ lọc</h3>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">{activeFiltersCount}</Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="text-xs"
          >
            Xóa tất cả
          </Button>
        </div>

        {/* Results Count */}
        <div className="text-sm text-gray-600">
          Tìm thấy <span className="font-bold text-indigo-600">{totalResults}</span> khách sạn
        </div>

        {/* Sort */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Sắp xếp theo</Label>
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price Range */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Khoảng giá</Label>
          <Slider
            min={0}
            max={5000000}
            step={100000}
            value={priceRange}
            onValueChange={handlePriceChange}
            className="mt-2"
          />
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              {priceRange[0].toLocaleString('vi-VN')}đ
            </span>
            <span className="text-gray-600">
              {priceRange[1].toLocaleString('vi-VN')}đ
            </span>
          </div>
        </div>

        {/* Rating */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Đánh giá tối thiểu</Label>
          <div className="space-y-2">
            {[5, 4, 3, 2].map(rating => (
              <div
                key={rating}
                onClick={() => handleRatingChange(rating === minRating ? 0 : rating)}
                className={`
                  flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors
                  ${minRating === rating ? 'bg-indigo-50 border-2 border-indigo-600' : 'hover:bg-gray-50 border-2 border-transparent'}
                `}
              >
                <div className="flex items-center gap-1">
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-sm text-gray-700">trở lên</span>
              </div>
            ))}
          </div>
        </div>

        {/* Amenities */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Tiện nghi</Label>
          <div className="space-y-2">
            {AMENITIES.map(amenity => (
              <div key={amenity.id} className="flex items-center space-x-2">
                <Checkbox
                  id={amenity.id}
                  checked={amenities.includes(amenity.id)}
                  onCheckedChange={() => handleAmenityToggle(amenity.id)}
                />
                <label
                  htmlFor={amenity.id}
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  {amenity.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Active Filters */}
        {activeFiltersCount > 0 && (
          <div className="pt-4 border-t">
            <div className="flex flex-wrap gap-2">
              {priceRange[0] > 0 || priceRange[1] < 5000000 ? (
                <Badge variant="secondary" className="gap-1">
                  {priceRange[0].toLocaleString('vi-VN')}đ - {priceRange[1].toLocaleString('vi-VN')}đ
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handlePriceChange([0, 5000000])}
                  />
                </Badge>
              ) : null}
              {minRating > 0 && (
                <Badge variant="secondary" className="gap-1">
                  {minRating}⭐+
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleRatingChange(0)}
                  />
                </Badge>
              )}
              {amenities.map(amenityId => (
                <Badge key={amenityId} variant="secondary" className="gap-1">
                  {AMENITIES.find(a => a.id === amenityId)?.label}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleAmenityToggle(amenityId)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
