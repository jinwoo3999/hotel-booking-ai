import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { BlogPostForm } from "@/components/blog/BlogPostForm";

export default async function BlogNewPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Viết bài cẩm nang</h1>
      <p className="text-sm text-gray-500">
        Bài viết sẽ ở trạng thái chờ duyệt trước khi xuất bản.
      </p>

      <BlogPostForm mode="user" />
    </div>
  );
}
