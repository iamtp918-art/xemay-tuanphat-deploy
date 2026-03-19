import { useState } from "react";
import AdminLayout from "./AdminLayout";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Store, Lock, Share2, Save, Eye, EyeOff } from "lucide-react";

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("info");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPasswordVal, setNewPasswordVal] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  const changePasswordMutation = trpc.auth.changePassword.useMutation({
    onSuccess: () => {
      toast.success("Đã đổi mật khẩu thành công");
      setCurrentPassword("");
      setNewPasswordVal("");
      setConfirmPassword("");
    },
    onError: (err) => toast.error(err.message),
  });

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPasswordVal) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }
    if (newPasswordVal !== confirmPassword) {
      toast.error("Mật khẩu mới không khớp");
      return;
    }
    if (newPasswordVal.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }
    changePasswordMutation.mutate({ currentPassword, newPassword: newPasswordVal });
  };

  const tabs = [
    { id: "info", label: "Thông tin cửa hàng", icon: Store },
    { id: "account", label: "Tài khoản", icon: Lock },
    { id: "social", label: "Mạng xã hội", icon: Share2 },
  ];

  const inputClass = "w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-50 transition-all";

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">Cài Đặt</h1>
        <p className="text-sm text-gray-500 mt-1">Quản lý thông tin và cài đặt hệ thống</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === tab.id
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab: Thông tin cửa hàng */}
      {activeTab === "info" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 max-w-2xl">
          <div className="flex items-center gap-2 mb-5">
            <Store className="w-5 h-5 text-red-500" />
            <h3 className="font-bold text-gray-900">Thông tin cửa hàng</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Tên cửa hàng</label>
              <input type="text" defaultValue="Xe Máy Tuấn Phát" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Địa chỉ</label>
              <input type="text" defaultValue="Ấp 1, Long Thọ, Nhơn Trạch, Đồng Nai" className={inputClass} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Hotline 1</label>
                <input type="text" defaultValue="0335.111.777" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Hotline 2</label>
                <input type="text" className={inputClass} placeholder="Nhập số điện thoại" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Zalo</label>
                <input type="text" defaultValue="0335111777" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
                <input type="email" defaultValue="xemaytuanphat@gmail.com" className={inputClass} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Giờ mở cửa</label>
              <input type="text" defaultValue="Thứ 2 – Chủ nhật: 7:00 – 19:00" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Google Maps embed URL</label>
              <input type="url" className={inputClass} placeholder="https://www.google.com/maps/embed?..." />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Mô tả ngắn</label>
              <textarea
                rows={3}
                defaultValue="Chuyên mua bán xe máy cũ uy tín tại Nhơn Trạch, Đồng Nai. Hỗ trợ trả góp từ 18 tuổi, trả trước 0 đồng."
                className={inputClass + " resize-none"}
              />
            </div>
            <div className="pt-2">
              <button className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all text-sm shadow-sm hover:shadow-md">
                <Save className="w-4 h-4" /> Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Tài khoản */}
      {activeTab === "account" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 max-w-md">
          <div className="flex items-center gap-2 mb-5">
            <Lock className="w-5 h-5 text-red-500" />
            <h3 className="font-bold text-gray-900">Đổi mật khẩu</h3>
          </div>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Mật khẩu hiện tại</label>
              <div className="relative">
                <input
                  type={showCurrentPw ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={inputClass + " pr-10"}
                  required
                />
                <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Mật khẩu mới</label>
              <div className="relative">
                <input
                  type={showNewPw ? "text" : "password"}
                  value={newPasswordVal}
                  onChange={(e) => setNewPasswordVal(e.target.value)}
                  className={inputClass + " pr-10"}
                  required
                />
                <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Tối thiểu 6 ký tự</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Xác nhận mật khẩu mới</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClass}
                required
              />
              {confirmPassword && newPasswordVal !== confirmPassword && (
                <p className="text-[11px] text-red-500 mt-1">Mật khẩu không khớp</p>
              )}
            </div>
            <div className="pt-2">
              <button
                type="submit"
                disabled={changePasswordMutation.isPending}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white font-semibold rounded-xl transition-all text-sm shadow-sm"
              >
                <Lock className="w-4 h-4" />
                {changePasswordMutation.isPending ? "Đang xử lý..." : "Đổi mật khẩu"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab: Mạng xã hội */}
      {activeTab === "social" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 max-w-2xl">
          <div className="flex items-center gap-2 mb-5">
            <Share2 className="w-5 h-5 text-red-500" />
            <h3 className="font-bold text-gray-900">Mạng xã hội</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Facebook Page URL</label>
              <input type="url" className={inputClass} placeholder="https://facebook.com/..." />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Zalo OA URL</label>
              <input type="url" className={inputClass} placeholder="https://zalo.me/..." />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">TikTok URL</label>
              <input type="url" className={inputClass} placeholder="https://tiktok.com/@..." />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">YouTube URL</label>
              <input type="url" className={inputClass} placeholder="https://youtube.com/@..." />
            </div>
            <div className="pt-2">
              <button className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all text-sm shadow-sm hover:shadow-md">
                <Save className="w-4 h-4" /> Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
