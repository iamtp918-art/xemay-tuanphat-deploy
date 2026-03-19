import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { LOGO_URL, SHOP_NAME, SHOP_PHONE_RAW, ZALO_URL } from "@shared/constants";
import { Menu, X, Phone, MapPin, Clock, ChevronDown } from "lucide-react";

const NAV_ITEMS = [
  { label: "Trang chủ", href: "/" },
  { label: "Kho Xe", href: "/san-pham" },
  { label: "Trả góp 0đ", href: "/chinh-sach/tra-gop" },
  { label: "Bảo hành", href: "/chinh-sach/bao-hanh" },
  { label: "Hướng dẫn mua xe", href: "/chinh-sach/huong-dan-mua" },
  { label: "Liên hệ", href: "/lien-he" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-lg"
          : "bg-white shadow-sm"
      }`}
    >
      {/* Top bar - info strip */}
      <div className="bg-gray-900 text-white text-[11px] py-1.5 hidden sm:block">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-gray-400">
              <Clock className="w-3 h-3 text-red-400" />
              7:30 - 19:00 hàng ngày (kể cả cuối tuần)
            </span>
            <span className="flex items-center gap-1 text-gray-400">
              <MapPin className="w-3 h-3 text-red-400" />
              Ấp 1, Long Thọ, Nhơn Trạch, Đồng Nai
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a href={ZALO_URL} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors font-medium">
              Zalo tư vấn
            </a>
            <span className="text-gray-600">|</span>
            <a href={`tel:${SHOP_PHONE_RAW}`} className="flex items-center gap-1.5 hover:text-red-400 transition-colors font-medium">
              <Phone className="w-3 h-3" />
              Hotline: 0335.111.777
            </a>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="container">
        <div className="flex items-center justify-between h-[60px] sm:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-full overflow-hidden shrink-0 ring-2 ring-red-100">
              <img src={LOGO_URL} alt={SHOP_NAME} className="h-full w-full object-cover" />
            </div>
            <div>
              <div className="font-extrabold text-gray-900 text-[13px] sm:text-sm leading-tight tracking-tight">XE MÁY TUẤN PHÁT</div>
              <div className="text-[10px] text-gray-500 leading-tight font-medium">Chuyên mua bán xe máy cũ uy tín</div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {NAV_ITEMS.map((item) => {
              const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? "text-red-600 bg-red-50"
                      : "text-gray-700 hover:text-red-600 hover:bg-red-50/50"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* CTA + Mobile toggle */}
          <div className="flex items-center gap-2">
            <a
              href={`tel:${SHOP_PHONE_RAW}`}
              className="hidden sm:flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-sm hover:shadow-md"
            >
              <Phone className="w-3.5 h-3.5" />
              Gọi ngay
            </a>
            {/* Mobile phone icon */}
            <a
              href={`tel:${SHOP_PHONE_RAW}`}
              className="sm:hidden p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              aria-label="Gọi điện"
            >
              <Phone className="w-5 h-5" />
            </a>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/20 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
          <div className="lg:hidden fixed top-[60px] sm:top-[92px] left-0 right-0 bottom-0 bg-white z-50 overflow-y-auto">
            <nav className="container py-4 space-y-1">
              {NAV_ITEMS.map((item) => {
                const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                      isActive
                        ? "text-red-600 bg-red-50"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}

              {/* Mobile quick links */}
              <div className="pt-3 border-t border-gray-100 mt-3 space-y-2">
                <a
                  href={`tel:${SHOP_PHONE_RAW}`}
                  className="flex items-center justify-center gap-2 bg-red-600 text-white text-sm font-bold py-3 rounded-xl shadow-sm"
                >
                  <Phone className="w-4 h-4" />
                  Gọi ngay: 0335.111.777
                </a>
                <a
                  href={ZALO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-blue-600 text-white text-sm font-bold py-3 rounded-xl shadow-sm"
                >
                  Nhắn Zalo tư vấn
                </a>
              </div>

              {/* Mobile info */}
              <div className="pt-3 border-t border-gray-100 mt-3 space-y-2 text-sm text-gray-500">
                <div className="flex items-center gap-2 px-4">
                  <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                  Ấp 1, Long Thọ, Nhơn Trạch, Đồng Nai
                </div>
                <div className="flex items-center gap-2 px-4">
                  <Clock className="w-4 h-4 text-red-500 shrink-0" />
                  7:30 - 19:00 hàng ngày
                </div>
              </div>
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
