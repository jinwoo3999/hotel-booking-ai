import { auth } from "@/auth";
import { ClientSiteHeader } from "@/components/layouts/ClientSiteHeader";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TicketPercent, Copy, Clock } from "lucide-react";

export default async function DealsPage() {
  const session = await auth();

  const vouchers = await prisma.voucher.findMany({
    where: {
        endDate: { gte: new Date() } 
    },
    orderBy: { discount: 'desc' }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <ClientSiteHeader session={session as any} className="bg-red-600 border-none sticky top-0" />

      {/* HERO BANNER */}
      <div className="bg-red-600 py-12 px-4 text-center text-white">
        <h1 className="text-4xl font-black mb-2">Săn Deal Hot - Giá Cực Tốt</h1>
        <p className="text-red-100 text-lg">Hàng ngàn mã giảm giá khách sạn & vé máy bay đang chờ bạn</p>
      </div>

      <main className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vouchers.length > 0 ? vouchers.map((voucher) => (
                <Card key={voucher.id} className="relative overflow-hidden border-none shadow-lg hover:shadow-xl transition-all group">
                    <div className="absolute left-0 top-0 bottom-0 w-4 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Circle-icons-ticket.svg/1024px-Circle-icons-ticket.svg.png')] bg-contain opacity-10"></div>
                    
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <Badge className="bg-red-100 text-red-600 hover:bg-red-200 font-bold px-3 py-1">
                                {voucher.type === 'PERCENT' ? `Giảm ${voucher.discount}%` : `Giảm ${voucher.discount.toLocaleString()}đ`}
                            </Badge>
                            <TicketPercent className="h-12 w-12 text-red-500 opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-2">{voucher.code}</h3>
                        
                        <p className="text-gray-500 font-medium mb-4">
                            Áp dụng cho đơn hàng từ {voucher.minSpend ? voucher.minSpend.toLocaleString() + 'đ' : '0đ'}
                        </p>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Clock className="h-4 w-4" /> Hết hạn: {new Date(voucher.endDate).toLocaleDateString('vi-VN')}
                        </div>
                    </CardContent>
                    <CardFooter className="bg-gray-50 p-4 border-t border-gray-100">
                        <Button className="w-full bg-white text-red-600 border-2 border-red-600 hover:bg-red-50 font-bold gap-2">
                            <Copy className="h-4 w-4" /> Lưu mã ngay
                        </Button>
                    </CardFooter>
                </Card>
            )) : (
                 <div className="col-span-3 text-center py-20">
                    <p className="text-gray-500 text-xl">Hiện tại chưa có mã giảm giá nào.</p>
                    <p className="text-sm text-red-500">(Hãy thêm dữ liệu vào bảng Voucher trong DB)</p>
                 </div>
            )}
        </div>
      </main>
    </div>
  );
}