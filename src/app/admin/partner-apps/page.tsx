import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, Mail, Phone, Building, MapPin, FileText } from "lucide-react";
import { approvePartnerApplication, rejectPartnerApplication } from "@/lib/actions";

export default async function PartnerAppsPage() {
  const session = await auth();
  
  if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user?.role || "")) {
    redirect("/");
  }

  const applications = await prisma.partnerApplication.findMany({
    orderBy: { submittedAt: 'desc' },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      }
    }
  });

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'PENDING').length,
    approved: applications.filter(a => a.status === 'APPROVED').length,
    rejected: applications.filter(a => a.status === 'REJECTED').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Đơn đăng ký Partner</h1>
        <p className="text-sm text-gray-500 mt-1">Quản lý các đơn đăng ký trở thành đối tác khách sạn</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Tổng đơn</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
        </Card>
        <Card className="p-4 border-yellow-200 bg-yellow-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-700">Chờ duyệt</p>
              <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </Card>
        <Card className="p-4 border-green-200 bg-green-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700">Đã duyệt</p>
              <p className="text-2xl font-bold text-green-900">{stats.approved}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </Card>
        <Card className="p-4 border-red-200 bg-red-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700">Từ chối</p>
              <p className="text-2xl font-bold text-red-900">{stats.rejected}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </Card>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {applications.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Chưa có đơn đăng ký nào</p>
          </Card>
        ) : (
          applications.map((app) => (
            <Card key={app.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    <Building className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{app.hotelName}</h3>
                    <p className="text-sm text-gray-500">
                      Đăng ký: {new Date(app.submittedAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
                <Badge className={
                  app.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                  app.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }>
                  {app.status === 'APPROVED' ? 'Đã duyệt' :
                   app.status === 'REJECTED' ? 'Từ chối' :
                   'Chờ duyệt'}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{app.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">SĐT:</span>
                    <span className="font-medium">{app.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Địa chỉ:</span>
                    <span className="font-medium">{app.address}</span>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Thành phố:</span>
                    <span className="font-medium ml-2">{app.city}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Số phòng:</span>
                    <span className="font-medium ml-2">{app.roomCount || 'Chưa cung cấp'}</span>
                  </div>
                  {app.website && (
                    <div>
                      <span className="text-gray-600">Website:</span>
                      <a href={app.website} target="_blank" rel="noopener noreferrer" className="font-medium ml-2 text-indigo-600 hover:underline">
                        {app.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {app.description && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{app.description}</p>
                </div>
              )}

              {app.status === 'PENDING' && (
                <div className="flex gap-2 pt-4 border-t">
                  <form action={approvePartnerApplication.bind(null, app.id)} className="flex-1">
                    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Duyệt đơn
                    </Button>
                  </form>
                  <form action={rejectPartnerApplication.bind(null, app.id)} className="flex-1">
                    <Button type="submit" variant="outline" className="w-full text-red-600 border-red-300 hover:bg-red-50">
                      <XCircle className="w-4 h-4 mr-2" />
                      Từ chối
                    </Button>
                  </form>
                </div>
              )}

              {app.status !== 'PENDING' && app.reviewedAt && (
                <div className="pt-4 border-t text-sm">
                  {app.status === 'APPROVED' ? (
                    <span className="text-green-600">
                      ✓ Đã duyệt vào {new Date(app.reviewedAt).toLocaleDateString('vi-VN')}
                    </span>
                  ) : (
                    <span className="text-red-600">
                      ✗ Đã từ chối vào {new Date(app.reviewedAt).toLocaleDateString('vi-VN')}
                    </span>
                  )}
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
