import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MotorcycleCard from "@/components/MotorcycleCard";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { MOTORCYCLE_BRANDS } from "@shared/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X, ChevronLeft, ChevronRight, SlidersHorizontal, Bike } from "lucide-react";
import { useSearch } from "wouter";

export default function Products() {
  useScrollAnimation();
  const searchStr = useSearch();
  const params = useMemo(() => new URLSearchParams(searchStr), [searchStr]);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState(params.get("search") || "");
  const [brand, setBrand] = useState(params.get("brand") || "all");
  const [condition, setCondition] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const categorySlug = params.get("category") || undefined;
  const { data: cats } = trpc.categories.list.useQuery({ activeOnly: true });
  const selectedCat = cats?.find(c => c.slug === categorySlug);

  const activeFilterCount = [brand !== "all", condition !== "all", priceRange !== "all", !!search].filter(Boolean).length;

  const queryInput = useMemo(() => {
    const input: any = { page, limit: 12, available: true };
    if (search) input.search = search;
    if (brand && brand !== "all") input.brand = brand;
    if (condition && condition !== "all") input.condition = condition;
    if (selectedCat) input.categoryId = selectedCat.id;
    if (priceRange && priceRange !== "all") {
      const [min, max] = priceRange.split("-").map(Number);
      if (min) input.minPrice = min;
      if (max) input.maxPrice = max;
    }
    return input;
  }, [page, search, brand, condition, priceRange, selectedCat]);

  const { data, isLoading } = trpc.motorcycles.list.useQuery(queryInput);
  const totalPages = data ? Math.ceil(data.total / 12) : 0;

  const clearAll = () => {
    setSearch(""); setBrand("all"); setCondition("all"); setPriceRange("all"); setPage(1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      {/* Banner */}
      <div className="bg-gradient-to-r from-gray-900 to-red-900 py-10 sm:py-12">
        <div className="container">
          <p className="text-red-300 text-xs sm:text-sm mb-2 font-medium">Trang chủ / Kho xe máy</p>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">
            {selectedCat ? selectedCat.name : "Kho Xe Máy Tuấn Phát"}
          </h1>
          <p className="text-gray-300 mt-1.5 text-sm">{data?.total ?? 0} xe đang bán tại cửa hàng — Honda, Yamaha, Suzuki, SYM, Piaggio & nhiều hãng khác</p>
        </div>
      </div>

      <div className="container py-6 sm:py-8">
        {/* Search & Filters */}
        <div className="animate-on-scroll bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 mb-5">
          {/* Search bar + filter toggle */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Tìm xe máy: Honda Wave, Yamaha Exciter, SH..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-10 h-10 rounded-xl"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={`h-10 px-4 rounded-xl flex items-center gap-2 ${showFilters ? "bg-red-50 border-red-200 text-red-600" : ""}`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Bộ lọc</span>
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 bg-red-600 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </div>

          {/* Expandable filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Hãng xe</label>
                  <Select value={brand} onValueChange={(v) => { setBrand(v); setPage(1); }}>
                    <SelectTrigger className="h-9 rounded-lg"><SelectValue placeholder="Tất cả hãng" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả hãng</SelectItem>
                      {MOTORCYCLE_BRANDS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Tình trạng</label>
                  <Select value={condition} onValueChange={(v) => { setCondition(v); setPage(1); }}>
                    <SelectTrigger className="h-9 rounded-lg"><SelectValue placeholder="Tất cả" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="like_new">Như mới</SelectItem>
                      <SelectItem value="good">Tốt</SelectItem>
                      <SelectItem value="fair">Khá</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Khoảng giá</label>
                  <Select value={priceRange} onValueChange={(v) => { setPriceRange(v); setPage(1); }}>
                    <SelectTrigger className="h-9 rounded-lg"><SelectValue placeholder="Tất cả giá" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả giá</SelectItem>
                      <SelectItem value="0-15000000">Dưới 15 triệu</SelectItem>
                      <SelectItem value="15000000-25000000">15 - 25 triệu</SelectItem>
                      <SelectItem value="25000000-40000000">25 - 40 triệu</SelectItem>
                      <SelectItem value="40000000-999999999">Trên 40 triệu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {activeFilterCount > 0 && (
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    {search && (
                      <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 text-[11px] font-medium px-2.5 py-1 rounded-full">
                        "{search}" <X className="w-3 h-3 cursor-pointer hover:text-red-800" onClick={() => setSearch("")} />
                      </span>
                    )}
                    {brand !== "all" && (
                      <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 text-[11px] font-medium px-2.5 py-1 rounded-full">
                        {brand} <X className="w-3 h-3 cursor-pointer hover:text-blue-800" onClick={() => setBrand("all")} />
                      </span>
                    )}
                    {condition !== "all" && (
                      <span className="inline-flex items-center gap-1 bg-green-50 text-green-600 text-[11px] font-medium px-2.5 py-1 rounded-full">
                        {condition === "like_new" ? "Như mới" : condition === "good" ? "Tốt" : "Khá"}
                        <X className="w-3 h-3 cursor-pointer hover:text-green-800" onClick={() => setCondition("all")} />
                      </span>
                    )}
                    {priceRange !== "all" && (
                      <span className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-600 text-[11px] font-medium px-2.5 py-1 rounded-full">
                        {priceRange === "0-15000000" ? "< 15tr" : priceRange === "15000000-25000000" ? "15-25tr" : priceRange === "25000000-40000000" ? "25-40tr" : "> 40tr"}
                        <X className="w-3 h-3 cursor-pointer hover:text-yellow-800" onClick={() => setPriceRange("all")} />
                      </span>
                    )}
                  </div>
                  <button className="text-xs text-gray-500 hover:text-red-600 font-medium transition-colors" onClick={clearAll}>
                    Xóa tất cả
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Category tabs */}
        {cats && cats.length > 0 && (
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
            <a href="/san-pham">
              <Button
                variant={!categorySlug ? "default" : "outline"}
                size="sm"
                className={`rounded-full whitespace-nowrap ${!categorySlug ? "bg-red-600 hover:bg-red-700" : "hover:bg-red-50 hover:text-red-600 hover:border-red-200"}`}
              >
                Tất cả
              </Button>
            </a>
            {cats.map(cat => (
              <a key={cat.id} href={`/san-pham?category=${cat.slug}`}>
                <Button
                  variant={categorySlug === cat.slug ? "default" : "outline"}
                  size="sm"
                  className={`rounded-full whitespace-nowrap ${categorySlug === cat.slug ? "bg-red-600 hover:bg-red-700" : "hover:bg-red-50 hover:text-red-600 hover:border-red-200"}`}
                >
                  {cat.name}
                </Button>
              </a>
            ))}
          </div>
        )}

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse shadow-sm">
                <div className="aspect-[4/3] bg-gray-100" />
                <div className="p-4 space-y-3">
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-4 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : data && data.items.length > 0 ? (
          <>
            {/* Result count */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-gray-500 font-medium">
                Hiển thị {(page - 1) * 12 + 1}-{Math.min(page * 12, data.total)} / {data.total} xe
              </span>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {data.items.map((moto) => (
                <div key={moto.id} className="animate-on-scroll">
                  <MotorcycleCard motorcycle={moto} />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-10">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => { setPage(p => p - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  className="h-9 rounded-lg"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let p: number;
                  if (totalPages <= 7) {
                    p = i + 1;
                  } else if (page <= 4) {
                    p = i + 1;
                  } else if (page >= totalPages - 3) {
                    p = totalPages - 6 + i;
                  } else {
                    p = page - 3 + i;
                  }
                  if (p < 1 || p > totalPages) return null;
                  return (
                    <Button
                      key={p}
                      variant={p === page ? "default" : "outline"}
                      size="sm"
                      className={`h-9 w-9 p-0 rounded-lg text-xs ${p === page ? "bg-red-600 hover:bg-red-700 shadow-sm" : ""}`}
                      onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    >
                      {p}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => { setPage(p => p + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  className="h-9 rounded-lg"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bike className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa tìm thấy xe phù hợp</h3>
            <p className="text-gray-500 text-sm mb-4">Thử thay đổi bộ lọc hoặc liên hệ 0335.111.777 để được tư vấn xe phù hợp nhu cầu.</p>
            {activeFilterCount > 0 && (
              <Button variant="outline" size="sm" onClick={clearAll} className="rounded-lg">
                Xóa bộ lọc
              </Button>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
