import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Eye } from "lucide-react";
import { deleteBlogPost, updateBlogStatus } from "@/lib/actions";

export default async function AdminBlogsPage() {
  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Cẩm nang</h1>
        <Link href="/admin/blogs/create">
          <Button className="bg-indigo-600 hover:bg-indigo-700 font-bold">
            <Plus className="h-4 w-4 mr-2" /> Viết bài
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {posts.map((post) => (
          <div key={post.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{post.title}</h3>
                <p className="text-sm text-gray-500">Tác giả: {post.author?.name || "Ẩn danh"}</p>
              </div>
              <Badge variant="outline" className="capitalize">
                {post.status}
              </Badge>
            </div>

            <p className="text-sm text-gray-600 line-clamp-2">{post.excerpt || post.content.slice(0, 120)}...</p>

            <div className="flex items-center gap-2">
              <Link href={`/blog/${post.slug}`} target="_blank">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" /> Xem
                </Button>
              </Link>

              {post.status === "PENDING_REVIEW" && (
                <form action={updateBlogStatus.bind(null, post.id, "PUBLISHED")}>
                  <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                    Duyệt bài
                  </Button>
                </form>
              )}
              {post.status === "DRAFT" && (
                <form action={updateBlogStatus.bind(null, post.id, "PUBLISHED")}>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    Xuất bản
                  </Button>
                </form>
              )}
              {post.status === "PUBLISHED" && (
                <form action={updateBlogStatus.bind(null, post.id, "DRAFT")}>
                  <Button size="sm" variant="outline">Chuyển về nháp</Button>
                </form>
              )}

              <form action={deleteBlogPost.bind(null, post.id)}>
                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        ))}
      </div>

      {posts.length === 0 && (
        <div className="text-center py-10 bg-white rounded-xl border border-dashed">
          <p className="text-gray-500">Chưa có bài viết nào.</p>
        </div>
      )}
    </div>
  );
}
