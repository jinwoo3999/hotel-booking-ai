import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

type BlogPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function BlogDetailPage({ params }: BlogPageProps) {
  const { slug } = await params;
  
  const post = await prisma.blogPost.findUnique({
    where: { slug },
    include: {
      author: {
        select: { name: true }
      }
    }
  });

  if (!post || post.status !== "PUBLISHED") {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10 space-y-6">
      {post.coverImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.coverImage} alt={post.title} className="w-full rounded-2xl object-cover" />
      )}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">{post.title}</h1>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>Tác giả: {post.author.name}</span>
          <span>•</span>
          <span>{new Date(post.createdAt).toLocaleDateString("vi-VN")}</span>
        </div>
        {post.excerpt && (
          <p className="text-lg text-gray-600 italic">{post.excerpt}</p>
        )}
      </div>

      <div className="prose max-w-none whitespace-pre-wrap text-gray-800 leading-relaxed">
        {post.content}
      </div>
    </div>
  );
}
