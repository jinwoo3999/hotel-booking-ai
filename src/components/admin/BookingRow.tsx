"use client";

import { updateBookingStatus } from "@/lib/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useState } from "react";

type BookingRowBooking = {
  id: string;
  guestName?: string | null;
  guestPhone?: string | null;
  room?: { name?: string | null } | null;
  checkIn: string | Date;
  checkOut: string | Date;
  totalPrice: number;
  status: string;
};

export default function BookingRow({ booking }: { booking: BookingRowBooking }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async (status: string) => {
    setIsLoading(true);
    await updateBookingStatus(booking.id, status);
    setIsLoading(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED": return <Badge className="bg-green-600 hover:bg-green-600">Đã xác nhận</Badge>;
      case "PENDING": return <Badge className="bg-yellow-500 hover:bg-yellow-500">Chờ duyệt</Badge>;
      case "CANCELLED": return <Badge className="bg-red-600 hover:bg-red-600">Đã hủy</Badge>;
      default: return <Badge className="bg-gray-500">{status}</Badge>;
    }
  };

  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="p-4 font-medium">{booking.guestName}<br/><span className="text-xs text-gray-500">{booking.guestPhone}</span></td>
      <td className="p-4 text-sm text-gray-600">{booking.room?.name}</td>
      <td className="p-4 text-sm">
        {new Date(booking.checkIn).toLocaleDateString("vi-VN")} <br/> 
        {new Date(booking.checkOut).toLocaleDateString("vi-VN")}
      </td>
      <td className="p-4 font-bold text-indigo-600">
        {booking.totalPrice.toLocaleString()}đ
      </td>
      <td className="p-4">{getStatusBadge(booking.status)}</td>
      <td className="p-4 flex gap-2">
        {booking.status === "PENDING" && (
            <>
                <Button size="sm" className="bg-green-600 hover:bg-green-700 h-8 w-8 p-0" onClick={() => handleUpdate("CONFIRMED")} disabled={isLoading}>
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : <CheckCircle className="w-4 h-4"/>}
                </Button>
                <Button size="sm" variant="destructive" className="h-8 w-8 p-0" onClick={() => handleUpdate("CANCELLED")} disabled={isLoading}>
                     {isLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : <XCircle className="w-4 h-4"/>}
                </Button>
            </>
        )}
        {booking.status === "CONFIRMED" && (
             <Button size="sm" variant="outline" className="text-red-600 border-red-200 h-8" onClick={() => handleUpdate("CANCELLED")} disabled={isLoading}>
                Hủy
            </Button>
        )}
      </td>
    </tr>
  );
}