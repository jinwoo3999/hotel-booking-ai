import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function PartnersPage() {
  const session = await auth();
  
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
    redirect("/admin");
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900">Partners Management</h1>
      <p className="text-gray-600">Manage partner applications and accounts</p>
      
      <div className="mt-6 p-4 bg-green-50 rounded-lg">
        <p className="text-green-800">This page works! The issue is specific to partner-applications route.</p>
      </div>
    </div>
  );
}