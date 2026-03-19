import { useState } from "react";
import { trpc } from "@/lib/trpc";
import AdminLayout from "./AdminLayout";
import { Plus, Pencil, Key, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

const DEPT_LABELS: Record<string, string> = {
  sales: "Tư vấn bán hàng",
  customer_care: "CSKH",
  both: "Tư vấn & CSKH",
};

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [resetUserId, setResetUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const [form, setForm] = useState({
    name: "",
    username: "",
    phone: "",
    department: "sales",
    password: "",
    isActive: true,
  });

  const { data: staffList, refetch } = trpc.users.list.useQuery();
  const createMutation = trpc.users.create.useMutation({
    onSuccess: () => { refetch(); setShowDialog(false); toast.success("Đã tạo nhân viên mới"); },
    onError: (err) => toast.error(err.message),
  });
  const updateMutation = trpc.users.update.useMutation({
    onSuccess: () => { refetch(); setShowDialog(false); toast.success("Đã cập nhật thông tin"); },
    onError: (err) => toast.error(err.message),
  });
  const toggleMutation = trpc.users.toggleActive.useMutation({
    onSuccess: () => { refetch(); toast.success("Đã cập nhật trạng thái"); },
    onError: (err) => toast.error(err.message),
  });
  const deleteMutation = trpc.users.delete.useMutation({
    onSuccess: () => { refetch(); toast.success("Đã xóa nhân viên"); },
    onError: (err) => toast.error(err.message),
  });
  const resetMutation = trpc.users.resetPassword.useMutation({
    onSuccess: () => { setShowResetDialog(false); setNewPassword(""); toast.success("Đã đặt lại mật khẩu"); },
    onError: (err) => toast.error(err.message),
  });

  const filtered = (staffList || []).filter(
    (u: any) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditingUser(null);
    setForm({ name: "", username: "", phone: "", department: "sales", password: "", isActive: true });
    setShowDialog(true);
  };

  const openEdit = (user: any) => {
    setEditingUser(user);
    setForm({
      name: user.name,
      username: user.username,
      phone: user.phone || "",
      department: user.department || "sales",
      password: "",
      isActive: user.isActive,
    });
    setShowDialog(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.username.trim()) {
      toast.error("Vui lòng nhập đầy đủ thông tin bắt buộc");
      return;
    }
    if (editingUser) {
      updateMutation.mutate({
        id: editingUser.id,
        name: form.name,
        phone: form.phone || undefined,
        department: form.department as any,
        isActive: form.isActive,
      });
    } else {
      if (!form.password.trim()) {
        toast.error("Vui lòng nhập mật khẩu");
        return;
      }
      createMutation.mutate({
        name: form.name,
        username: form.username,
        phone: form.phone || undefined,
        department: form.department as any,
        password: form.password,
      });
    }
  };

  const handleDelete = (user: any) => {
    if (confirm(`Bạn có chắc muốn xóa nhân viên "${user.name}"?`)) {
      deleteMutation.mutate({ id: user.id });
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Quản Lý Nhân Viên</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý tài khoản nhân viên cửa hàng</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 bg-[#E53E3E] hover:bg-[#C53030] text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Thêm nhân viên
        </button>
      </div>

      {/* Search */}
      <div className="mb-4 relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo tên hoặc tài khoản..."
          className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-200"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">STT</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Tên</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Tài khoản</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Bộ phận</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Trạng thái</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Đăng nhập cuối</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400">
                    Chưa có nhân viên nào
                  </td>
                </tr>
              ) : (
                filtered.map((user: any, idx: number) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{user.name}</td>
                    <td className="px-4 py-3 text-gray-600">{user.username}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                        {DEPT_LABELS[user.department] || user.department}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          user.isActive
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {user.isActive ? "Hoạt động" : "Tạm khóa"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleString("vi-VN")
                        : "Chưa đăng nhập"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(user)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-blue-600 transition-colors"
                          title="Sửa"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => { setResetUserId(user.id); setNewPassword(""); setShowResetDialog(true); }}
                          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-orange-600 transition-colors"
                          title="Đặt lại mật khẩu"
                        >
                          <Key className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => toggleMutation.mutate({ id: user.id, isActive: !user.isActive })}
                          className={`p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-xs font-medium ${
                            user.isActive ? "text-red-500 hover:text-red-700" : "text-green-500 hover:text-green-700"
                          }`}
                          title={user.isActive ? "Khóa" : "Mở khóa"}
                        >
                          {user.isActive ? "Khóa" : "Mở"}
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-red-600 transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dialog thêm/sửa nhân viên */}
      {showDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowDialog(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {editingUser ? "Sửa thông tin nhân viên" : "Thêm nhân viên mới"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập *</label>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "") })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-200"
                  disabled={!!editingUser}
                  required
                  placeholder="Chỉ chữ thường, số, dấu gạch dưới"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bộ phận *</label>
                <select
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-200"
                >
                  <option value="sales">Tư vấn bán hàng</option>
                  <option value="customer_care">CSKH</option>
                  <option value="both">Cả hai</option>
                </select>
              </div>
              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu *</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-200"
                    required
                  />
                </div>
              )}
              {editingUser && (
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Trạng thái:</label>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, isActive: !form.isActive })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      form.isActive ? "bg-green-500" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        form.isActive ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                  <span className="text-sm text-gray-500">
                    {form.isActive ? "Hoạt động" : "Tạm khóa"}
                  </span>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDialog(false)}
                  className="flex-1 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 py-2 bg-[#E53E3E] hover:bg-[#C53030] disabled:bg-gray-300 text-white font-semibold rounded-lg transition-colors text-sm"
                >
                  {editingUser ? "Cập nhật" : "Tạo mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dialog đặt lại mật khẩu */}
      {showResetDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowResetDialog(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Đặt lại mật khẩu</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newPassword.trim()) { toast.error("Vui lòng nhập mật khẩu mới"); return; }
                resetMutation.mutate({ id: resetUserId!, newPassword });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới *</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-200"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowResetDialog(false)}
                  className="flex-1 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={resetMutation.isPending}
                  className="flex-1 py-2 bg-[#E53E3E] hover:bg-[#C53030] disabled:bg-gray-300 text-white font-semibold rounded-lg transition-colors text-sm"
                >
                  Đặt lại
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
