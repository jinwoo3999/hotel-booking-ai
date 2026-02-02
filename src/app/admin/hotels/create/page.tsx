import { createHotel } from "@/lib/actions"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateHotelPage() {
  return (
    <div className="max-w-2xl mx-auto">
      {/* Header Form */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/hotels">
          <Button variant="outline" size="icon" className="rounded-full">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
           <h1 className="text-2xl font-bold text-gray-900">Thêm Khách sạn mới</h1>
           <p className="text-gray-500 text-sm">Điền thông tin để đăng bán khách sạn</p>
        </div>
      </div>

      {/* Form nhập liệu (Dùng Server Action trực tiếp vào form) */}
      <form action={createHotel} className="space-y-6 bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
        
        <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2 col-span-2">
                <Label className="font-bold">Tên khách sạn <span className="text-red-500">*</span></Label>
                <Input name="name" placeholder="Ví dụ: Lumina Đà Lạt Resort" required className="h-12 text-lg" />
            </div>

            <div className="space-y-2">
                <Label className="font-bold">Thành phố</Label>
                <Input name="city" placeholder="Hà Nội, Đà Nẵng..." required />
            </div>

            <div className="space-y-2">
                <Label className="font-bold">Giá khởi điểm (VNĐ)</Label>
                <Input name="price" type="number" placeholder="2000000" required />
            </div>

            <div className="space-y-2 col-span-2">
                <Label className="font-bold">Địa chỉ chi tiết</Label>
                <Input name="address" placeholder="123 Đường ABC, Phường XYZ..." required />
            </div>

            <div className="space-y-2 col-span-2">
                <Label className="font-bold">Mô tả ngắn</Label>
                <Textarea name="description" placeholder="Giới thiệu về khách sạn..." className="h-32" />
            </div>

             <div className="space-y-2 col-span-2">
                <Label className="font-bold">Link Ảnh Bìa (URL)</Label>
                <Input name="imageUrl" placeholder="https://..." />
                <p className="text-xs text-gray-400"></p>
            </div>
        </div>

        <div className="pt-4 border-t flex justify-end gap-3">
             <Link href="/admin/hotels">
                <Button variant="ghost" type="button">Hủy bỏ</Button>
             </Link>
             <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 font-bold px-8">
                <Save className="h-4 w-4 mr-2" /> Lưu Khách Sạn
             </Button>
        </div>

      </form>
    </div>
  );
}