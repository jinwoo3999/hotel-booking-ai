import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { approvePartnerApplicationAction, rejectPartnerApplicationAction } from "@/lib/actions";

export default async function PartnerAppsPage() {
  const session = await auth();
  
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
    redirect("/admin");
  }

  const applications = await prisma.partnerApplication.findMany({
    orderBy: { submittedAt: 'desc' }
  });

  const pendingCount = applications.filter(app => app.status === 'PENDING').length;
  const approvedCount = applications.filter(app => app.status === 'APPROVED').length;
  const rejectedCount = applications.filter(app => app.status === 'REJECTED').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Đơn Đăng Ký Partner</h1>
        <p className="text-gray-600">Quản lý các đơn đăng ký trở thành đối tác khách sạn</p>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng đơn</p>
              <p className="text-2xl font-bold">{applications.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Chờ duyệt</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Đã duyệt</p>
              <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Từ chối</p>
              <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Danh sách đơn đăng ký</h2>
        </div>
        <div className="p-6">
          {applications.length > 0 ? (
            <div className="space-y-4">
              {applications.map((app) => (
                <div key={app.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-gray-900">{app.hotelName}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          app.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          app.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {app.status === 'PENDING' ? 'Chờ duyệt' :
                           app.status === 'APPROVED' ? 'Đã duyệt' : 'Từ chối'}
                        </span>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                        <div>
                          <p><strong>Người liên hệ:</strong> {app.fullName}</p>
                          <p><strong>Email:</strong> {app.email}</p>
                          <p><strong>Điện thoại:</strong> {app.phone}</p>
                        </div>
                        <div>
                          <p><strong>Thành phố:</strong> {app.city}</p>
                          <p><strong>Địa chỉ:</strong> {app.address}</p>
                          <p><strong>Ngày gửi:</strong> {new Date(app.submittedAt).toLocaleDateString('vi-VN')}</p>
                        </div>
                      </div>
                      
                      {app.description && (
                        <div className="mb-4 p-3 bg-gray-50 rounded">
                          <p className="text-sm text-gray-600">{app.description}</p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      {app.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <form action={approvePartnerApplicationAction}>
                            <input type="hidden" name="applicationId" value={app.id} />
                            <button 
                              type="submit"
                              className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                            >
                              ✅ Duyệt đơn
                            </button>
                          </form>
                          
                          <form action={rejectPartnerApplicationAction}>
                            <input type="hidden" name="applicationId" value={app.id} />
                            <button 
                              type="submit"
                              className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                            >
                              ❌ Từ chối
                            </button>
                          </form>
                        </div>
                      )}

                      {app.status === 'APPROVED' && (
                        <div className="text-sm text-green-600 font-medium">
                          ✅ Đã duyệt - Tài khoản partner đã được tạo
                        </div>
                      )}

                      {app.status === 'REJECTED' && (
                        <div className="text-sm text-red-600 font-medium">
                          ❌ Đã từ chối đơn đăng ký
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có đơn đăng ký nào</h3>
              <p className="text-gray-500">Các đơn đăng ký partner sẽ hiển thị ở đây</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}