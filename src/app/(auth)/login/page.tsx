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

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      toast.error("Đăng nhập thất bại", {
        description: res.error,
      });
      setLoading(false);
    } else {
      toast.success("Đăng nhập thành công!", {
        description: "Đang chuyển hướng...",
        duration: 2000,
      });
      router.push("/dashboard");
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Đăng nhập</h1>
        <p className="text-muted-foreground">Chào mừng trở lại Lumina Stay.</p>
      </div>

      <div>
        <Button variant="outline" onClick={handleGoogleLogin} className="w-full h-11 gap-2 font-medium border-gray-300 hover:bg-gray-50">
           <Chrome className="h-5 w-5 text-red-500" /> 
           Tiếp tục bằng Google
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-muted-foreground">Hoặc bằng Email</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="name@example.com" required disabled={loading} />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Mật khẩu</Label>
            <Link href="#" className="text-xs font-medium text-indigo-600 hover:underline">
                Quên mật khẩu?
            </Link>
          </div>
          <Input id="password" name="password" type="password" required disabled={loading} />
        </div>
        
        <Button 
            disabled={loading}
            className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.02] transition-all text-base font-bold mt-2"
        >
          {loading ? "Đang xác thực..." : "Đăng nhập"}
        </Button>
      </form>

      <div className="text-center text-sm text-muted-foreground pt-2">
        Chưa có tài khoản?{" "}
        <Link href="/register" className="font-bold text-indigo-600 hover:underline">
          Đăng ký ngay
        </Link>
      </div>
    </div>
  );
}