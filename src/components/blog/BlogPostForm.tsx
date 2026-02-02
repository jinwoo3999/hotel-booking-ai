"use client";

import { useState } from "react";
import { createBlogPost } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type BlogPostFormProps = {
  mode: "admin" | "user";
};

export function BlogPostForm({ mode }: BlogPostFormProps) {
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [status, setStatus] = useState("DRAFT");
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error || "UPLOAD_FAILED");
      setCoverImage(data.url);
      toast.success("Tải ảnh thành công");
    } catch {
      toast.error("Không thể tải ảnh, vui lòng thử lại");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("excerpt", excerpt);
    formData.append("content", content);
    if (coverImage) formData.append("coverImage", coverImage);
    if (mode === "admin") formData.append("status", status);

    try {
      const res = await createBlogPost(formData);
      if (res && 'error' in res) {
        toast.error(res.error as string);
      } else {
        toast.success("Lưu bài viết thành công");
        setTitle("");
        setExcerpt("");
        setContent("");
        setCoverImage("");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl border">
      <div className="space-y-2">
        <Label>Tiêu đề</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Nhập tiêu đề bài viết" />
      </div>

      <div className="space-y-2">
        <Label>Ảnh cover</Label>
        <div className="flex items-center gap-3">
          <Input value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="https://..." />
          <label className="inline-flex items-center">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(file);
              }}
            />
            <Button type="button" variant="outline" disabled={isUploading}>
              {isUploading ? "Đang tải..." : "Tải ảnh"}
            </Button>
          </label>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Trích dẫn ngắn</Label>
        <Input value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Tóm tắt 1-2 câu" />
      </div>

      <div className="space-y-2">
        <Label>Nội dung</Label>
        <Textarea value={content} onChange={(e) => setContent(e.target.value)} required rows={10} placeholder="Viết nội dung bài..." />
      </div>

      {mode === "admin" && (
        <div className="space-y-2">
          <Label>Trạng thái</Label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
          >
            <option value="DRAFT">Bản nháp</option>
            <option value="PUBLISHED">Xuất bản</option>
          </select>
        </div>
      )}

      <Button className="bg-indigo-600 hover:bg-indigo-700" disabled={isSaving}>
        {isSaving ? "Đang lưu..." : "Lưu bài viết"}
      </Button>
    </form>
  );
}
