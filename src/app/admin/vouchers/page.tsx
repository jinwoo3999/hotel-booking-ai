import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Ticket } from "lucide-react";
import Link from "next/link";
import { deleteVoucher } from "@/lib/actions";

export default async function AdminVouchersPage() {
  const vouchers = await prisma.voucher.findMany({ orderBy: { endDate: 'desc' } });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
         <h1 className="text-2xl font-bold text-gray-900">Danh sách Voucher</h1>
         <Link href="/admin/vouchers/create">
            <Button className="bg-orange-500 hover:bg-orange-600 font-bold"><Plus className="h-4 w-4 mr-2"/> Tạo Voucher</Button>
         </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vouchers.map((v) => (
            <div key={v.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Ticket className="h-24 w-24 text-orange-500 rotate-12" />
                </div>
                <div>
                    <div className="flex justify-between items-start mb-2">
                        <Badge variant="outline" className="border-orange-200 text-orange-600 bg-orange-50 font-mono text-lg tracking-wider font-bold">
                            {v.code}
                        </Badge>
                        <form action={deleteVoucher.bind(null, v.id)}>
                            <button className="text-gray-400 hover:text-red-500"><Trash2 className="h-4 w-4"/></button>
                        </form>
                    </div>
                    <p className="text-gray-500 text-sm mb-4">{v.description}</p>
                    <div className="text-xs text-gray-400">
                        <p>Hạn dùng: <span className="font-bold text-gray-700">{new Date(v.endDate).toLocaleDateString('vi-VN')}</span></p>
                        {v.minSpend && <p>Đơn tối thiểu: {v.minSpend.toLocaleString()}đ</p>}
                    </div>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
}