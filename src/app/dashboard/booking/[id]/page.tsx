import { redirect } from "next/navigation";

export default async function RoomDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/book/${id}`);
}