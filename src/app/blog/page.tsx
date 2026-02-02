import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";
import { Sparkles, MapPin, Star } from "lucide-react";

export default async function BlogPage() {
  const session = await auth();
  const posts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
  });
  const hotels = await prisma.hotel.findMany({
    where: { status: "ACTIVE" },
    orderBy: { rating: "desc" },
    take: 3,
  });

  const month = new Date().getMonth() + 1;
  const seasonalTaglines = [
    "Gợi ý lộ trình tối ưu theo ngân sách và sở thích.",
    "Tổng hợp xu hướng du lịch để bạn chọn điểm đến phù hợp.",
    "Cập nhật ưu đãi theo mùa để đặt phòng tiết kiệm.",
  ];
  const seasonalMessage = seasonalTaglines[month % seasonalTaglines.length];

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10 space-y-10">
      <div className="rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white p-8 md:p-10 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
        <div className="absolute right-10 bottom-0 h-24 w-24 rounded-full bg-white/10" />
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2 text-indigo-100">
            <Sparkles className="h-5 w-5" /> Cẩm nang du lịch
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">Cẩm nang chọn điểm đến phù hợp</h1>
          <p className="text-sm md:text-base text-indigo-100 max-w-2xl">
            {seasonalMessage}
          </p>
          <div className="flex items-center gap-3">
            {session?.user?.id && (
              <Link href="/blog/new">
                <Button className="bg-white/20 text-white hover:bg-white/30 border border-white/40">Viết bài</Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border p-6 space-y-3">
          <div className="flex items-center gap-2 text-indigo-600 font-bold">
            <Sparkles className="h-5 w-5" /> Gợi ý từ hệ thống
          </div>
          <p className="text-sm text-gray-600">
            Tổng hợp dữ liệu phòng trống, ngân sách và thời điểm để đề xuất lịch trình phù hợp.
          </p>
          <Link href="/search">
            <Button variant="outline" className="w-full">Bắt đầu tìm phòng</Button>
          </Link>
        </div>
        <div className="bg-white rounded-2xl border p-6 space-y-3">
          <div className="flex items-center gap-2 text-indigo-600 font-bold">
            <Sparkles className="h-5 w-5" /> Nội dung cập nhật
          </div>
          <p className="text-sm text-gray-600">
            Bài viết được cập nhật theo mùa và ưu đãi thực tế từ hệ thống OTA.
          </p>
          <Link href="/dashboard/vouchers">
            <Button variant="outline" className="w-full">Xem ưu đãi</Button>
          </Link>
        </div>
        <div className="bg-white rounded-2xl border p-6 space-y-3">
          <div className="flex items-center gap-2 text-indigo-600 font-bold">
            <MapPin className="h-5 w-5" /> Điểm đến hot
          </div>
          <p className="text-sm text-gray-600">
            Các địa điểm đang được đặt nhiều nhất dựa trên dữ liệu đặt phòng.
          </p>
          <Link href="/search">
            <Button variant="outline" className="w-full">Khám phá</Button>
          </Link>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed">
          <p className="text-gray-500">Chưa có bài viết nào được xuất bản.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`}>
              <div className="bg-white rounded-2xl border overflow-hidden hover:shadow-lg transition-all cursor-pointer h-full">
                {post.coverImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.coverImage} alt={post.title} className="h-48 w-full object-cover" />
                )}
                <div className="p-5 space-y-2">
                  <h3 className="text-xl font-bold text-gray-900">{post.title}</h3>
                  <p className="text-sm text-gray-500">{new Date(post.createdAt).toLocaleDateString("vi-VN")}</p>
                  <p className="text-sm text-gray-600 line-clamp-3">{post.excerpt || post.content.slice(0, 160)}...</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {hotels.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Gợi ý từ dữ liệu hệ thống</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {hotels.map((hotel) => (
              <div key={hotel.id} className="bg-white rounded-2xl border p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900">{hotel.name}</h3>
                  <span className="text-sm text-indigo-600 flex items-center gap-1">
                    <Star className="h-4 w-4" /> {hotel.rating.toFixed(1)}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{hotel.city}</p>
                <p className="text-xs text-gray-500 line-clamp-2">{hotel.description}</p>
                <Link href={`/hotels/${hotel.id}`}>
                  <Button variant="outline" size="sm">Xem chi tiết</Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
