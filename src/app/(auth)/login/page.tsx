"use client";

import { signIn as signInProvider } from "next-auth/react";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Mail, Lock, MapPin, Hotel } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Email hoặc mật khẩu không đúng!");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("Đã có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden font-sans bg-black">
      
      {/* BACKGROUND VIDEO */}
      <video 
        autoPlay loop muted playsInline 
        className="absolute inset-0 w-full h-full object-cover opacity-50"
      >
        <source src="https://videos.pexels.com/video-files/2169880/2169880-uhd_2560_1440_30fps.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90" />

      {/* NÚT BACK */}
      <Link href="/" className="absolute top-6 left-6 z-30">
        <Button variant="ghost" className="text-white hover:bg-white/20 hover:text-white gap-2 rounded-full border border-white/20 backdrop-blur-sm">
            <ArrowLeft className="h-5 w-5" /> Trở về trang chủ
        </Button>
      </Link>

      {/* FORM CONTAINER */}
      <div className="relative z-20 flex items-center justify-center h-full w-full px-4">
          <Card className="w-full max-w-md bg-black/40 backdrop-blur-xl border-white/10 shadow-2xl text-white">
            <CardHeader className="space-y-2 text-center pb-2 pt-8">
                {/* LOGO   */}
                <div className="flex justify-center mb-4">
                    <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/40 animate-float">
                        <MapPin className="h-8 w-8 text-white absolute -mt-2" />
                        <Hotel className="h-5 w-5 text-indigo-200 absolute mt-3" />
                    </div>
                </div>
                <CardTitle className="text-3xl font-bold tracking-tight text-white">Chào mừng trở lại</CardTitle>
                <CardDescription className="text-gray-300 text-base">
                    Đăng nhập để tiếp tục hành trình của bạn
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 pt-2">
                
                <Button 
                    variant="outline" 
                    className="w-full h-12 bg-white text-gray-900 border-none hover:bg-gray-100 font-bold gap-3 text-base transition-transform hover:scale-[1.02] rounded-xl"
                    onClick={() => signInProvider("google", { callbackUrl: "/dashboard" })}
                >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Tiếp tục bằng Google
                </Button>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/20"></span></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-transparent px-2 text-gray-400">Hoặc bằng Email</span></div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-200 font-medium">Email</Label>
                        <div className="relative group">
                            <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-indigo-400 transition-colors" />
                            <Input 
                                id="email" type="email" placeholder="name@example.com" required 
                                className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 focus:bg-white/10 transition-all rounded-xl"
                                value={email} onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password" className="text-gray-200 font-medium">Mật khẩu</Label>
                            <Link href="#" className="text-xs text-indigo-300 hover:text-indigo-200 hover:underline">Quên mật khẩu?</Link>
                        </div>
                        <div className="relative group">
                            <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-indigo-400 transition-colors" />
                            <Input 
                                id="password" type="password" placeholder="••••••••" required 
                                className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 focus:bg-white/10 transition-all rounded-xl"
                                value={password} onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-200 text-sm text-center font-medium animate-pulse">{error}</div>}

                    <Button 
                        type="submit" 
                        className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-lg shadow-lg hover:shadow-indigo-500/30 transition-all hover:-translate-y-0.5 rounded-xl" 
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Đăng nhập"}
                    </Button>
                </form>
            </CardContent>

            <CardFooter className="justify-center border-t border-white/10 pt-6 pb-8">
                <p className="text-sm text-gray-400">
                    Chưa có tài khoản?{" "}
                    <Link href="/register" className="font-bold text-indigo-400 hover:text-indigo-300 hover:underline transition-colors">
                        Đăng ký ngay
                    </Link>
                </p>
            </CardFooter>
          </Card>
      </div>
    </div>
  );
}