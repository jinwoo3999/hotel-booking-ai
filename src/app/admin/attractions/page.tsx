import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Plus, Trash2 } from "lucide-react";
import { deleteAttraction } from "@/lib/actions";

export default async function AdminAttractionsPage() {
  const attractions = await prisma.attraction.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Điểm vui chơi</h1>
          <p className="text-sm text-gray-500">Quản lý danh sách điểm đến gợi ý cho khách.</p>
        </div>
        <Link href="/admin/attractions/create">
          <Button className="bg-indigo-600 hover:bg-indigo-700 font-bold">
            <Plus className="h-4 w-4 mr-2" /> Tạo điểm vui chơi
          </Button>
        </Link>
      </div>

      {attractions.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-xl p-8 text-center text-gray-500">
          Chưa có điểm vui chơi nào. Hãy tạo mới để AI gợi ý chính xác hơn.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {attractions.map((item) => (
            <div
              key={item.id}
              className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-3 relative overflow-hidden"
            >
              <div className="absolute top-2 right-2 opacity-10">
                <MapPin className="h-16 w-16 text-indigo-600" />
              </div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-500">{item.city}</p>
                </div>
                <form action={deleteAttraction.bind(null, item.id)}>
                  <button className="text-gray-400 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </form>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <Badge variant="outline" className="border-indigo-200 text-indigo-700 bg-indigo-50">
                  {item.status}
                </Badge>
                {item.category && (
                  <Badge variant="outline" className="border-gray-200 text-gray-600 bg-gray-50">
                    {item.category}
                  </Badge>
                )}
              </div>
              {item.address && <p className="text-xs text-gray-400">{item.address}</p>}
              {item.description && (
                <p className="text-sm text-gray-600 line-clamp-3">{item.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
