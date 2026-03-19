import { trpc } from "@/lib/trpc";
import AdminLayout from "./AdminLayout";
import { Bike, MessageSquare, Users, AlertCircle, Plus, FileText, Settings, UserCog, TrendingUp, ArrowRight, Clock, Phone, MapPin, ExternalLink } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: stats } = trpc.dashboard.stats.useQuery();
  const { data: user } = trpc.auth.me.useQuery();
  const { data: recentContacts } = trpc.contacts.list.useQuery({ page: 1, limit: 5 });

  const cards = [
    { label: "Tổng xe máy", value: stats?.totalMotorcycles ?? 0, icon: Bike, color: "from-blue-500 to-blue-600", bgLight: "bg-blue-50", textColor: "text-blue-600" },
    { label: "Liên hệ mới", value: stats?.newContacts ?? 0, icon: AlertCircle, color: "from-red-500 to-red-600", bgLight: "bg-red-50", textColor: "text-red-600" },
    { label: "Tổng liên hệ", value: stats?.totalContacts ?? 0, icon: MessageSquare, color: "from-emerald-500 to-emerald-600", bgLight: "bg-emerald-50", textColor: "text-emerald-600" },
    { label: "Cuộc hội thoại", value: stats?.totalConversations ?? 0, icon: Users, color: "from-purple-500 to-purple-600", bgLight: "bg-purple-50", textColor: "text-purple-600" },
  ];

  const quickActions = [
    { label: "Thêm xe mới", desc: "Đăng xe máy lên website", href: "/admin/motorcycles", icon: Plus, color: "bg-red-600 hover:bg-red-700" },
    { label: "Xem liên hệ", desc: "Kiểm tra tin nhắn mới", href: "/admin/contacts", icon: MessageSquare, color: "bg-emerald-600 hover:bg-emerald-700" },
    { label: "Chính sách", desc: "Quản lý nội dung", href: "/admin/policies", icon: FileText, color: "bg-blue-600 hover:bg-blue-700" },
    { label: "Cài đặt", desc: "Cấu hình hệ thống", href: "/admin/settings", icon: Settings, color: "bg-gray-700 hover:bg-gray-800" },
  ];

  const isSuperAdmin = user?.role === "super_admin" || user?.role === "admin";

  return (
    <AdminLayout>
      {/* Welcome */}
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">
              Xin chào, {(user?.name as string) || "Quản trị viên"}!
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Tổng quan hoạt động cửa hàng Xe Máy Tuấn Phát
            </p>
          </div>
          <Link
            href="/admin/motorcycles"
            className="hidden sm:flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" /> Thêm xe
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-7">
        {cards.map((card, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 group">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${card.bgLight} flex items-center justify-center`}>
                <card.icon className={`w-5 h-5 ${card.textColor}`} />
              </div>
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity`}>
                <TrendingUp className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">{card.value.toLocaleString("vi-VN")}</div>
            <div className="text-xs text-gray-500 mt-1 font-medium">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-7">
        <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
          <ArrowRight className="w-4 h-4 text-red-500" />
          Thao tác nhanh
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((action, i) => (
            <Link
              key={i}
              href={action.href}
              className={`${action.color} text-white rounded-2xl p-4 sm:p-5 flex flex-col gap-2 transition-all shadow-sm hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]`}
            >
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                <action.icon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-bold block">{action.label}</span>
                <span className="text-[11px] text-white/70 block mt-0.5">{action.desc}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Recent contacts */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">Liên hệ gần đây</h2>
            <Link href="/admin/contacts" className="text-xs text-red-600 font-semibold hover:text-red-700 flex items-center gap-1">
              Xem tất cả <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentContacts?.items.slice(0, 5).map((c) => (
              <div key={c.id} className="px-4 sm:px-5 py-3 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 text-xs font-bold shrink-0">
                    {c.fullName[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate">{c.fullName}</div>
                    <div className="text-[11px] text-gray-400 truncate">{c.message || c.phone}</div>
                  </div>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ml-2 ${
                  c.status === "new" ? "bg-red-50 text-red-600" :
                  c.status === "read" ? "bg-yellow-50 text-yellow-600" :
                  "bg-green-50 text-green-600"
                }`}>
                  {c.status === "new" ? "Mới" : c.status === "read" ? "Đã xem" : "Đã trả lời"}
                </span>
              </div>
            )) || (
              <div className="px-5 py-8 text-center text-sm text-gray-400">Chưa có liên hệ nào</div>
            )}
          </div>
        </div>

        {/* Info & Guide */}
        <div className="space-y-4">
          {/* Store info */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 mb-3">Thông tin cửa hàng</h2>
            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                <span>Ấp 1, Long Thọ, Nhơn Trạch, Đồng Nai</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-gray-600">
                <Phone className="w-4 h-4 text-red-500 shrink-0" />
                <span className="font-semibold">0335.111.777</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-gray-600">
                <Clock className="w-4 h-4 text-red-500 shrink-0" />
                <span>7:00 - 19:00 hàng ngày</span>
              </div>
            </div>
          </div>

          {/* Quick guide */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-4 sm:p-5 text-white">
            <h2 className="text-base font-bold mb-3">Hướng dẫn nhanh</h2>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                <span>Thêm xe mới tại mục <strong className="text-white">Xe máy</strong></span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                <span>Kiểm tra liên hệ tại mục <strong className="text-white">Liên hệ</strong></span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</span>
                <span>Quản lý chính sách tại mục <strong className="text-white">Chính sách</strong></span>
              </div>
              {isSuperAdmin && (
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">4</span>
                  <span>Quản lý nhân viên tại mục <strong className="text-white">Nhân viên</strong></span>
                </div>
              )}
            </div>
            <Link href="/" className="mt-4 inline-flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-semibold transition-colors">
              <ExternalLink className="w-3 h-3" /> Xem website
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
