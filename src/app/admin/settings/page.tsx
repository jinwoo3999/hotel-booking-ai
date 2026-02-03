import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { updateSettings } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch"; 
import { Separator } from "@/components/ui/separator";
import { Save, Settings, ShieldAlert } from "lucide-react";
import { redirect } from "next/navigation";

export default async function AdminSettingsPage() {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    redirect("/login");
  }

  // Get settings from database
  let settings = await prisma.settings.findUnique({
    where: { id: "default" }
  });

  // Default settings if not found
  if (!settings) {
    settings = {
      id: "default",
      siteName: "Lumina Stay",
      contactEmail: "support@lumina.com",
      maintenanceMode: false
    };
  }

  return (
    <div className="space-y-6 p-6 pb-16">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Cài đặt hệ thống</h2>
        <p className="text-muted-foreground">
          Quản lý các cấu hình chung của website Lumina Stay.
        </p>
      </div>
      <Separator className="my-6" />

      <div className="grid gap-6 md:grid-cols-2">
        {/* FORM CẤU HÌNH CHUNG */}
        <form action={updateSettings} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" /> Thông tin chung
              </CardTitle>
              <CardDescription>
                Tên website và thông tin liên hệ hiển thị cho khách hàng.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Tên Website</Label>
                <Input 
                  id="siteName" 
                  name="siteName" 
                  defaultValue={settings.siteName} 
                  placeholder="VD: Lumina Stay" 
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supportEmail">Email Hỗ trợ</Label>
                <Input 
                  id="supportEmail" 
                  name="supportEmail" 
                  type="email" 
                  defaultValue={settings.contactEmail} 
                  placeholder="support@example.com" 
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <ShieldAlert className="h-5 w-5" /> Vùng Nguy Hiểm
              </CardTitle>
              <CardDescription>
                Các thiết lập ảnh hưởng trực tiếp đến truy cập của người dùng.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4 shadow-sm bg-red-50/50">
                <div className="space-y-0.5">
                  <Label className="text-base font-bold">Bảo trì hệ thống</Label>
                  <p className="text-sm text-gray-500">
                    Khi bật, chỉ Admin mới có thể truy cập website.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                    <input 
                        type="checkbox" 
                        name="maintenanceMode" 
                        id="maintenanceMode" 
                        className="h-5 w-5 accent-red-600 cursor-pointer"
                        defaultChecked={settings.maintenanceMode}
                    />
                    <Label htmlFor="maintenanceMode" className="cursor-pointer">Kích hoạt</Label>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50/50 border-t px-6 py-4">
               <Button type="submit" className="ml-auto bg-gray-900 hover:bg-gray-800 text-white font-bold">
                  <Save className="mr-2 h-4 w-4" /> Lưu thay đổi
               </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  );
}