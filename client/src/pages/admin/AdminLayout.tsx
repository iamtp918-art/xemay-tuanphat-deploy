import { LOGO_URL } from "@shared/constants";
import { Link, useLocation, Redirect } from "wouter";
import { LayoutDashboard, Bike, FolderOpen, MessageSquare, FileText, Users, LogOut, Menu, X, Settings, UserCog, Car, ExternalLink, Headphones, Phone } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

const NAV_SECTIONS = [
  {
    title: "Quản lý kho xe",
    items: [
      { label: "Tổng quan", href: "/admin", icon: LayoutDashboard },
      { label: "Xe máy", href: "/admin/motorcycles", icon: Bike },
      { label: "Hãng xe", href: "/admin/brands", icon: Car },
      { label: "Danh mục", href: "/admin/categories", icon: FolderOpen },
    ],
  },
  {
    title: "Khách hàng",
    items: [
      { label: "Tin nhắn Chat", href: "/admin/chat", icon: Headphones },
      { label: "Liên hệ", href: "/admin/contacts", icon: Phone },
    ],
  },
  {
    title: "Hệ thống",
    items: [
      { label: "Chính sách", href: "/admin/policies", icon: FileText },
      { label: "Tài khoản NV", href: "/admin/users", icon: UserCog, superAdminOnly: true },
      { label: "Cài đặt cửa hàng", href: "/admin/settings", icon: Settings },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = trpc.auth.me.useQuery();
  const logoutMutation = trpc.auth.logout.useMutation();
  const utils = trpc.useUtils();
  const [location, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    utils.auth.me.invalidate();
    setLocation("/admin/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full" />
          <span className="text-sm text-gray-500">Đang tải...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/admin/login" />;
  }

  const isSuperAdmin = user.role === "super_admin" || user.role === "admin";

  // Get current page title
  const allItems = NAV_SECTIONS.flatMap(s => s.items);
  const currentPage = allItems.find(item => item.href === location);
  const pageTitle = currentPage?.label || "Quản trị";

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-[250px] bg-gray-900 text-white flex flex-col transition-transform duration-300 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}>
        {/* Logo */}
        <div className="p-4 border-b border-gray-800/50 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-red-500/30 shrink-0">
              <img src={LOGO_URL} alt="" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="font-bold text-sm leading-tight">Xe Máy Tuấn Phát</div>
              <div className="text-[10px] text-gray-500 font-medium">Hệ thống quản trị</div>
            </div>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1.5 hover:bg-gray-800 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 overflow-y-auto space-y-5">
          {NAV_SECTIONS.map((section) => {
            const visibleItems = section.items.filter(item => !(item as any).superAdminOnly || isSuperAdmin);
            if (visibleItems.length === 0) return null;
            return (
              <div key={section.title}>
                <div className="px-3 mb-2">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{section.title}</span>
                </div>
                <div className="space-y-0.5">
                  {visibleItems.map((item) => {
                    const isActive = location === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-2.5 px-3 py-2.5 text-[13px] rounded-xl transition-all duration-200 ${
                          isActive
                            ? "bg-red-600 text-white shadow-lg shadow-red-600/20 font-semibold"
                            : "text-gray-400 hover:bg-gray-800/70 hover:text-gray-200"
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <item.icon className={`w-4 h-4 ${isActive ? "" : "opacity-70"}`} />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="p-3 border-t border-gray-800/50 space-y-0.5">
          <Link href="/" className="flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-gray-400 hover:bg-gray-800/70 hover:text-gray-200 rounded-xl transition-all">
            <ExternalLink className="w-4 h-4 opacity-70" />
            Xem trang chủ
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-gray-400 hover:bg-red-900/50 hover:text-red-300 rounded-xl transition-all"
          >
            <LogOut className="w-4 h-4 opacity-70" />
            Đăng xuất
          </button>
        </div>

        {/* User info */}
        <div className="p-3 border-t border-gray-800/50">
          <div className="flex items-center gap-2.5 px-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {(user.name as string)?.[0]?.toUpperCase() || "A"}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-gray-200 truncate">{(user.name as string) || "Admin"}</div>
              <div className="text-[10px] text-gray-500 capitalize">{user.role === "super_admin" ? "Quản trị viên" : user.role === "admin" ? "Admin" : "Nhân viên"}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <header className="bg-white border-b border-gray-100 px-4 sm:px-6 py-3 flex items-center gap-3 sticky top-0 z-30 shadow-sm">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <Menu className="w-5 h-5 text-gray-700" />
          </button>

          {/* Page title */}
          <div className="flex-1">
            <h2 className="text-sm sm:text-base font-bold text-gray-900">{pageTitle}</h2>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <Link href="/" className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-600 transition-colors bg-gray-50 px-3 py-1.5 rounded-lg">
              <ExternalLink className="w-3 h-3" />
              Xem website
            </Link>
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-1.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white text-xs font-bold">
                {(user.name as string)?.[0]?.toUpperCase() || "A"}
              </div>
              <div className="hidden sm:block">
                <span className="text-sm font-semibold text-gray-700">{(user.name as string) || "Admin"}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
