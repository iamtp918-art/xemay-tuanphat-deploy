import { Link } from "wouter";
import { LOGO_URL, SHOP_NAME, SHOP_PHONE_RAW, SHOP_ADDRESS, SHOP_EMAIL, ZALO_URL, FACEBOOK_URL } from "@shared/constants";
import { Phone, MapPin, Clock, ChevronRight, Mail, Shield, CreditCard, Repeat } from "lucide-react";

const POLICY_LINKS = [
  { label: "Chính sách bảo hành", href: "/chinh-sach/bao-hanh" },
  { label: "Chính sách trả góp", href: "/chinh-sach/tra-gop" },
  { label: "Chính sách đổi trả", href: "/chinh-sach/doi-tra" },
  { label: "Bảo mật thông tin", href: "/chinh-sach/bao-mat" },
  { label: "Điều khoản sử dụng", href: "/chinh-sach/dieu-khoan" },
  { label: "Hướng dẫn mua xe", href: "/chinh-sach/huong-dan-mua" },
];

const QUICK_LINKS = [
  { label: "Trang chủ", href: "/" },
  { label: "Kho xe máy", href: "/san-pham" },
  { label: "Liên hệ tư vấn", href: "/lien-he" },
];

const HIGHLIGHTS = [
  { icon: Shield, text: "Bảo hành 6-12 tháng" },
  { icon: CreditCard, text: "Trả góp 0đ trả trước" },
  { icon: Repeat, text: "Đổi trả trong 48h" },
];

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Highlights strip */}
      <div className="border-b border-gray-800">
        <div className="container py-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {HIGHLIGHTS.map((h, i) => (
              <div key={i} className="flex items-center justify-center gap-2.5 text-sm">
                <div className="w-8 h-8 rounded-lg bg-red-600/20 flex items-center justify-center shrink-0">
                  <h.icon className="w-4 h-4 text-red-400" />
                </div>
                <span className="text-gray-300 font-medium">{h.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Cột 1: Về cửa hàng */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 ring-2 ring-red-500/30">
                <img src={LOGO_URL} alt={SHOP_NAME} className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="font-extrabold text-white text-base">XE MÁY TUẤN PHÁT</div>
                <div className="text-xs text-gray-500">Uy Tín — Chất Lượng — Giá Tốt</div>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Chuyên mua bán xe máy cũ các hãng Honda, Yamaha, Suzuki, SYM, Piaggio, Vespa, Kymco. Hỗ trợ trả góp từ 18 tuổi, trả trước 0 đồng. Nhận thu mua xe cũ giá cao.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Clock className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span>7:30 — 19:00 hàng ngày (kể cả cuối tuần)</span>
              </div>
            </div>
          </div>

          {/* Cột 2: Liên hệ */}
          <div>
            <h3 className="font-bold text-white text-sm mb-4 uppercase tracking-wider">Liên Hệ</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                <span className="text-sm text-gray-400">{SHOP_ADDRESS}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-red-500 shrink-0" />
                <a href={`tel:${SHOP_PHONE_RAW}`} className="text-sm text-gray-400 hover:text-red-400 transition-colors font-medium">
                  Hotline/Zalo: 0335.111.777
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-red-500 shrink-0" />
                <a href={`mailto:${SHOP_EMAIL}`} className="text-sm text-gray-400 hover:text-red-400 transition-colors">
                  {SHOP_EMAIL}
                </a>
              </li>
            </ul>

            {/* Social links */}
            <div className="mt-4 flex items-center gap-2">
              <a href={ZALO_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 bg-blue-600/20 text-blue-400 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-blue-600/30 transition-colors">
                Zalo
              </a>
              <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 bg-blue-600/20 text-blue-400 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-blue-600/30 transition-colors">
                Facebook
              </a>
            </div>
          </div>

          {/* Cột 3: Chính sách */}
          <div>
            <h3 className="font-bold text-white text-sm mb-4 uppercase tracking-wider">Chính Sách</h3>
            <ul className="space-y-2">
              {POLICY_LINKS.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-gray-400 hover:text-red-400 transition-colors flex items-center gap-1">
                    <ChevronRight className="w-3 h-3" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Cột 4: Liên kết nhanh + CTA */}
          <div>
            <h3 className="font-bold text-white text-sm mb-4 uppercase tracking-wider">Khám Phá</h3>
            <ul className="space-y-2">
              {QUICK_LINKS.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-gray-400 hover:text-red-400 transition-colors flex items-center gap-1">
                    <ChevronRight className="w-3 h-3" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* CTA buttons */}
            <div className="mt-6 space-y-2">
              <a
                href={`tel:${SHOP_PHONE_RAW}`}
                className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors w-full"
              >
                <Phone className="w-4 h-4" />
                Gọi ngay: 0335.111.777
              </a>
              <a
                href={ZALO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors w-full"
              >
                Nhắn Zalo tư vấn
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="container py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="text-center sm:text-left">
            <p className="text-xs text-gray-500">
              &copy; {new Date().getFullYear()} {SHOP_NAME}. Mọi quyền được bảo lưu.
            </p>
            <p className="text-[10px] text-gray-600 mt-0.5">
              Giấy phép kinh doanh cấp bởi UBND huyện Nhơn Trạch, Đồng Nai
            </p>
          </div>
          <p className="text-xs text-gray-500">
            Design Code{" "}
            <a
              href="https://devtanphat.site"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-400 hover:text-red-300 font-semibold transition-colors"
            >
              DEV TANPHAT
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
