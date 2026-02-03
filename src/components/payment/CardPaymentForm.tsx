"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Lock, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface CardPaymentFormProps {
  bookingId: string;
  amount: number;
  onSuccess?: () => void;
}

export function CardPaymentForm({ bookingId, amount, onSuccess }: CardPaymentFormProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
    cardType: "VISA"
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Format card number with spaces
    if (name === "cardNumber") {
      const formatted = value.replace(/\s/g, "").replace(/(.{4})/g, "$1 ").trim();
      if (formatted.length <= 19) { // 16 digits + 3 spaces
        setFormData(prev => ({ ...prev, [name]: formatted }));
      }
      return;
    }
    
    // Format expiry date
    if (name === "expiryDate") {
      const formatted = value.replace(/\D/g, "").replace(/(\d{2})(\d)/, "$1/$2");
      if (formatted.length <= 5) {
        setFormData(prev => ({ ...prev, [name]: formatted }));
      }
      return;
    }
    
    // Limit CVV to 3-4 digits
    if (name === "cvv") {
      const digits = value.replace(/\D/g, "");
      if (digits.length <= 4) {
        setFormData(prev => ({ ...prev, [name]: digits }));
      }
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError("");

    try {
      const response = await fetch("/api/payments/card", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId,
          cardType: formData.cardType,
          cardNumber: formData.cardNumber.replace(/\s/g, ""),
          expiryDate: formData.expiryDate,
          cvv: formData.cvv,
          cardholderName: formData.cardholderName,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        if (onSuccess) {
          onSuccess();
        } else {
          // Redirect to booking history after 2 seconds
          setTimeout(() => {
            router.push("/dashboard/history");
          }, 2000);
        }
      } else {
        setError(result.error || "Thanh toán thất bại");
      }
    } catch (error) {
      console.error("Payment error:", error);
      setError("Có lỗi xảy ra khi xử lý thanh toán");
    } finally {
      setIsProcessing(false);
    }
  };

  if (success) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-green-800 mb-2">Thanh toán thành công!</h3>
          <p className="text-green-700 mb-4">
            Đặt phòng của bạn đã được xác nhận. Đang chuyển hướng...
          </p>
          <Button 
            onClick={() => router.push("/dashboard/history")}
            className="bg-green-600 hover:bg-green-700"
          >
            Xem lịch sử đặt phòng
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200">
      <CardHeader className="bg-blue-50">
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <CreditCard className="w-5 h-5" />
          Thanh toán bằng thẻ tín dụng
        </CardTitle>
        <p className="text-sm text-blue-600">
          Thanh toán an toàn và được xác nhận tự động
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Card Number */}
          <div>
            <Label htmlFor="cardNumber">Số thẻ</Label>
            <Input
              id="cardNumber"
              name="cardNumber"
              type="text"
              placeholder="1234 5678 9012 3456"
              value={formData.cardNumber}
              onChange={handleInputChange}
              required
              className="font-mono"
            />
          </div>

          {/* Expiry and CVV */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expiryDate">Ngày hết hạn</Label>
              <Input
                id="expiryDate"
                name="expiryDate"
                type="text"
                placeholder="MM/YY"
                value={formData.expiryDate}
                onChange={handleInputChange}
                required
                className="font-mono"
              />
            </div>
            <div>
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                name="cvv"
                type="text"
                placeholder="123"
                value={formData.cvv}
                onChange={handleInputChange}
                required
                className="font-mono"
              />
            </div>
          </div>

          {/* Cardholder Name */}
          <div>
            <Label htmlFor="cardholderName">Tên chủ thẻ</Label>
            <Input
              id="cardholderName"
              name="cardholderName"
              type="text"
              placeholder="NGUYEN VAN A"
              value={formData.cardholderName}
              onChange={handleInputChange}
              required
              className="uppercase"
            />
          </div>

          {/* Amount Display */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tổng thanh toán:</span>
              <span className="text-2xl font-bold text-blue-600">
                {amount.toLocaleString()}đ
              </span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isProcessing}
            className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg"
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Đang xử lý...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Thanh toán {amount.toLocaleString()}đ
              </div>
            )}
          </Button>

          {/* Security Notice */}
          <div className="text-xs text-gray-500 text-center">
            <Lock className="w-3 h-3 inline mr-1" />
            Thông tin thẻ được mã hóa và bảo mật
          </div>
        </form>
      </CardContent>
    </Card>
  );
}