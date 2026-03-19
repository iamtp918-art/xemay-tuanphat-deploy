import { useState } from "react";
import { trpc } from "@/lib/trpc";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MotorcycleCard from "@/components/MotorcycleCard";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { CONDITION_LABELS, SHOP_PHONE_RAW, ZALO_URL } from "@shared/constants";
import { Link, useParams } from "wouter";
import { Phone, Shield, CreditCard, Eye, Fuel, MapPin, ChevronLeft, ChevronRight, X, Share2, Heart } from "lucide-react";

function formatPrice(price: number) {
  return price.toLocaleString("vi-VN") + "đ";
}

export default function ProductDetail() {
  useScrollAnimation();
  const { slug } = useParams<{ slug: string }>();
  const { data: moto, isLoading } = trpc.motorcycles.getBySlug.useQuery({ slug: slug || "" });
  const { data: related } = trpc.motorcycles.list.useQuery(
    { limit: 4, available: true, brand: moto?.brand },
    { enabled: !!moto }
  );
  const [selectedImg, setSelectedImg] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="container py-12">
          <div className="animate-pulse grid lg:grid-cols-2 gap-8">
            <div className="aspect-[4/3] bg-gray-100 rounded-2xl" />
            <div className="space-y-4">
              <div className="h-4 bg-gray-100 rounded w-1/4" />
              <div className="h-8 bg-gray-100 rounded w-3/4" />
              <div className="h-6 bg-gray-100 rounded w-1/2" />
              <div className="h-16 bg-gray-100 rounded w-full" />
              <div className="h-12 bg-gray-100 rounded w-full" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!moto) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="container py-20 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Fuel className="w-10 h-10 text-gray-300" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy xe</h2>
          <p className="text-gray-500 mb-4 text-sm">Xe này có thể đã được bán hoặc không tồn tại.</p>
          <Link href="/san-pham" className="inline-flex items-center gap-2 text-red-600 font-semibold hover:text-red-700 bg-red-50 px-4 py-2 rounded-lg">
            <ChevronLeft className="w-4 h-4" /> Quay lại danh sách xe
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const images = moto.images ? moto.images.split(",").filter(Boolean) : [];
  const featuresList = moto.features ? moto.features.split(",").filter(Boolean) : [];
  const relatedItems = related?.items.filter(m => m.id !== moto.id).slice(0, 4) || [];

  const specs = [
    { label: "Hãng xe", value: moto.brand },
    { label: "Năm sản xuất", value: moto.year ? String(moto.year) : null },
    { label: "Dung tích", value: moto.engineSize },
    { label: "Số km đã đi", value: moto.mileage != null ? `${moto.mileage.toLocaleString("vi-VN")} km` : null },
    { label: "Màu sắc", value: moto.color },
    { label: "Tình trạng", value: CONDITION_LABELS[moto.condition] || moto.condition },
  ].filter(s => s.value);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100 py-3">
        <div className="container">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
            <Link href="/" className="hover:text-red-600 transition-colors">Trang chủ</Link>
            <span className="text-gray-300">/</span>
            <Link href="/san-pham" className="hover:text-red-600 transition-colors">Kho xe</Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-900 font-medium truncate max-w-[200px]">{moto.name}</span>
          </div>
        </div>
      </div>

      <div className="container py-6 sm:py-8">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Images */}
          <div className="animate-on-scroll">
            {/* Main image */}
            <div
              className="relative aspect-[4/3] bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer group"
              onClick={() => images.length > 0 && setLightbox(true)}
            >
              {images.length > 0 ? (
                <>
                  <img
                    src={images[selectedImg]}
                    alt={moto.name}
                    className="w-full h-full object-contain bg-gray-50 group-hover:scale-[1.02] transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' fill='%23f3f4f6'%3E%3Crect width='400' height='300'/%3E%3Ctext x='200' y='155' text-anchor='middle' fill='%239ca3af' font-size='16'%3EKhông tải được ảnh%3C/text%3E%3C/svg%3E";
                    }}
                  />
                  {/* Image counter */}
                  <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-lg">
                    {selectedImg + 1}/{images.length}
                  </div>
                  {/* Nav arrows */}
                  {images.length > 1 && (
                    <>
                      <button
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => { e.stopPropagation(); setSelectedImg((selectedImg - 1 + images.length) % images.length); }}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => { e.stopPropagation(); setSelectedImg((selectedImg + 1) % images.length); }}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
                  <Fuel className="w-20 h-20" />
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-none">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImg(i)}
                    className={`w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-xl overflow-hidden border-2 shrink-0 transition-all duration-200 ${
                      i === selectedImg
                        ? "border-red-500 ring-2 ring-red-100 shadow-sm"
                        : "border-gray-200 hover:border-gray-300 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Ảnh ${i + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="animate-on-scroll delay-1">
            {/* Badges */}
            <div className="flex items-center flex-wrap gap-2 mb-3">
              <span className="bg-gray-900 text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg">{moto.brand}</span>
              <span className="bg-red-50 text-red-600 text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-red-100">
                {CONDITION_LABELS[moto.condition] || moto.condition}
              </span>
              {moto.isFeatured && (
                <span className="bg-yellow-50 text-yellow-700 text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-yellow-100">
                  Nổi bật
                </span>
              )}
              {!moto.isAvailable && (
                <span className="bg-gray-100 text-gray-500 text-[11px] font-semibold px-2.5 py-1 rounded-lg">
                  Đã bán
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-xl sm:text-2xl lg:text-[26px] font-extrabold text-gray-900 leading-tight mb-3">{moto.name}</h1>

            {/* Quick specs */}
            <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mb-5">
              {moto.year && <span>Năm {moto.year}</span>}
              {moto.engineSize && <span>{moto.engineSize}</span>}
              {moto.mileage != null && <span>{moto.mileage.toLocaleString("vi-VN")} km</span>}
              {moto.color && <span>{moto.color}</span>}
              <span className="flex items-center gap-1 text-gray-400">
                <Eye className="w-3.5 h-3.5" /> {moto.viewCount} lượt xem
              </span>
            </div>

            {/* Price box */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-5 mb-5 border border-red-100">
              <div className="text-red-600 font-extrabold text-2xl sm:text-3xl">{formatPrice(moto.price)}</div>
              {moto.originalPrice && moto.originalPrice > moto.price && (
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-gray-400 line-through text-sm">{formatPrice(moto.originalPrice)}</span>
                  <span className="bg-red-600 text-white text-[11px] font-bold px-2 py-0.5 rounded">
                    -{Math.round(((moto.originalPrice - moto.price) / moto.originalPrice) * 100)}%
                  </span>
                  <span className="text-green-600 text-sm font-semibold">
                    Tiết kiệm {formatPrice(moto.originalPrice - moto.price)}
                  </span>
                </div>
              )}
            </div>

            {/* Benefits */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-5">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                    <Shield className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <span className="font-semibold">Bảo hành 6-12 tháng</span>
                    <span className="text-gray-400 text-xs ml-1">máy, hộp số, hệ thống điện</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <span className="font-semibold">Trả góp từ 18 tuổi</span>
                    <span className="text-gray-400 text-xs ml-1">trả trước 0đ, duyệt 15 phút</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <span className="font-semibold">Ấp 1, Long Thọ, Nhơn Trạch</span>
                    <span className="text-gray-400 text-xs ml-1">Đồng Nai</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex gap-3">
              <a
                href={`tel:${SHOP_PHONE_RAW}`}
                className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl transition-all text-sm shadow-lg shadow-red-600/20 hover:shadow-red-600/30"
              >
                <Phone className="w-4 h-4" /> Gọi Mua Ngay
              </a>
              <a
                href={ZALO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all text-sm shadow-lg shadow-blue-600/20"
              >
                Nhắn Zalo
              </a>
            </div>
            <Link
              href="/lien-he"
              className="mt-3 w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              Đặt Lịch Xem Xe
            </Link>
          </div>
        </div>

        {/* Specs table */}
        {specs.length > 0 && (
          <div className="animate-on-scroll mt-8 bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Thông Số Kỹ Thuật</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
              {specs.map((s, i) => (
                <div key={i} className={`flex items-center justify-between py-3 px-4 ${i % 2 === 0 ? "bg-gray-50" : "bg-white"} ${i < specs.length - (specs.length % 2 === 0 ? 2 : 1) ? "border-b border-gray-100" : ""} rounded-lg`}>
                  <span className="text-sm text-gray-500">{s.label}</span>
                  <span className="text-sm font-semibold text-gray-900">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        {moto.description && (
          <div className="animate-on-scroll mt-4 bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Mô Tả Chi Tiết</h2>
            <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{moto.description}</div>
          </div>
        )}

        {/* Features */}
        {featuresList.length > 0 && (
          <div className="animate-on-scroll mt-4 bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Tính Năng Nổi Bật</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {featuresList.map((f, i) => (
                <div key={i} className="flex items-center gap-2.5 text-sm text-gray-700 bg-gray-50 px-3.5 py-2.5 rounded-xl">
                  <span className="w-2 h-2 bg-red-500 rounded-full shrink-0" />
                  <span className="font-medium">{f.trim()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related */}
        {relatedItems.length > 0 && (
          <div className="animate-on-scroll mt-10">
            <h2 className="text-xl font-extrabold text-gray-900 mb-5">Xe Tương Tự Tại Cửa Hàng</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {relatedItems.map((m) => (
                <MotorcycleCard key={m.id} motorcycle={m} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && images.length > 0 && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center" onClick={() => setLightbox(false)}>
          <button
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white z-10 transition-colors"
            onClick={() => setLightbox(false)}
          >
            <X className="w-5 h-5" />
          </button>
          {images.length > 1 && (
            <>
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white z-10 transition-colors"
                onClick={(e) => { e.stopPropagation(); setSelectedImg((selectedImg - 1 + images.length) % images.length); }}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white z-10 transition-colors"
                onClick={(e) => { e.stopPropagation(); setSelectedImg((selectedImg + 1) % images.length); }}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
          <img
            src={images[selectedImg]}
            alt={moto.name}
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white text-sm px-4 py-2 rounded-full">
            {selectedImg + 1} / {images.length}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
