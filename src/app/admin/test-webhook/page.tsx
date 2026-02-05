"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Webhook, CheckCircle, XCircle } from "lucide-react";

export default function TestWebhookPage() {
  const [bookingCode, setBookingCode] = useState("");
  const [amount, setAmount] = useState("");
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleTest = async () => {
    if (!bookingCode) {
      toast.error("Vui lòng nhập mã booking");
      return;
    }

    setTesting(true);
    setResult(null);

    try {
      const response = await fetch("/api/admin/test-payment-webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingCode: bookingCode.toUpperCase(),
          amount: amount ? parseInt(amount) : undefined
        })
      });

      const data = await response.json();
      setResult(data);

      if (data.success && data.webhookResponse?.success) {
        toast.success("✅ Webhook test thành công! Booking đã được confirm.");
      } else {
        toast.error(data.webhookResponse?.message || "Test thất bại");
      }
    } catch (error) {
      console.error("Test error:", error);
      toast.error("Có lỗi xảy ra khi test webhook");
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Webhook className="w-8 h-8 text-indigo-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Test Payment Webhook</h1>
          <p className="text-sm text-gray-500">Mô phỏng thanh toán QR tự động</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Test */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="bookingCode">Mã Booking (6 ký tự cuối)</Label>
              <Input
                id="bookingCode"
                value={bookingCode}
                onChange={(e) => setBookingCode(e.target.value.toUpperCase())}
                placeholder="VD: ABC123"
                maxLength={6}
                className="font-mono"
              />
              <p className="text-xs text-gray-500 mt-1">
                Nhập 6 ký tự cuối của booking ID
              </p>
            </div>

            <div>
              <Label htmlFor="amount">Số tiền (tùy chọn)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Tự động lấy từ booking"
              />
              <p className="text-xs text-green-600 mt-1">
                ✓ Để trống để hệ thống tự động lấy số tiền chính xác từ booking
              </p>
            </div>

            <Button
              onClick={handleTest}
              disabled={testing || !bookingCode}
              className="w-full"
            >
              {testing ? "Đang test..." : "Test Webhook"}
            </Button>
          </CardContent>
        </Card>

        {/* Kết quả */}
        <Card>
          <CardHeader>
            <CardTitle>Kết quả</CardTitle>
          </CardHeader>
          <CardContent>
            {!result ? (
              <div className="text-center py-8 text-gray-400">
                <Webhook className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Chưa có kết quả test</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className={`flex items-center gap-2 p-3 rounded-lg ${
                  result.webhookResponse?.success 
                    ? "bg-green-50 text-green-700" 
                    : "bg-red-50 text-red-700"
                }`}>
                  {result.webhookResponse?.success ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <XCircle className="w-5 h-5" />
                  )}
                  <span className="font-medium">
                    {result.webhookResponse?.message || "Unknown status"}
                  </span>
                </div>

                {result.webhookResponse?.data && (
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Booking ID:</span>
                      <span className="font-mono font-bold">
                        {result.webhookResponse.data.bookingId}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Số tiền:</span>
                      <span className="font-bold">
                        {result.webhookResponse.data.amount?.toLocaleString()}đ
                      </span>
                    </div>
                    {result.webhookResponse.data.pointsEarned > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Điểm thưởng:</span>
                        <span className="font-bold text-indigo-600">
                          +{result.webhookResponse.data.pointsEarned} điểm
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <details className="text-xs">
                  <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
                    Xem raw response
                  </summary>
                  <pre className="mt-2 bg-gray-900 text-green-400 p-3 rounded overflow-auto">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Hướng dẫn */}
      <Card className="border-indigo-200 bg-indigo-50">
        <CardHeader>
          <CardTitle className="text-indigo-900">Hướng dẫn sử dụng</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-indigo-800">
          <div>
            <strong>1. Tìm mã booking:</strong>
            <p>Vào trang Admin Bookings, copy 6 ký tự cuối của booking ID (VD: #ABC123)</p>
          </div>
          <div>
            <strong>2. Test webhook:</strong>
            <p>Nhập mã vào form trên và bấm "Test Webhook"</p>
          </div>
          <div>
            <strong>3. Kiểm tra kết quả:</strong>
            <p>Nếu thành công, booking sẽ tự động chuyển sang trạng thái CONFIRMED</p>
          </div>
          <div className="border-t border-indigo-200 pt-3 mt-3">
            <strong>Webhook URL cho production:</strong>
            <code className="block bg-white px-3 py-2 rounded mt-2 text-xs">
              https://yourdomain.com/api/webhooks/payment
            </code>
            <p className="mt-2 text-xs">
              Cấu hình URL này trong Casso.vn hoặc VietQR để nhận thông báo tự động
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
