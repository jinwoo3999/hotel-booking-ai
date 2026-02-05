"use client";

import { useState } from "react";
import { createRoom, updateRoom, deleteRoom } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil, Trash2, Plus } from "lucide-react";
import type { Room } from "@prisma/client";

export default function RoomManager({ hotelId, rooms }: { hotelId: string; rooms: Room[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  const handleCreate = () => {
    setEditingRoom(null);
    setIsOpen(true);
  }

  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setIsOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
            <h3 className="text-xl font-bold text-gray-800">Danh sách Phòng</h3>
            <p className="text-sm text-gray-500">Quản lý các loại phòng của khách sạn này.</p>
        </div>
        <Button onClick={handleCreate} className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-4 h-4 mr-2"/> Thêm Phòng Mới
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rooms.map((room) => (
                <Card key={room.id} className="relative group overflow-hidden border-indigo-50 shadow-sm hover:shadow-md">
                    <CardContent className="p-4 flex gap-4">
                        <img src={room.images[0]} className="w-20 h-20 rounded-md object-cover bg-gray-100" />
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <h4 className="font-bold text-gray-900">{room.name}</h4>
                                <div className="flex gap-1">
                                    <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => handleEdit(room)}>
                                        <Pencil className="w-3 h-3"/>
                                    </Button>
                                    <Button size="icon" variant="outline" className="h-7 w-7 text-red-600 hover:bg-red-50" onClick={async () => await deleteRoom(room.id, hotelId)}>
                                        <Trash2 className="w-3 h-3"/>
                                    </Button>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 line-clamp-1 mt-1">{room.description}</p>
                            <div className="flex gap-2 mt-2">
                                <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded font-bold">
                                    {room.price.toLocaleString()}đ
                                </span>
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                    Kho: {room.quantity}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
      </div>

      {/* FORM MODAL */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg bg-white">
            <DialogHeader>
                <DialogTitle>{editingRoom ? "Sửa thông tin phòng" : "Thêm phòng mới"}</DialogTitle>
            </DialogHeader>
            
            <form action={async (formData) => {
                if (editingRoom) await updateRoom(formData);
                else await createRoom(formData);
                setIsOpen(false);
            }} className="space-y-4 mt-2">
                
                <input type="hidden" name="hotelId" value={hotelId} />
                {editingRoom && <input type="hidden" name="roomId" value={editingRoom.id} />}

                <div className="space-y-2">
                    <Label>Tên loại phòng</Label>
                    <Input name="name" defaultValue={editingRoom?.name} placeholder="VD: Phòng Deluxe" required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Giá 1 đêm (VNĐ)</Label>
                        <Input name="price" type="number" defaultValue={editingRoom?.price} required />
                    </div>
                    <div className="space-y-2">
                        <Label>Số lượng phòng</Label>
                        <Input name="quantity" type="number" defaultValue={editingRoom?.quantity || 5} required />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Sức chứa (Người)</Label>
                    <Input name="maxGuests" type="number" defaultValue={editingRoom?.maxGuests || 2} required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>View phòng</Label>
                        <Input name="viewType" defaultValue="" placeholder="VD: View biển, View núi" />
                    </div>
                    <div className="space-y-2">
                        <Label>Tầng</Label>
                        <Input name="floor" type="number" defaultValue="" placeholder="VD: 12" />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Loại giường</Label>
                    <Input name="bedType" defaultValue="" placeholder="VD: King, Queen, Twin" />
                </div>
                
                <div className="space-y-2">
                    <Label>Link Ảnh (mỗi link 1 dòng)</Label>
                    <Textarea 
                        name="imageUrl" 
                        defaultValue={editingRoom?.images?.join('\n')} 
                        placeholder="https://image1.jpg&#10;https://image2.jpg&#10;https://image3.jpg"
                        rows={4}
                        className="font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500">Nhập mỗi link ảnh trên một dòng. Ảnh đầu tiên sẽ là ảnh chính.</p>
                </div>

                <div className="space-y-2">
                    <Label>Tiện ích (cách nhau bằng dấu phẩy)</Label>
                    <Input
                      name="amenities"
                      defaultValue={editingRoom?.amenities?.join(", ") || ""}
                      placeholder="VD: Wifi, Điều hòa, Ban công"
                    />
                </div>

                <div className="space-y-2">
                    <Label>Mô tả</Label>
                    <Textarea name="description" defaultValue={editingRoom?.description} placeholder="Mô tả tiện ích..." />
                </div>

                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">Lưu thông tin</Button>
            </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}