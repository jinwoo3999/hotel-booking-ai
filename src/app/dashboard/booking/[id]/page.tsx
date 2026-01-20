"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Users, Star, MapPin, ArrowLeft, Check, Calendar as CalendarIcon, QrCode } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
// Đảm bảo đã chạy: npx shadcn-ui@latest add dialog
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export default function RoomDetailPage() {
  const params = useParams(); // Client component dùng useParams là chuẩn
  const router = useRouter();
  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    const fetchRoom = async () => {
        try {
          if (!params || !params.id) return;
          const res = await fetch(`/api/rooms/${params.id}`);
          if (!res.ok) throw new Error("Lỗi tải phòng");
          const data = await res.json();
          setRoom(data);
        } catch (error) {
          console.error(error);
          toast.error("Không thể tải thông tin phòng");
        } finally {
          setLoading(false);
        }
      };
      fetchRoom();
  }, [params]);

  const calculateTotal = () => {
    if (!checkIn || !checkOut || !room) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = end.getTime() - start.getTime();
    
    if (diffTime < 0) return 0;
    if (diffTime === 0) return room.pricePerNight; // Day use

    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays * room.pricePerNight;
  };

  const totalAmount = calculateTotal();

  const onPreBooking = () => {
    if (!checkIn || !checkOut) {
      toast.error("Vui lòng chọn ngày nhận và trả phòng");
      return;
    }
    if (totalAmount <= 0 && checkIn !== checkOut) {
        toast.error("Ngày trả phòng không hợp lệ");
        return;
    }
    setShowPayment(true);
  }

  const handleConfirmPayment = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: room?.id,
          checkIn,
          checkOut,
          totalPrice: totalAmount,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Lỗi server");

      setShowPayment(false);
      toast.success("Thanh toán thành công! +Điểm tích lũy 🎉");
      router.push("/dashboard/history"); 

    } catch (error: any) {
      toast.error("Đặt phòng thất bại: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Đang tải...</div>;
  if (!room) return <div className="p-10 text-center">Không tìm thấy phòng.</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <Link href="/dashboard/booking" className="flex items-center text-muted-foreground hover:text-indigo-600 mb-6 w-fit"><ArrowLeft className="mr-2 h-4 w-4" /> Quay lại</Link>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* INFO */}
        <div className="lg:col-span-2 space-y-6">
             <div className="relative aspect-video rounded-2xl overflow-hidden shadow-lg bg-gray-100">
                {room.images?.[0] && <Image src={room.images[0]} alt={room.name} fill className="object-cover" priority />}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm font-bold shadow-sm flex items-center gap-1"><Star className="h-4 w-4 text-yellow-500 fill-yellow-500" /> 4.8</div>
             </div>
             <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{room.name}</h1>
                    <div className="flex items-center text-muted-foreground mt-2 text-sm">
                        <MapPin className="h-4 w-4 mr-1" /> Đà Nẵng, Việt Nam <span className="mx-2">•</span> <Users className="h-4 w-4 mr-1" /> {room.capacity} Khách
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-bold text-indigo-600">{new Intl.NumberFormat('vi-VN').format(room.pricePerNight)} đ</p><p className="text-sm text-gray-500">/ đêm</p>
                </div>
             </div>
             <hr />
             <div className="space-y-4">
                <h3 className="text-xl font-bold">Tiện nghi</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {room.amenities?.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border"><Check className="h-4 w-4 text-green-600" /><span className="text-sm font-medium text-gray-700">{item}</span></div>
                    ))}
                </div>
             </div>
             <div className="space-y-2"><h3 className="text-xl font-bold">Mô tả</h3><p className="text-gray-600 leading-relaxed">{room.description}</p></div>
        </div>

        {/* FORM */}
        <div className="lg:col-span-1">
            <div className="p-6 sticky top-24 shadow-xl border border-indigo-100 rounded-xl bg-white">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-indigo-600" /> Đặt phòng ngay
                </h3>
                <div className="space-y-4">
                    <div className="space-y-2"><Label>Ngày nhận</Label><Input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Ngày trả</Label><Input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
                        {checkIn && checkOut && checkIn === checkOut && (<p className="text-xs text-orange-600 font-medium mt-1">*Trong ngày (Day Use)</p>)}
                    </div>
                    {totalAmount > 0 && (
                        <div className="bg-indigo-50 p-4 rounded-lg space-y-2 border border-indigo-100">
                            <div className="flex justify-between text-sm"><span>Thời gian:</span><span>{checkIn === checkOut ? "Trong ngày" : `${totalAmount / room.pricePerNight} đêm`}</span></div>
                            <div className="border-t border-indigo-200 my-2 pt-2 flex justify-between font-bold text-indigo-700 text-lg"><span>Tổng cộng:</span><span>{new Intl.NumberFormat('vi-VN').format(totalAmount)} đ</span></div>
                        </div>
                    )}
                    <Button onClick={onPreBooking} className="w-full h-12 text-lg font-bold bg-indigo-600 hover:bg-indigo-700">Thanh toán ngay</Button>
                </div>
            </div>
        </div>
      </div>

      {/* DIALOG QR */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle className="text-center flex flex-col items-center gap-2"><QrCode className="h-10 w-10 text-indigo-600"/>Quét mã để thanh toán</DialogTitle>
                <DialogDescription className="text-center">Vui lòng chuyển khoản <b>{new Intl.NumberFormat('vi-VN').format(totalAmount)} đ</b></DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center py-4 space-y-4">
                <div className="relative w-64 h-64 border-2 border-indigo-600 rounded-lg overflow-hidden p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`https://img.vietqr.io/image/MB-033333333-compact2.jpg?amount=${totalAmount}&addInfo=DATPHONG ${room.name}&accountName=Lumina Stay`} alt="VietQR" className="w-full h-full object-contain"/>
                </div>
            </div>
            <DialogFooter className="sm:justify-center gap-2">
                <Button variant="outline" onClick={() => setShowPayment(false)}>Đóng</Button>
                <Button className="bg-green-600 hover:bg-green-700 w-full sm:w-auto" onClick={handleConfirmPayment} disabled={isProcessing}>{isProcessing ? "Đang xác thực..." : "Tôi đã chuyển khoản"}</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}