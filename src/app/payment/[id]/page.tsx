import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ClientSiteHeader } from "@/components/layouts/ClientSiteHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Copy, AlertTriangle, ArrowLeft, QrCode, Clock } from "lucide-react";
import { requestPaymentConfirmation } from "@/lib/actions";
import Link from "next/link";

// --- CẤU HÌNH TÀI KHOẢN NGÂN HÀNG CỦA BOSS TẠI ĐÂY ---
const BANK_ID = "MB"; // Ngân hàng MBBank (hoặc VCB, TCB, ACB...)
const ACCOUNT_NO = "0987654321"; // Số tài khoản của Boss
const ACCOUNT_NAME = "NGUYEN VAN BOSS"; // Tên chủ tài khoản
// -----------------------------------------------------

// FIX LỖI 1: Định nghĩa kiểu Props cho Next.js 15
interface PaymentPageProps {
  params: Promise<{ id: string }>;
}

export default async function PaymentPage(props: PaymentPageProps) {
  const session = await auth();
  if (!session) redirect("/login");

  // FIX LỖI 2: Phải await params trước khi dùng
  const params = await props.params; 
  const { id } = params; // Lấy ID từ params đã await

  const booking = await prisma.booking.findUnique({
    where: { id: id }, // Giờ id đã có giá trị string chuẩn
    include: { hotel: true, room: true }
  });

  if (!booking) return <div className="p-10 text-center">Không tìm thấy đơn hàng (ID: {id})</div>;
  if (booking.status === 'CONFIRMED') redirect("/dashboard/history");

  // Tạo nội dung chuyển khoản: "Booking [Mã đơn]"
  const transferContent = `BOOKING ${booking.id.slice(-6).toUpperCase()}`;
  
  // Link tạo QR tự động của VietQR
  const qrUrl = `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-print.png?amount=${booking.totalPrice}&addInfo=${transferContent}&accountName=${encodeURIComponent(ACCOUNT_NAME)}`;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <ClientSiteHeader session={session as any} className="bg-white sticky top-0 border-b z-40" />

      <main className="container mx-auto max-w-4xl px-4 py-8">
        
        {/* Nút quay lại */}
        <Link href="/" className="inline-flex items-center text-gray-500 hover:text-indigo-600 mb-6 font-medium">
            <ArrowLeft className="w-4 h-4 mr-2"/> Quay lại trang chủ
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* CỘT TRÁI: THÔNG TIN MÃ QR */}
            <Card className="border-indigo-100 shadow-lg overflow-hidden">
                <div className="bg-indigo-600 p-4 text-center">
                    <h2 className="text-white font-bold text-lg flex items-center justify-center gap-2">
                        <QrCode className="w-5 h-5"/> Quét mã để thanh toán
                    </h2>
                    <p className="text-indigo-100 text-sm">Sử dụng App ngân hàng hoặc Ví điện tử</p>
                </div>
                <CardContent className="p-6 flex flex-col items-center">
                    
                    {/* HÌNH ẢNH QR CODE */}
                    <div className="border-4 border-gray-900 rounded-xl overflow-hidden mb-6 shadow-xl">
                        <img src={qrUrl} alt="Mã VietQR" className="w-64 h-auto" />
                    </div>

                    <div className="w-full bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                            <div className="text-sm text-yellow-800">
                                <p className="font-bold">Lưu ý quan trọng:</p>
                                <p>Vui lòng giữ nguyên nội dung chuyển khoản để hệ thống tự động xác nhận.</p>
                            </div>
                        </div>
                    </div>

                    <div className="w-full space-y-4">
                        <div className="flex justify-between items-center text-sm border-b pb-2">
                            <span className="text-gray-500">Ngân hàng</span>
                            <span className="font-bold">{BANK_ID} Bank</span>
                        </div>
                        <div className="flex justify-between items-center text-sm border-b pb-2">
                            <span className="text-gray-500">Chủ tài khoản</span>
                            <span className="font-bold uppercase">{ACCOUNT_NAME}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm border-b pb-2">
                            <span className="text-gray-500">Số tài khoản</span>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-lg tracking-wider">{ACCOUNT_NO}</span>
                                <Copy className="w-3 h-3 text-gray-400 cursor-pointer"/>
                            </div>
                        </div>
                        <div className="flex justify-between items-center text-sm border-b pb-2">
                            <span className="text-gray-500">Số tiền</span>
                            <span className="font-black text-xl text-indigo-600">{booking.totalPrice.toLocaleString()}đ</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">Nội dung</span>
                            <span className="font-bold text-red-600 bg-red-50 px-2 py-1 rounded">{transferContent}</span>
                        </div>
                    </div>

                </CardContent>
            </Card>

            {/* CỘT PHẢI: THÔNG TIN ĐƠN HÀNG & NÚT XÁC NHẬN */}
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Thông tin đặt phòng</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-4">
                            <img src={booking.hotel.images[0]} className="w-20 h-20 rounded-lg object-cover" />
                            <div>
                                <h3 className="font-bold text-gray-900">{booking.hotel.name}</h3>
                                <p className="text-sm text-gray-500">{booking.room.name}</p>
                                <div className="mt-1">
                                    <Badge variant="secondary">{booking.status}</Badge>
                                </div>
                            </div>
                        </div>
                        <div className="border-t pt-4 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Khách hàng</span>
                                <span className="font-medium">{booking.guestName || session.user?.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Nhận phòng</span>
                                <span className="font-medium">{new Date(booking.checkIn).toLocaleDateString('vi-VN')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Trả phòng</span>
                                <span className="font-medium">{new Date(booking.checkOut).toLocaleDateString('vi-VN')}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
                    <h3 className="font-bold text-gray-900">Xác nhận thanh toán</h3>
                    <p className="text-sm text-gray-500">
                        Sau khi chuyển khoản, hệ thống sẽ kiểm tra và xác nhận trước khi thông báo cho bạn.
                    </p>

                    {booking.status === "PENDING_PAYMENT" ? (
                        <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                            <Clock className="w-4 h-4" />
                            Đang chờ hệ thống xác nhận thanh toán.
                        </div>
                    ) : (
                        <form action={requestPaymentConfirmation.bind(null, booking.id)}>
                            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg shadow-green-200 shadow-lg cursor-pointer">
                                <CheckCircle2 className="w-5 h-5 mr-2"/> Gửi yêu cầu xác nhận
                            </Button>
                        </form>
                    )}

                    <p className="text-xs text-center text-gray-400 mt-2">
                        Nếu có vấn đề, vui lòng liên hệ hotline: 1900 1234
                    </p>
                </div>
            </div>

        </div>
      </main>
    </div>
  );
}