"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { X, Plus, Save } from "lucide-react";
import { toast } from "sonner";

interface BusinessTagsManagerProps {
  hotelId: string;
  initialTags: string[];
}

const AVAILABLE_TAGS = [
  { value: "business_friendly", label: "Phù hợp công tác", color: "bg-blue-100 text-blue-700" },
  { value: "near_airport", label: "Gần sân bay", color: "bg-purple-100 text-purple-700" },
  { value: "quiet_zone", label: "Khu vực yên tĩnh", color: "bg-green-100 text-green-700" },
  { value: "fast_checkin", label: "Check-in nhanh", color: "bg-orange-100 text-orange-700" },
  { value: "near_beach", label: "Gần biển", color: "bg-cyan-100 text-cyan-700" },
  { value: "city_center", label: "Trung tâm thành phố", color: "bg-indigo-100 text-indigo-700" },
  { value: "tourist_friendly", label: "Phù hợp du lịch", color: "bg-pink-100 text-pink-700" },
  { value: "honeymoon_ready", label: "Phù hợp trăng mật", color: "bg-red-100 text-red-700" },
  { value: "romantic", label: "Lãng mạn", color: "bg-rose-100 text-rose-700" },
  { value: "luxury", label: "Cao cấp", color: "bg-yellow-100 text-yellow-700" },
  { value: "privacy", label: "Riêng tư", color: "bg-gray-100 text-gray-700" },
  { value: "family_safe", label: "An toàn cho gia đình", color: "bg-teal-100 text-teal-700" },
  { value: "spacious", label: "Rộng rãi", color: "bg-lime-100 text-lime-700" },
  { value: "kid_friendly", label: "Thân thiện trẻ em", color: "bg-amber-100 text-amber-700" },
  { value: "flexible_cancellation", label: "Hủy linh hoạt", color: "bg-emerald-100 text-emerald-700" },
];

export default function BusinessTagsManager({ hotelId, initialTags }: BusinessTagsManagerProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags);
  const [isSaving, setIsSaving] = useState(false);

  const toggleTag = (tagValue: string) => {
    if (selectedTags.includes(tagValue)) {
      setSelectedTags(selectedTags.filter(t => t !== tagValue));
    } else {
      setSelectedTags([...selectedTags, tagValue]);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/admin/hotels/${hotelId}/tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags: selectedTags }),
      });

      if (response.ok) {
        toast.success('Đã lưu phân loại khách sạn');
      } else {
        toast.error('Không thể lưu');
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            Phân loại khách sạn (Business Tags)
          </h3>
          <p className="text-sm text-gray-600">
            Chọn các đặc điểm phù hợp với khách sạn. Hệ thống sẽ dùng thông tin này để gợi ý phòng cho khách hàng.
          </p>
        </div>

        {/* Selected Tags */}
        {selectedTags.length > 0 && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <p className="text-xs font-semibold text-indigo-900 mb-2">Đã chọn ({selectedTags.length})</p>
            <div className="flex flex-wrap gap-2">
              {selectedTags.map(tagValue => {
                const tag = AVAILABLE_TAGS.find(t => t.value === tagValue);
                if (!tag) return null;
                return (
                  <Badge
                    key={tagValue}
                    className={`${tag.color} cursor-pointer hover:opacity-80`}
                    onClick={() => toggleTag(tagValue)}
                  >
                    {tag.label}
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Available Tags */}
        <div>
          <p className="text-xs font-semibold text-gray-700 mb-2">Chọn thêm</p>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_TAGS.filter(tag => !selectedTags.includes(tag.value)).map(tag => (
              <Badge
                key={tag.value}
                variant="outline"
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => toggleTag(tag.value)}
              >
                <Plus className="w-3 h-3 mr-1" />
                {tag.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {isSaving ? (
              <>Đang lưu...</>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Lưu phân loại
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
