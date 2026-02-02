import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trash2, Shield, User } from "lucide-react";
import { deleteUser } from "@/lib/actions";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Quản lý Người dùng ({users.length})</h1>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b">
                <tr>
                    <th className="px-6 py-4">Người dùng</th>
                    <th className="px-6 py-4">Vai trò</th>
                    <th className="px-6 py-4">Ngày tham gia</th>
                    <th className="px-6 py-4 text-right">Hành động</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 flex items-center gap-3">
                            <Avatar>
                                <AvatarImage src={user.image || ""} />
                                <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-bold text-gray-900">{user.name}</p>
                                <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'} className={user.role === 'ADMIN' ? 'bg-purple-600' : ''}>
                                {user.role === 'ADMIN' ? <Shield className="h-3 w-3 mr-1"/> : <User className="h-3 w-3 mr-1"/>}
                                {user.role}
                            </Badge>
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                            {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-6 py-4 text-right">
                             <form action={deleteUser.bind(null, user.id)}>
                                <Button size="icon" variant="ghost" className="text-red-400 hover:text-red-600 hover:bg-red-50">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                             </form>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
}