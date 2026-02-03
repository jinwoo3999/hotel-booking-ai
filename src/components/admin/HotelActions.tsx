"use client";

import { deleteHotel } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash2, Edit } from "lucide-react";
import { useState } from "react";

export function HotelActions({ hotelId }: { hotelId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Bạn có chắc chắn muốn xóa khách sạn này không?\n\nLưu ý: Tất cả phòng, booking và dữ liệu liên quan sẽ bị xóa vĩnh viễn.")) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteHotel(hotelId);
      
      if (result.success) {
        alert("✅ Xóa khách sạn thành công!");
        // Refresh page to update the list
        window.location.reload();
      } else {
        alert("❌ " + (result.error || "Có lỗi xảy ra khi xóa khách sạn"));
      }
    } catch (error) {
      console.error("Delete hotel error:", error);
      alert("❌ Có lỗi xảy ra khi xóa khách sạn");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-900">
            <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem className="cursor-pointer gap-2">
            <Edit className="h-4 w-4" /> Chỉnh sửa
        </DropdownMenuItem>
        
        {/* Nút Xóa gọi Server Action */}
        <DropdownMenuItem 
            className="cursor-pointer gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleDelete}
            disabled={isDeleting}
        >
            <Trash2 className="h-4 w-4" /> 
            {isDeleting ? "Đang xóa..." : "Xóa khách sạn"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}