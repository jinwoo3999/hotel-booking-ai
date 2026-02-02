import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        
        <h1 className="text-2xl font-black text-gray-900 mb-2">Thanh toán thành công!</h1>
        <p className="text-gray-500 mb-8">
            Cảm ơn bạn đã sử dụng dịch vụ. Phòng của bạn đã được xác nhận và giữ chỗ.
        </p>
        
        <div className="space-y-3">
            <Link href="/dashboard/history">
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 font-bold h-12 rounded-xl">
                    Xem vé điện tử
                </Button>
            </Link>
            <Link href="/">
                <Button variant="ghost" className="w-full font-bold text-gray-600">
                    Về trang chủ
                </Button>
            </Link>
        </div>
      </div>
    </div>
  );
}