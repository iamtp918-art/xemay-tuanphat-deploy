import { Link } from "wouter";
import { CONDITION_LABELS } from "@shared/constants";
import { Eye, MapPin, Bike } from "lucide-react";

function formatPrice(price: number) {
  if (price >= 1000000) return (price / 1000000).toFixed(price % 1000000 === 0 ? 0 : 1) + " triệu";
  return price.toLocaleString("vi-VN") + "đ";
}

interface Props {
  motorcycle: {
    id: number; name: string; slug: string; brand: string; price: number;
    originalPrice?: number | null; condition: string; images?: string | null;
    year?: number | null; mileage?: number | null; engineSize?: string | null;
    viewCount?: number; isFeatured?: boolean;
  };
}

export default function MotorcycleCard({ motorcycle }: Props) {
  const imageList = motorcycle.images ? motorcycle.images.split(",").filter(Boolean) : [];
  const mainImage = imageList[0] || "";

  return (
    <Link href={`/xe/${motorcycle.slug}`}>
      <div className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-red-200 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer h-full flex flex-col">
        {/* Image - aspect-video (16:9) + object-contain + bg-gray-50 for consistent display */}
        <div className="relative aspect-video bg-gray-50 overflow-hidden">
          {mainImage ? (
            <img
              src={mainImage}
              alt={motorcycle.name}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 ease-out p-1"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
                const parent = (e.target as HTMLImageElement).parentElement;
                if (parent) {
                  const fallback = document.createElement("div");
                  fallback.className = "w-full h-full flex items-center justify-center text-gray-300 bg-gray-50";
                  fallback.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>';
                  parent.appendChild(fallback);
                }
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
              <Bike className="w-12 h-12" />
            </div>
          )}

          {/* Gradient overlay bottom */}
          <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/10 to-transparent" />

          {/* Badges top-left */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {motorcycle.isFeatured && (
              <span className="bg-gradient-to-r from-red-600 to-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                HOT
              </span>
            )}
            <span className="bg-gray-900/75 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded-md">
              {CONDITION_LABELS[motorcycle.condition] || motorcycle.condition}
            </span>
          </div>

          {/* Discount badge top-right */}
          {motorcycle.originalPrice && motorcycle.originalPrice > motorcycle.price && (
            <div className="absolute top-2 right-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
              -{Math.round(((motorcycle.originalPrice - motorcycle.price) / motorcycle.originalPrice) * 100)}%
            </div>
          )}

          {/* Image count badge */}
          {imageList.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="m21 15-5-5L5 21" />
              </svg>
              {imageList.length}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3.5 flex-1 flex flex-col">
          {/* Brand & Year */}
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider bg-gray-100 px-1.5 py-0.5 rounded">
              {motorcycle.brand}
            </span>
            {motorcycle.year && (
              <span className="text-[10px] text-gray-400 font-medium">{motorcycle.year}</span>
            )}
          </div>

          {/* Name */}
          <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 mb-2 group-hover:text-red-600 transition-colors min-h-[2.5rem]">
            {motorcycle.name}
          </h3>

          {/* Specs */}
          <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-[11px] text-gray-400 mb-3">
            {motorcycle.engineSize && (
              <span className="flex items-center gap-0.5">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
                {motorcycle.engineSize}
              </span>
            )}
            {motorcycle.mileage != null && (
              <span className="flex items-center gap-0.5">
                <MapPin className="w-3 h-3" />
                {motorcycle.mileage.toLocaleString("vi-VN")} km
              </span>
            )}
            {motorcycle.viewCount != null && motorcycle.viewCount > 0 && (
              <span className="flex items-center gap-0.5">
                <Eye className="w-3 h-3" />
                {motorcycle.viewCount}
              </span>
            )}
          </div>

          {/* Price - pushed to bottom */}
          <div className="mt-auto pt-2.5 border-t border-gray-50 flex items-end justify-between">
            <div>
              <div className="text-red-600 font-extrabold text-[15px] leading-tight">{formatPrice(motorcycle.price)}</div>
              {motorcycle.originalPrice && motorcycle.originalPrice > motorcycle.price && (
                <div className="text-gray-400 text-[11px] line-through mt-0.5">{formatPrice(motorcycle.originalPrice)}</div>
              )}
            </div>
            <span className="text-[10px] text-red-600 font-semibold bg-red-50 px-2 py-1 rounded-md border border-red-100">
              Trả góp 0đ
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
