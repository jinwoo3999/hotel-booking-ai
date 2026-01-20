"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import { Chrome } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleGoogleRegister = () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const firstName = formData.get("firstName");
    const lastName = formData.get("lastName");
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error("Đăng ký thất bại", {
            description: data.message || "Vui lòng kiểm tra lại thông tin.",
        });
        setLoading(false);
        return;
      }

      toast.success("Đăng ký thành công!", {
        description: "Chào mừng bạn gia nhập Lumina Stay 🎉",
        duration: 3000, 
      });
      
      setTimeout(() => {
          router.push("/login");
      }, 1500);

    } catch {
      toast.error("Lỗi hệ thống", { description: "Không thể kết nối máy chủ." });
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Tạo tài khoản</h1>
        <p className="text-muted-foreground">Điền thông tin để nhận gói quà chào mừng.</p>
      </div>

      <div>
        <Button 
            variant="outline" 
            onClick={handleGoogleRegister} 
            className="w-full h-11 gap-2 font-medium border-gray-300 hover:bg-gray-50"
        >
           <Chrome className="h-5 w-5 text-red-500" /> 
           Đăng ký nhanh bằng Google
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-muted-foreground">Hoặc điền form</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="firstName">Họ</Label>
                <Input id="firstName" name="firstName" placeholder="Nguyễn" required disabled={loading} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="lastName">Tên</Label>
                <Input id="lastName" name="lastName" placeholder="Văn A" required disabled={loading} />
            </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="name@example.com" required disabled={loading} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Mật khẩu</Label>
          <Input id="password" name="password" type="password" required disabled={loading} />
        </div>
        
        <Button 
            disabled={loading}
            className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.02] transition-all text-base font-bold shadow-lg shadow-indigo-100 mt-2"
        >
          {loading ? "Đang xử lý..." : "Đăng ký & Nhận quà"}
        </Button>
      </form>

      <div className="text-center text-sm text-muted-foreground pt-2">
        Đã có tài khoản?{" "}
        <Link href="/login" className="font-bold text-indigo-600 hover:underline">
          Đăng nhập ngay
        </Link>
      </div>
    </div>
  );
}