"use client";

import { createHotel } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AddHotelForm() {
  return (
    <Card className="max-w-2xl mx-auto shadow-lg border-indigo-50">
      <CardHeader className="bg-gray-50 rounded-t-xl border-b">
        <CardTitle className="text-xl text-indigo-700">Thêm Khách sạn mới</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form action={createHotel} className="space-y-6">
          
          {/* PHẦN 1: THÔNG TIN KHÁCH SẠN */}
          <div className="space-y-4">
            <div className="space-y-2">
                <Label>Tên Khách sạn</Label>
                <Input name="name" placeholder="VD: Mường Thanh Luxury" required className="font-bold" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Thành phố</Label>
                    <Input name="city" placeholder="VD: Đà Nẵng" required />
                </div>
                <div className="space-y-2">
                    <Label>Link Ảnh (URL)</Label>
                    <Input name="imageUrl" placeholder="https://..." />
                </div>
            </div>

            <div className="space-y-2">
                <Label>Địa chỉ chi tiết</Label>
                <Input name="address" placeholder="123 Đường ABC..." required />
            </div>
            
            <div className="space-y-2">
                <Label>Mô tả</Label>
                <Textarea name="description" placeholder="Mô tả tiện ích, vị trí..." rows={3} />
            </div>
          </div>

          {/* PHẦN 2: CẤU HÌNH PHÒNG MẶC ĐỊNH */}
          <div className="border-t pt-6 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
            <h3 className="font-bold mb-4 text-indigo-600 flex items-center gap-2">
                🏠 Cấu hình Phòng mặc định
            </h3>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Tên loại phòng</Label>
                    <Input name="roomName" defaultValue="Phòng Tiêu Chuẩn" required />
                </div>
                <div className="space-y-2">
                    <Label>Giá 1 đêm (VNĐ)</Label>
                    <Input name="roomPrice" type="number" required placeholder="500000" />
                </div>
                <div className="space-y-2">
                    <Label>Số lượng phòng</Label>
                    <Input name="roomQuantity" type="number" defaultValue="5" required />
                </div>
                
                {/* --- Ô NHẬP QUAN TRỌNG: MAX GUESTS --- */}
                <div className="space-y-2">
                    <Label className="text-red-600 font-bold">Sức chứa tối đa (Người)</Label>
                    <Input 
                        name="maxGuests" 
                        type="number" 
                        defaultValue="2" 
                        min="1" 
                        required 
                        className="border-red-200 focus:border-red-500 bg-red-50/20"
                    />
                    <p className="text-[10px] text-gray-500">Dùng để lọc khi khách tìm kiếm theo số người.</p>
                </div>
                {/* --------------------------------------- */}
            </div>
          </div>

          <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-lg font-bold shadow-md">
            Tạo Khách sạn & Phòng
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}