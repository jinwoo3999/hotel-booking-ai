"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { Loader2, Save, User, Lock, Upload } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { data: session, update } = useSession(); 
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  
  // State cho thông tin cá nhân
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    image: "",
  });

  // State cho mật khẩu
  const [passData, setPassData] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  // Load dữ liệu khi vào trang
  useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name || "",
        email: session.user.email || "",
        image: session.user.image || "",
        phone: "", // Nếu sau này User có field phone thì gán vào đây: session.user.phone
        address: "", // Tương tự với address
      });
    }
  }, [session]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Xử lý upload ảnh (Base64)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Ảnh quá lớn! Vui lòng chọn ảnh dưới 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Xử lý lưu thông tin cá nhân
  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Lỗi cập nhật");

      await update({
        ...session,
        user: {
          ...session?.user,
          name: formData.name,
          image: formData.image,
        },
      });

      toast.success("Cập nhật hồ sơ thành công!");
      router.refresh(); 

    } catch (_) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý đổi mật khẩu
  const handleSubmitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passData.new !== passData.confirm) {
        toast.error("Mật khẩu xác nhận không khớp!");
        return;
    }

    if (passData.new.length < 6) {
        toast.error("Mật khẩu mới phải có ít nhất 6 ký tự!");
        return;
    }

    setLoading(true);

    try {
        const res = await fetch("/api/user/password", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                currentPassword: passData.current, 
                newPassword: passData.new 
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Đổi mật khẩu thất bại");
        }

        toast.success("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
        setPassData({ current: "", new: "", confirm: "" }); // Reset form

    } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Đổi mật khẩu thất bại");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Cài đặt tài khoản</h1>
        <p className="text-muted-foreground">Quản lý thông tin cá nhân và bảo mật.</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-100">
          <TabsTrigger value="general" className="gap-2"><User className="h-4 w-4"/> Thông tin chung</TabsTrigger>
          <TabsTrigger value="security" className="gap-2"><Lock className="h-4 w-4"/> Bảo mật</TabsTrigger>
        </TabsList>

        {/* TAB 1: THÔNG TIN CHUNG */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Hồ sơ cá nhân</CardTitle>
              <CardDescription>Thông tin này sẽ được hiển thị trên hồ sơ công khai của bạn.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmitProfile}>
                <CardContent className="space-y-6">
                    {/* Upload Ảnh */}
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <Avatar className="h-24 w-24 border-4 border-white shadow-lg cursor-pointer hover:opacity-90 transition-opacity" onClick={() => fileInputRef.current?.click()}>
                            <AvatarImage src={formData.image} className="object-cover" />
                            <AvatarFallback className="bg-indigo-100 text-indigo-600 font-bold text-2xl">
                                {formData.name?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        
                        <div className="space-y-2 text-center sm:text-left">
                            <Label>Ảnh đại diện</Label>
                            <div className="flex gap-2 justify-center sm:justify-start">
                                <input 
                                  type="file" 
                                  ref={fileInputRef} 
                                  className="hidden" 
                                  accept="image/*"
                                  onChange={handleImageUpload}
                                />
                                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                                    <Upload className="mr-2 h-4 w-4" /> Tải ảnh lên
                                </Button>
                                {formData.image && (
                                  <Button type="button" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => setFormData({...formData, image: ""})}>
                                      Xóa
                                  </Button>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">Hỗ trợ JPG, PNG. Tối đa 2MB.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Họ và tên</Label>
                            <Input name="name" value={formData.name} onChange={handleChange} placeholder="Nhập tên hiển thị" />
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input name="email" value={formData.email} disabled className="bg-gray-50 text-gray-500" />
                        </div>
                        <div className="space-y-2">
                            <Label>Số điện thoại</Label>
                            <Input name="phone" value={formData.phone} onChange={handleChange} placeholder="0912 xxx xxx" />
                        </div>
                        <div className="space-y-2">
                            <Label>Địa chỉ</Label>
                            <Input name="address" value={formData.address} onChange={handleChange} placeholder="Hà Nội, Việt Nam" />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end border-t p-4 bg-gray-50/50">
                    <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 font-bold">
                        {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang lưu...</> : <><Save className="mr-2 h-4 w-4" /> Lưu thay đổi</>}
                    </Button>
                </CardFooter>
            </form>
          </Card>
        </TabsContent>

        {/* TAB 2: BẢO MẬT (ĐỔI MẬT KHẨU) */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Đổi mật khẩu</CardTitle>
              <CardDescription>Chọn mật khẩu mạnh để bảo vệ tài khoản của bạn.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmitPassword}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Mật khẩu hiện tại</Label>
                        <Input 
                            type="password" 
                            value={passData.current} 
                            onChange={(e) => setPassData({...passData, current: e.target.value})} 
                            required 
                            placeholder="••••••••"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Mật khẩu mới</Label>
                        <Input 
                            type="password" 
                            value={passData.new} 
                            onChange={(e) => setPassData({...passData, new: e.target.value})} 
                            required 
                            placeholder="••••••••"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Xác nhận mật khẩu mới</Label>
                        <Input 
                            type="password" 
                            value={passData.confirm} 
                            onChange={(e) => setPassData({...passData, confirm: e.target.value})} 
                            required 
                            placeholder="••••••••"
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end border-t p-4 bg-gray-50/50">
                    <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 font-bold">
                        {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang xử lý...</> : "Cập nhật mật khẩu"}
                    </Button>
                </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}