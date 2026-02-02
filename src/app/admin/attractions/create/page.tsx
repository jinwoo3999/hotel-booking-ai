"use client";

import { useActionState } from "react";
import { createAttraction } from "@/lib/actions";
import { Button } from "@/components/ui/button";

type ActionState = 
  | { error: string }
  | { success: boolean };

const initialState: ActionState = {
  error: "",
};

export default function AdminCreateAttractionPage() {
  const [state, formAction, isPending] = useActionState(createAttraction, initialState);

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tạo điểm vui chơi</h1>
        <p className="text-sm text-gray-500">Thông tin này dùng để AI gợi ý cho khách.</p>
      </div>

      {"error" in state && state.error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">
          {state.error}
        </div>
      )}

      {"success" in state && state.success && (
        <div className="bg-green-50 text-green-600 p-4 rounded-lg text-sm">
          Tạo điểm vui chơi thành công!
        </div>
      )}

      <form action={formAction} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Tên điểm vui chơi *</label>
            <input
              name="name"
              required
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              placeholder="Ví dụ: Bà Nà Hills"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Thành phố *</label>
            <input
              name="city"
              required
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              placeholder="Ví dụ: Đà Nẵng"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Danh mục</label>
            <input
              name="category"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              placeholder="Ví dụ: Khu vui chơi"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Trạng thái</label>
            <select name="status" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm">
              <option value="DRAFT">DRAFT</option>
              <option value="PUBLISHED">PUBLISHED</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Địa chỉ</label>
          <input
            name="address"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            placeholder="Ví dụ: Hòa Ninh, Hòa Vang"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Ảnh đại diện</label>
          <input
            name="imageUrl"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            placeholder="https://..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Mô tả</label>
          <textarea
            name="description"
            rows={4}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            placeholder="Mô tả ngắn để AI hiểu rõ hơn."
          />
        </div>

        <div className="flex justify-end">
          <Button className="bg-indigo-600 hover:bg-indigo-700 font-bold">Lưu điểm vui chơi</Button>
        </div>
      </form>
    </div>
  );
}
