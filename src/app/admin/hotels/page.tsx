import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, MapPin, Hotel, Star, Settings } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { createHotel } from "@/lib/actions";

export default async function AdminHotelsPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") redirect("/");

  const hotels = await prisma.hotel.findMany({
    where: { ownerId: session.user.id },
    include: { rooms: true }, // Đảm bảo đã include rooms
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="pb-20">
      <main className="container mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Quản lý Khách sạn</h1>
                <p className="text-gray-500">Danh sách các khách sạn bạn đang kinh doanh</p>
            </div>
            
            <Dialog>
                <DialogTrigger asChild>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-lg">
                        <Plus className="w-5 h-5 mr-2"/> Thêm Khách sạn mới
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Đăng ký Khách sạn mới</DialogTitle>
                    </DialogHeader>
                    <form action={createHotel} className="space-y-4 mt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Tên khách sạn</Label>
                                <Input name="name" placeholder="VD: Lumina Đà Lạt" required />
                            </div>
                            <div className="space-y-2">
                                <Label>Thành phố</Label>
                                <Input name="city" placeholder="VD: Đà Lạt" required />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Địa chỉ chi tiết</Label>
                            <Input name="address" placeholder="Số 10, đường..." required />
                        </div>
                        <div className="space-y-2">
                            <Label>Link Ảnh bìa (URL)</Label>
                            <Input name="imageUrl" placeholder="https://..." />
                        </div>
                         <div className="space-y-2">
                            <Label>Mô tả ngắn</Label>
                            <Textarea name="description" placeholder="Giới thiệu về khách sạn..." />
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg border space-y-3">
                            <h4 className="font-bold text-sm text-gray-700">Cấu hình phòng mặc định</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-xs">Giá 1 đêm</Label>
                                    <Input name="roomPrice" type="number" placeholder="500000" />
                                </div>
                                <div>
                                    <Label className="text-xs">Số lượng</Label>
                                    <Input name="roomQuantity" type="number" defaultValue={5} />
                                </div>
                            </div>
                        </div>

                        <Button type="submit" className="w-full bg-indigo-600 font-bold">Hoàn tất & Tạo</Button>
                    </form>
                </DialogContent>
            </Dialog>
        </div>

        {hotels && hotels.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hotels.map((hotel) => (
                    <div key={hotel.id} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-all flex flex-col group">
                        <div className="relative h-48 overflow-hidden">
                            {/* Thêm fallback ảnh nếu không có */}
                            <img 
                                src={hotel.images?.[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945"} 
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                            />
                            <div className="absolute top-2 right-2 flex gap-1">
                                <Badge className={hotel.status === 'ACTIVE' ? "bg-green-500" : "bg-gray-500"}>
                                    {hotel.status}
                                </Badge>
                            </div>
                        </div>
                        
                        <div className="p-5 flex-1 flex flex-col">
                            <h3 className="font-bold text-xl text-gray-900 mb-1 line-clamp-1">{hotel.name}</h3>
                            <div className="flex items-center gap-1 text-gray-500 text-sm mb-4">
                                <MapPin className="w-4 h-4" /> {hotel.city}
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-6 flex-1 bg-gray-50 p-3 rounded-lg">
                                <span className="flex items-center gap-1 font-medium">
                                    {/* FIX LỖI Ở ĐÂY: Thêm dấu ? để tránh lỗi undefined */}
                                    <Hotel className="w-4 h-4 text-indigo-500"/> {hotel.rooms?.length || 0} loại phòng
                                </span>
                                 <span className="flex items-center gap-1 font-medium">
                                    <Star className="w-4 h-4 text-yellow-500"/> {hotel.rating}
                                </span>
                            </div>

                            <Link href={`/admin/hotels/${hotel.id}`} className="mt-auto">
                                <Button className="w-full bg-white border-2 border-indigo-600 text-indigo-700 hover:bg-indigo-50 font-bold h-10">
                                    <Settings className="w-4 h-4 mr-2"/> Quản lý & Sửa Phòng
                                </Button>
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed">
                <Hotel className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900">Bạn chưa có khách sạn nào</h3>
                <p className="text-gray-500 mb-6">Hãy bắt đầu kinh doanh bằng cách thêm khách sạn đầu tiên.</p>
            </div>
        )}
      </main>
    </div>
  );
}