import { useState } from "react";
import { trpc } from "@/lib/trpc";
import AdminLayout from "./AdminLayout";
import ImageUploader from "@/components/ImageUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MOTORCYCLE_BRANDS } from "@shared/constants";
import { Plus, Pencil, Trash2, Search, Eye, EyeOff, Star, Bike, Filter } from "lucide-react";
import { toast } from "sonner";

function slugify(text: string) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "d").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function formatPrice(p: number) {
  if (p >= 1000000) return (p / 1000000).toFixed(p % 1000000 === 0 ? 0 : 1) + " triệu";
  return p.toLocaleString("vi-VN") + "đ";
}

const CONDITION_MAP: Record<string, string> = {
  like_new: "Như mới",
  good: "Tốt",
  fair: "Khá",
};

export default function AdminMotorcycles() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filterBrand, setFilterBrand] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [customBrand, setCustomBrand] = useState("");
  const [showCustomBrand, setShowCustomBrand] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const utils = trpc.useUtils();

  const queryInput: any = { page, limit: 10, search: search || undefined };
  if (filterBrand && filterBrand !== "all") queryInput.brand = filterBrand;

  const { data, isLoading } = trpc.motorcycles.list.useQuery(queryInput);
  const { data: cats } = trpc.categories.list.useQuery();
  const createMoto = trpc.motorcycles.create.useMutation({
    onSuccess: () => { utils.motorcycles.invalidate(); setDialogOpen(false); toast.success("Thêm xe thành công!"); },
    onError: (e) => toast.error("Lỗi: " + e.message),
  });
  const updateMoto = trpc.motorcycles.update.useMutation({
    onSuccess: () => { utils.motorcycles.invalidate(); setDialogOpen(false); toast.success("Cập nhật xe thành công!"); },
    onError: (e) => toast.error("Lỗi: " + e.message),
  });
  const deleteMoto = trpc.motorcycles.delete.useMutation({
    onSuccess: () => { utils.motorcycles.invalidate(); setDeleteConfirm(null); toast.success("Đã xóa xe"); },
    onError: (e) => toast.error("Lỗi: " + e.message),
  });

  const [form, setForm] = useState({
    name: "", brand: "Honda", price: "", originalPrice: "", condition: "good",
    year: "", mileage: "", engineSize: "", color: "", description: "",
    features: "", images: [] as string[], categoryId: "", isFeatured: false, isAvailable: true,
  });

  const openCreate = () => {
    setEditing(null);
    setShowCustomBrand(false);
    setCustomBrand("");
    setForm({
      name: "", brand: "Honda", price: "", originalPrice: "", condition: "good",
      year: "", mileage: "", engineSize: "", color: "", description: "",
      features: "", images: [], categoryId: "", isFeatured: false, isAvailable: true,
    });
    setDialogOpen(true);
  };

  const openEdit = (moto: any) => {
    setEditing(moto);
    const isKnownBrand = MOTORCYCLE_BRANDS.includes(moto.brand);
    setShowCustomBrand(!isKnownBrand);
    setCustomBrand(!isKnownBrand ? moto.brand : "");
    setForm({
      name: moto.name, brand: isKnownBrand ? moto.brand : "__custom__",
      price: String(moto.price), originalPrice: moto.originalPrice ? String(moto.originalPrice) : "",
      condition: moto.condition, year: moto.year ? String(moto.year) : "",
      mileage: moto.mileage ? String(moto.mileage) : "",
      engineSize: moto.engineSize || "", color: moto.color || "",
      description: moto.description || "", features: moto.features || "",
      images: moto.images ? moto.images.split(",").filter(Boolean) : [],
      categoryId: moto.categoryId ? String(moto.categoryId) : "",
      isFeatured: moto.isFeatured, isAvailable: moto.isAvailable,
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const brandValue = form.brand === "__custom__" ? customBrand.trim() : form.brand;
    if (!brandValue) {
      toast.error("Vui lòng chọn hoặc nhập hãng xe");
      return;
    }
    if (!form.name.trim()) {
      toast.error("Vui lòng nhập tên xe");
      return;
    }
    if (!form.price || Number(form.price) <= 0) {
      toast.error("Vui lòng nhập giá bán hợp lệ");
      return;
    }

    const payload: any = {
      name: form.name.trim(),
      slug: slugify(form.name.trim()),
      brand: brandValue,
      price: Number(form.price),
      condition: form.condition as any,
      isFeatured: form.isFeatured,
      isAvailable: form.isAvailable,
      images: form.images.join(","),
    };
    if (form.originalPrice) payload.originalPrice = Number(form.originalPrice);
    if (form.year) payload.year = Number(form.year);
    if (form.mileage) payload.mileage = Number(form.mileage);
    if (form.engineSize) payload.engineSize = form.engineSize;
    if (form.color) payload.color = form.color;
    if (form.description) payload.description = form.description;
    if (form.features) payload.features = form.features;
    if (form.categoryId) payload.categoryId = Number(form.categoryId);

    if (editing) updateMoto.mutate({ id: editing.id, ...payload });
    else createMoto.mutate(payload);
  };

  const totalPages = data ? Math.ceil(data.total / 10) : 0;

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <Bike className="w-6 h-6 text-red-500" />
            Quản Lý Xe Máy
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {data?.total ?? 0} xe trong kho
            {filterBrand !== "all" && <span className="text-red-500 ml-1">({filterBrand})</span>}
          </p>
        </div>
        <Button onClick={openCreate} className="bg-red-600 hover:bg-red-700 text-sm shadow-sm">
          <Plus className="w-4 h-4 mr-1.5" /> Thêm Xe Mới
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm mb-4">
        <div className="p-3 sm:p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Tìm theo tên xe, hãng..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-10 h-9"
            />
          </div>
          <Select value={filterBrand} onValueChange={(v) => { setFilterBrand(v); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-[160px] h-9">
              <Filter className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
              <SelectValue placeholder="Lọc hãng xe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả hãng</SelectItem>
              {MOTORCYCLE_BRANDS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50/80 text-gray-500 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Xe máy</th>
                <th className="px-4 py-3 text-left hidden md:table-cell font-semibold">Hãng</th>
                <th className="px-4 py-3 text-right font-semibold">Giá bán</th>
                <th className="px-4 py-3 text-center hidden sm:table-cell font-semibold">Tình trạng</th>
                <th className="px-4 py-3 text-center hidden sm:table-cell font-semibold">Trạng thái</th>
                <th className="px-4 py-3 text-right font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-10 bg-gray-100 rounded animate-pulse" />
                        <div className="flex-1 space-y-1.5">
                          <div className="h-3.5 bg-gray-100 rounded w-2/3 animate-pulse" />
                          <div className="h-2.5 bg-gray-50 rounded w-1/3 animate-pulse" />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : data?.items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <Bike className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">Chưa có xe nào</p>
                    <Button onClick={openCreate} variant="outline" size="sm" className="mt-3">
                      <Plus className="w-3.5 h-3.5 mr-1" /> Thêm xe đầu tiên
                    </Button>
                  </td>
                </tr>
              ) : data?.items.map((moto) => (
                <tr key={moto.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                        {moto.images ? (
                          <img
                            src={moto.images.split(",")[0]}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <Bike className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-gray-900 truncate max-w-[200px] sm:max-w-[300px] flex items-center gap-1.5">
                          {moto.isFeatured && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 shrink-0" />}
                          {moto.name}
                        </div>
                        <div className="text-[11px] text-gray-400 mt-0.5">
                          {moto.year && `${moto.year}`}
                          {moto.engineSize && ` • ${moto.engineSize}`}
                          {moto.color && ` • ${moto.color}`}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-xs font-medium bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                      {moto.brand}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="font-bold text-red-600">{formatPrice(moto.price)}</div>
                    {moto.originalPrice && moto.originalPrice > moto.price && (
                      <div className="text-[10px] text-gray-400 line-through">{formatPrice(moto.originalPrice)}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center hidden sm:table-cell">
                    <span className="text-[11px] font-medium text-gray-600">
                      {CONDITION_MAP[moto.condition] || moto.condition}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center hidden sm:table-cell">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
                      moto.isAvailable
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-gray-100 text-gray-500"
                    }`}>
                      {moto.isAvailable ? (
                        <><Eye className="w-3 h-3" /> Đang bán</>
                      ) : (
                        <><EyeOff className="w-3 h-3" /> Đã bán</>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-0.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(moto)}
                        className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                        title="Sửa"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteConfirm(moto.id)}
                        className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                        title="Xóa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
            <span className="text-xs text-gray-500">
              Trang {page}/{totalPages} ({data?.total} xe)
            </span>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" className="h-7 text-xs" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                ← Trước
              </Button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = page <= 3 ? i + 1 : page + i - 2;
                if (p < 1 || p > totalPages) return null;
                return (
                  <Button
                    key={p}
                    variant={p === page ? "default" : "outline"}
                    size="sm"
                    className={`h-7 w-7 text-xs p-0 ${p === page ? "bg-red-600 hover:bg-red-700" : ""}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </Button>
                );
              })}
              <Button variant="outline" size="sm" className="h-7 text-xs" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                Sau →
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirm !== null} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-600">Xác nhận xóa xe</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">Bạn có chắc chắn muốn xóa xe này? Hành động này không thể hoàn tác.</p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setDeleteConfirm(null)}>Hủy</Button>
            <Button
              size="sm"
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteConfirm && deleteMoto.mutate({ id: deleteConfirm })}
              disabled={deleteMoto.isPending}
            >
              {deleteMoto.isPending ? "Đang xóa..." : "Xóa xe"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              {editing ? (
                <><Pencil className="w-5 h-5 text-blue-500" /> Sửa Xe Máy</>
              ) : (
                <><Plus className="w-5 h-5 text-green-500" /> Thêm Xe Máy Mới</>
              )}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Section: Thông tin cơ bản */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Thông tin cơ bản</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Tên xe <span className="text-red-500">*</span></label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="VD: Honda Wave Alpha 110cc 2023" required className="h-9" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Hãng xe <span className="text-red-500">*</span></label>
                  <Select value={form.brand} onValueChange={(v) => {
                    if (v === "__custom__") {
                      setShowCustomBrand(true);
                      setForm({ ...form, brand: "__custom__" });
                    } else {
                      setShowCustomBrand(false);
                      setCustomBrand("");
                      setForm({ ...form, brand: v });
                    }
                  }}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {MOTORCYCLE_BRANDS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                      <SelectItem value="__custom__">+ Thêm hãng mới...</SelectItem>
                    </SelectContent>
                  </Select>
                  {showCustomBrand && (
                    <Input
                      value={customBrand}
                      onChange={(e) => setCustomBrand(e.target.value)}
                      placeholder="Nhập tên hãng xe mới"
                      className="mt-2 h-9"
                      required
                    />
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Danh mục</label>
                  <Select value={form.categoryId} onValueChange={(v) => setForm({ ...form, categoryId: v })}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Chọn danh mục" /></SelectTrigger>
                    <SelectContent>
                      {cats?.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Section: Giá & Tình trạng */}
            <div className="bg-red-50/50 rounded-lg p-4 space-y-3">
              <h3 className="text-xs font-bold text-red-600 uppercase tracking-wider">Giá & Tình trạng</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Giá bán <span className="text-red-500">*</span></label>
                  <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="VD: 15000000" required className="h-9" />
                  {form.price && <span className="text-[10px] text-red-500 mt-0.5 block">{formatPrice(Number(form.price))}</span>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Giá gốc</label>
                  <Input type="number" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} placeholder="Để trống nếu không giảm" className="h-9" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Tình trạng</label>
                  <Select value={form.condition} onValueChange={(v) => setForm({ ...form, condition: v })}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="like_new">Như mới</SelectItem>
                      <SelectItem value="good">Tốt</SelectItem>
                      <SelectItem value="fair">Khá</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Năm SX</label>
                  <Input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder="2024" className="h-9" />
                </div>
              </div>
            </div>

            {/* Section: Thông số kỹ thuật */}
            <div className="bg-blue-50/50 rounded-lg p-4 space-y-3">
              <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider">Thông số kỹ thuật</h3>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Dung tích</label>
                  <Input value={form.engineSize} onChange={(e) => setForm({ ...form, engineSize: e.target.value })} placeholder="110cc" className="h-9" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Số km đã đi</label>
                  <Input type="number" value={form.mileage} onChange={(e) => setForm({ ...form, mileage: e.target.value })} placeholder="15000" className="h-9" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Màu sắc</label>
                  <Input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} placeholder="Đen nhám" className="h-9" />
                </div>
              </div>
            </div>

            {/* Section: Hình ảnh */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <ImageUploader
                images={form.images}
                onChange={(imgs) => setForm({ ...form, images: imgs })}
              />
            </div>

            {/* Section: Mô tả */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Mô tả chi tiết</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-300 focus:ring-1 focus:ring-red-100 resize-none"
                  placeholder="Mô tả tình trạng xe, lịch sử bảo dưỡng..."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Tính năng (cách nhau bằng dấu phẩy)</label>
                <Input
                  value={form.features}
                  onChange={(e) => setForm({ ...form, features: e.target.value })}
                  placeholder="Phun xăng điện tử, Phanh đĩa, Khóa từ..."
                  className="h-9"
                />
              </div>
            </div>

            {/* Options */}
            <div className="flex flex-wrap gap-4 bg-gray-50 rounded-lg p-3">
              <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-red-600 transition-colors">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <Star className="w-3.5 h-3.5 text-yellow-500" />
                <span className="font-medium">Xe nổi bật</span>
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-green-600 transition-colors">
                <input
                  type="checkbox"
                  checked={form.isAvailable}
                  onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <Eye className="w-3.5 h-3.5 text-green-500" />
                <span className="font-medium">Đang bán</span>
              </label>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-2 pt-1 border-t border-gray-100">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="h-9">
                Hủy
              </Button>
              <Button
                type="submit"
                className="bg-red-600 hover:bg-red-700 h-9 min-w-[120px]"
                disabled={createMoto.isPending || updateMoto.isPending}
              >
                {createMoto.isPending || updateMoto.isPending ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Đang lưu...
                  </span>
                ) : editing ? "Cập nhật xe" : "Thêm xe mới"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
