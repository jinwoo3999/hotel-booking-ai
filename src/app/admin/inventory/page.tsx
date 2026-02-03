import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Package, AlertTriangle, CheckCircle } from "lucide-react";
import { seedRoomInventory } from "@/lib/actions";

export default async function AdminInventoryPage() {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    redirect("/login");
  }

  // Get rooms and their inventory status
  const rooms = await prisma.room.findMany({
    include: {
      hotel: { select: { name: true, city: true } },
      inventories: {
        where: {
          date: { gte: new Date() }
        },
        take: 5,
        orderBy: { date: 'asc' }
      }
    },
    orderBy: { hotel: { name: 'asc' } }
  });

  // Get inventory statistics
  const totalRooms = rooms.length;
  const roomsWithInventory = rooms.filter(room => room.inventories.length > 0).length;
  const roomsWithoutInventory = totalRooms - roomsWithInventory;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Inventory Phòng</h1>
        <form action={seedRoomInventory}>
          <input type="hidden" name="daysAhead" value="365" />
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            <Package className="w-4 h-4 mr-2" />
            Tạo Inventory (365 ngày)
          </Button>
        </form>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Tổng số phòng</p>
                <p className="text-2xl font-bold text-gray-900">{totalRooms}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Có inventory</p>
                <p className="text-2xl font-bold text-green-600">{roomsWithInventory}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Chưa có inventory</p>
                <p className="text-2xl font-bold text-red-600">{roomsWithoutInventory}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rooms List */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách phòng và tình trạng inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Khách sạn</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Phòng</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-500">Số lượng</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-500">Inventory</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-500">Ngày gần nhất</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rooms.map((room) => (
                  <tr key={room.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{room.hotel.name}</p>
                        <p className="text-xs text-gray-500">{room.hotel.city}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{room.name}</p>
                      <p className="text-xs text-gray-500">{room.price.toLocaleString()}đ/đêm</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant="outline">{room.quantity} phòng</Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {room.inventories.length > 0 ? (
                        <Badge className="bg-green-100 text-green-700">
                          Có ({room.inventories.length} ngày)
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-700">
                          Chưa có
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-gray-500">
                      {room.inventories.length > 0 ? (
                        new Date(room.inventories[0].date).toLocaleDateString('vi-VN')
                      ) : (
                        "N/A"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <h3 className="font-bold text-blue-800 mb-2">Hướng dẫn sử dụng</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Inventory được tạo tự động khi có booking mới</li>
            <li>• Nút "Tạo Inventory" sẽ tạo inventory cho 365 ngày tới cho tất cả phòng</li>
            <li>• Inventory giúp kiểm soát số lượng phòng và tránh overbooking</li>
            <li>• Mỗi phòng có thể có số lượng khác nhau mỗi ngày</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}