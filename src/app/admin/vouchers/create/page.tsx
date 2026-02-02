import { createVoucher } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";

export default function CreateVoucherPage() {
  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl border shadow-sm">
      <h2 className="text-xl font-bold mb-6">Tạo mã giảm giá mới</h2>
      <form action={createVoucher} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label>Mã Voucher</Label>
                <Input name="code" placeholder="SALE2026" required className="uppercase font-bold" />
            </div>
            <div className="space-y-2">
                <Label>Ngày hết hạn</Label>
                <Input name="endDate" type="date" required />
            </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label>Loại giảm giá</Label>
                <select name="type" className="w-full h-10 px-3 rounded-md border border-gray-200 text-sm">
                    <option value="PERCENT">Theo phần trăm (%)</option>
                    <option value="AMOUNT">Theo số tiền (VND)</option>
                </select>
            </div>
            <div className="space-y-2">
                <Label>Giá trị giảm</Label>
                <Input name="discount" type="number" placeholder="10 hoặc 100000" required />
            </div>
        </div>

        <div className="space-y-2">
            <Label>Đơn hàng tối thiểu (VNĐ)</Label>
            <Input name="minSpend" type="number" defaultValue={0} />
        </div>

        <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 font-bold mt-4">
            <Save className="h-4 w-4 mr-2" /> Lưu Voucher
        </Button>
      </form>
    </div>
  );
}