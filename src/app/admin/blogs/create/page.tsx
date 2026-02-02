import { BlogPostForm } from "@/components/blog/BlogPostForm";

export default function AdminCreateBlogPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Tạo bài viết cẩm nang</h1>
      <BlogPostForm mode="admin" />
    </div>
  );
}
