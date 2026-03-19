import { trpc } from "@/lib/trpc";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MotorcycleCard from "@/components/MotorcycleCard";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { SHOP_PHONE_RAW, SHOP_ADDRESS, MOTORCYCLE_BRANDS, ZALO_URL } from "@shared/constants";
import { Link } from "wouter";
import { Phone, Shield, CreditCard, Repeat, ArrowRight, Star, MapPin, Clock, ChevronRight, Camera, Bike, Wrench, Truck, CheckCircle2, Users, ThumbsUp } from "lucide-react";
import { useState } from "react";

const STORE_IMAGES = [
  { src: "/images/store/store-1.png", alt: "Mặt tiền cửa hàng Xe Máy Tuấn Phát" },
  { src: "/images/store/store-2.png", alt: "Showroom xe máy chất lượng" },
  { src: "/images/store/store-3.png", alt: "Kho xe đa dạng" },
  { src: "/images/store/store-4.png", alt: "Khu vực trưng bày xe" },
  { src: "/images/store/store-5.png", alt: "Chủ cửa hàng Xe Máy Tuấn Phát" },
];

function StoreGallery() {
  const [lightbox, setLightbox] = useState<number | null>(null);

  return (
    <section className="py-14 bg-white">
      <div className="container">
        <div className="animate-on-scroll text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
            <Camera className="w-3.5 h-3.5" />
            Hình Ảnh Cửa Hàng
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">Không Gian Cửa Hàng</h2>
          <p className="text-sm text-gray-500 mt-1.5">Ấp 1, Long Thọ, Nhơn Trạch, Đồng Nai — Mời anh/chị ghé xem xe trực tiếp</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {STORE_IMAGES.map((img, i) => (
            <div
              key={i}
              className={`animate-on-scroll delay-${(i % 4) + 1} relative group cursor-pointer rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow ${
                i === 0 ? "col-span-2 md:col-span-2 lg:col-span-2 row-span-2 aspect-[4/3]" : "aspect-square"
              }`}
              onClick={() => setLightbox(i)}
            >
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-white text-[11px] font-medium bg-black/40 backdrop-blur-sm px-2 py-1 rounded-md">
                  {img.alt}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white text-3xl font-light z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            onClick={() => setLightbox(null)}
          >
            &times;
          </button>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white text-3xl font-light z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            onClick={(e) => { e.stopPropagation(); setLightbox((lightbox - 1 + STORE_IMAGES.length) % STORE_IMAGES.length); }}
          >
            &lsaquo;
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white text-3xl font-light z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            onClick={(e) => { e.stopPropagation(); setLightbox((lightbox + 1) % STORE_IMAGES.length); }}
          >
            &rsaquo;
          </button>
          <img
            src={STORE_IMAGES[lightbox].src}
            alt={STORE_IMAGES[lightbox].alt}
            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/90 text-sm bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full">
            {STORE_IMAGES[lightbox].alt} ({lightbox + 1}/{STORE_IMAGES.length})
          </div>
        </div>
      )}
    </section>
  );
}

export default function Home() {
  useScrollAnimation();
  const { data: featured } = trpc.motorcycles.list.useQuery({ featured: true, limit: 8, available: true });
  const { data: latest } = trpc.motorcycles.list.useQuery({ limit: 8, available: true });
  const { data: categories } = trpc.categories.list.useQuery({ activeOnly: true });

  const stats = [
    { value: "500+", label: "Xe đã bán", icon: Bike },
    { value: "98%", label: "Khách hài lòng", icon: ThumbsUp },
    { value: "12", label: "Tháng bảo hành", icon: Shield },
    { value: "0đ", label: "Trả trước", icon: CreditCard },
  ];

  const features = [
    { icon: Shield, title: "Bảo Hành 6-12 Tháng", desc: "Cam kết bảo hành động cơ, hộp số, hệ thống điện. Xe tay ga cao cấp bảo hành 12 tháng." },
    { icon: CreditCard, title: "Trả Góp Từ 0 Đồng", desc: "Hỗ trợ trả góp từ 18 tuổi, duyệt nhanh 30 phút. Đối tác: FE Credit, HD Saison, Mcredit." },
    { icon: Repeat, title: "Đổi Trả Trong 48 Giờ", desc: "Đổi trả miễn phí trong 48 giờ nếu phát hiện lỗi kỹ thuật từ phía cửa hàng." },
    { icon: Wrench, title: "Kiểm Tra 20 Hạng Mục", desc: "Mỗi xe đều qua kiểm tra 20 hạng mục kỹ thuật trước khi bán, đảm bảo chất lượng." },
    { icon: Truck, title: "Giao Xe Toàn Quốc", desc: "Hỗ trợ giao xe tận nơi toàn quốc. Sang tên chính chủ nhanh trong ngày." },
    { icon: Users, title: "Thu Mua Xe Cũ Giá Cao", desc: "Nhận thu mua xe cũ giá cao, hỗ trợ đổi xe cũ lấy xe mới tại cửa hàng." },
  ];

  const whyChooseUs = [
    "Xe được kiểm tra kỹ thuật 20 hạng mục trước khi bán",
    "Giấy tờ đầy đủ, hỗ trợ sang tên chính chủ",
    "Cam kết không bán xe ngập nước, xe tai nạn",
    "Giá cạnh tranh nhất khu vực Nhơn Trạch - Đồng Nai",
    "Đội ngũ kỹ thuật viên nhiều năm kinh nghiệm",
    "Hỗ trợ tư vấn miễn phí, không ép mua",
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-gray-950 via-gray-900 to-red-950 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-red-600 rounded-full blur-3xl" />
        </div>
        <div className="container relative py-16 sm:py-24 lg:py-28">
          <div className="max-w-2xl">
            <div className="animate-on-scroll">
              <span className="inline-flex items-center gap-1.5 bg-red-600/20 text-red-400 text-xs font-semibold px-3 py-1.5 rounded-full border border-red-600/30 mb-5">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                Chuyên Mua Bán Xe Máy Cũ Uy Tín
              </span>
            </div>
            <h1 className="animate-on-scroll delay-1 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-5">
              Xe Máy <span className="text-red-500">Tuấn Phát</span>
              <br />
              <span className="text-2xl sm:text-3xl lg:text-4xl text-gray-300 font-bold">Uy Tín — Chất Lượng — Giá Tốt</span>
            </h1>
            <p className="animate-on-scroll delay-2 text-gray-400 text-sm sm:text-base leading-relaxed mb-4 max-w-lg">
              Cửa hàng xe máy cũ uy tín hàng đầu tại Nhơn Trạch, Đồng Nai. Chuyên các dòng Honda, Yamaha, Suzuki, SYM, Piaggio, Vespa. Hỗ trợ trả góp từ 18 tuổi, trả trước 0 đồng. Bảo hành lên đến 12 tháng.
            </p>
            <div className="animate-on-scroll delay-2 flex flex-wrap items-center gap-2 mb-7">
              {["Honda", "Yamaha", "Suzuki", "SYM", "Piaggio"].map((brand) => (
                <span key={brand} className="text-[10px] text-gray-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-md font-medium">{brand}</span>
              ))}
              <span className="text-[10px] text-gray-500">+5 hãng khác</span>
            </div>
            <div className="animate-on-scroll delay-3 flex flex-wrap gap-3">
              <Link href="/san-pham" className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 text-sm shadow-lg shadow-red-600/25 hover:shadow-red-600/40">
                <Bike className="w-4 h-4" /> Xem Kho Xe
              </Link>
              <a href={`tel:${SHOP_PHONE_RAW}`} className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm border border-white/20 backdrop-blur-sm">
                <Phone className="w-4 h-4" /> 0335.111.777
              </a>
              <a href={ZALO_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-blue-600/80 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm">
                Nhắn Zalo
              </a>
            </div>
          </div>
        </div>
        <div className="bg-black/30 backdrop-blur-sm border-t border-white/10">
          <div className="container py-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {stats.map((s, i) => (
                <div key={i} className="animate-on-scroll text-center flex flex-col items-center">
                  <s.icon className="w-5 h-5 text-red-400 mb-1.5" />
                  <div className="text-2xl sm:text-3xl font-extrabold text-red-500">{s.value}</div>
                  <div className="text-xs text-gray-400 mt-0.5 font-medium">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* USP Features - 6 items */}
      <section className="py-12 bg-white">
        <div className="container">
          <div className="animate-on-scroll text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">Tại Sao Chọn Tuấn Phát?</h2>
            <p className="text-sm text-gray-500 mt-1.5">Cam kết mang đến trải nghiệm mua xe tốt nhất cho khách hàng</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <div key={i} className={`animate-on-scroll delay-${(i % 4) + 1} flex items-start gap-3.5 p-5 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-md hover:border-red-100 transition-all duration-300`}>
                <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                  <f.icon className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">{f.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories && categories.length > 0 && (
        <section className="py-14 bg-gray-50">
          <div className="container">
            <div className="animate-on-scroll text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">Danh Mục Xe Máy</h2>
              <p className="text-sm text-gray-500 mt-1.5">Chọn loại xe phù hợp với nhu cầu sử dụng của bạn</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {categories.map((cat, i) => (
                <Link key={cat.id} href={`/san-pham?category=${cat.slug}`}>
                  <div className={`animate-on-scroll delay-${(i % 4) + 1} group bg-white rounded-2xl p-5 text-center border border-gray-100 hover:border-red-200 hover:shadow-lg transition-all duration-300 cursor-pointer`}>
                    {cat.imageUrl && (
                      <div className="w-16 h-16 mx-auto mb-3 rounded-xl overflow-hidden bg-gray-50">
                        <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-contain" />
                      </div>
                    )}
                    <h3 className="font-bold text-gray-900 text-sm group-hover:text-red-600 transition-colors">{cat.name}</h3>
                    <p className="text-[11px] text-gray-400 mt-1.5 line-clamp-2">{cat.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured */}
      {featured && featured.items.length > 0 && (
        <section className="py-14 bg-white">
          <div className="container">
            <div className="animate-on-scroll flex items-end justify-between mb-7">
              <div>
                <div className="inline-flex items-center gap-1.5 bg-yellow-50 text-yellow-600 text-[11px] font-semibold px-2.5 py-1 rounded-full mb-2">
                  <Star className="w-3 h-3 fill-yellow-500" />
                  Nổi bật
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">Xe Nổi Bật Tại Cửa Hàng</h2>
                <p className="text-sm text-gray-500 mt-1">Những chiếc xe được khách hàng quan tâm nhiều nhất</p>
              </div>
              <Link href="/san-pham" className="hidden sm:flex items-center gap-1 text-sm text-red-600 font-semibold hover:text-red-700 transition-colors bg-red-50 px-3 py-1.5 rounded-lg">
                Xem tất cả <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {featured.items.slice(0, 8).map((moto, i) => (
                <div key={moto.id} className={`animate-on-scroll delay-${(i % 4) + 1}`}>
                  <MotorcycleCard motorcycle={moto} />
                </div>
              ))}
            </div>
            <div className="sm:hidden text-center mt-6">
              <Link href="/san-pham" className="inline-flex items-center gap-1 text-sm text-red-600 font-semibold bg-red-50 px-4 py-2 rounded-lg">
                Xem tất cả xe <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Latest */}
      {latest && latest.items.length > 0 && (
        <section className="py-14 bg-gray-50">
          <div className="container">
            <div className="animate-on-scroll flex items-end justify-between mb-7">
              <div>
                <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 text-[11px] font-semibold px-2.5 py-1 rounded-full mb-2">
                  <Clock className="w-3 h-3" />
                  Mới nhất
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">Xe Mới Về Kho</h2>
                <p className="text-sm text-gray-500 mt-1">Cập nhật xe mới nhất tại cửa hàng hàng ngày</p>
              </div>
              <Link href="/san-pham" className="hidden sm:flex items-center gap-1 text-sm text-red-600 font-semibold hover:text-red-700 transition-colors bg-red-50 px-3 py-1.5 rounded-lg">
                Xem tất cả <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {latest.items.slice(0, 8).map((moto, i) => (
                <div key={moto.id} className={`animate-on-scroll delay-${(i % 4) + 1}`}>
                  <MotorcycleCard motorcycle={moto} />
                </div>
              ))}
            </div>
            <div className="sm:hidden text-center mt-6">
              <Link href="/san-pham" className="inline-flex items-center gap-1 text-sm text-red-600 font-semibold bg-red-50 px-4 py-2 rounded-lg">
                Xem tất cả xe <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Why Choose Us - Checklist */}
      <section className="py-14 bg-white">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="animate-on-scroll">
              <div className="inline-flex items-center gap-1.5 bg-green-50 text-green-600 text-[11px] font-semibold px-2.5 py-1 rounded-full mb-3">
                <CheckCircle2 className="w-3 h-3" />
                Cam kết
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-4">Cam Kết Của Xe Máy Tuấn Phát</h2>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                Với nhiều năm kinh nghiệm trong lĩnh vực mua bán xe máy cũ, chúng tôi cam kết mang đến cho khách hàng những chiếc xe chất lượng nhất với giá cả hợp lý nhất.
              </p>
              <div className="space-y-3">
                {whyChooseUs.map((item, i) => (
                  <div key={i} className={`animate-on-scroll delay-${(i % 4) + 1} flex items-start gap-3`}>
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700 font-medium">{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href={`tel:${SHOP_PHONE_RAW}`} className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm shadow-lg shadow-red-600/20">
                  <Phone className="w-4 h-4" /> Gọi tư vấn miễn phí
                </a>
                <Link href="/san-pham" className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm">
                  Xem kho xe <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
            <div className="animate-on-scroll delay-2">
              {/* Brands grid */}
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <h3 className="font-bold text-gray-900 text-sm mb-4 text-center">Các Hãng Xe Có Tại Cửa Hàng</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {MOTORCYCLE_BRANDS.map((brand) => (
                    <Link key={brand} href={`/san-pham?brand=${brand}`}>
                      <div className="bg-white rounded-xl p-3 text-center border border-gray-100 hover:border-red-200 hover:shadow-md transition-all cursor-pointer group">
                        <span className="text-sm font-bold text-gray-700 group-hover:text-red-600 transition-colors">{brand}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Store Gallery */}
      <StoreGallery />

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-red-600 to-red-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full blur-3xl" />
        </div>
        <div className="container relative text-center">
          <div className="animate-on-scroll max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">Bạn Đang Tìm Xe Máy?</h2>
            <p className="text-red-100 text-sm sm:text-base max-w-lg mx-auto mb-3">
              Liên hệ ngay để được tư vấn miễn phí. Trả góp từ 18 tuổi, trả trước 0 đồng, duyệt nhanh 30 phút.
            </p>
            <p className="text-red-200 text-xs mb-7">
              Mở cửa 7:30 - 19:00 hàng ngày kể cả cuối tuần và lễ
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <a href={`tel:${SHOP_PHONE_RAW}`} className="inline-flex items-center gap-2 bg-white text-red-600 font-bold px-7 py-3 rounded-xl hover:bg-gray-50 transition-all text-sm shadow-lg">
                <Phone className="w-4 h-4" /> Gọi Ngay: 0335.111.777
              </a>
              <a href={ZALO_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold px-7 py-3 rounded-xl hover:bg-blue-700 transition-colors text-sm shadow-lg">
                Nhắn Zalo Tư Vấn
              </a>
              <Link href="/lien-he" className="inline-flex items-center gap-2 bg-white/20 text-white font-semibold px-7 py-3 rounded-xl hover:bg-white/30 transition-colors text-sm border border-white/30 backdrop-blur-sm">
                Gửi Liên Hệ <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Info bar */}
      <section className="py-8 bg-gray-900">
        <div className="container">
          <div className="animate-on-scroll grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="flex items-center justify-center gap-2 text-gray-400 hover:text-gray-300 transition-colors">
              <MapPin className="w-4 h-4 text-red-500 shrink-0" />
              <span className="text-sm">{SHOP_ADDRESS}</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-gray-400">
              <Phone className="w-4 h-4 text-red-500 shrink-0" />
              <a href={`tel:${SHOP_PHONE_RAW}`} className="text-sm hover:text-white transition-colors font-medium">Hotline/Zalo: 0335.111.777</a>
            </div>
            <div className="flex items-center justify-center gap-2 text-gray-400">
              <Clock className="w-4 h-4 text-red-500 shrink-0" />
              <span className="text-sm">7:30 - 19:00 hàng ngày (kể cả cuối tuần)</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
