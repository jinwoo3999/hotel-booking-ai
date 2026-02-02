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

export function HotelActions({ hotelId }: { hotelId: string }) {
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
            onClick={async () => {
                if(confirm("Bạn có chắc chắn muốn xóa khách sạn này không?")) {
                    await deleteHotel(hotelId);
                }
            }}
        >
            <Trash2 className="h-4 w-4" /> Xóa khách sạn
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}