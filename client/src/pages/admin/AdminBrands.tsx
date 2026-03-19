import { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MOTORCYCLE_BRANDS } from "@shared/constants";
import { Plus, Pencil, Trash2, Bike } from "lucide-react";
import { toast } from "sonner";

const STORAGE_KEY = "custom_brands";

function getCustomBrands(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

function saveCustomBrands(brands: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(brands));
}

export default function AdminBrands() {
  const [customBrands, setCustomBrands] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [brandName, setBrandName] = useState("");

  useEffect(() => {
    setCustomBrands(getCustomBrands());
  }, []);

  const allBrands = [...MOTORCYCLE_BRANDS, ...customBrands];

  const handleAdd = () => {
    setEditingIndex(null);
    setBrandName("");
    setDialogOpen(true);
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setBrandName(customBrands[index]);
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim()) {
      toast.error("Vui lòng nhập tên hãng xe");
      return;
    }
    if (allBrands.includes(brandName.trim()) && editingIndex === null) {
      toast.error("Hãng xe đã tồn tại");
      return;
    }

    const newCustom = [...customBrands];
    if (editingIndex !== null) {
      newCustom[editingIndex] = brandName.trim();
    } else {
      newCustom.push(brandName.trim());
    }
    setCustomBrands(newCustom);
    saveCustomBrands(newCustom);
    setDialogOpen(false);
    toast.success(editingIndex !== null ? "Cập nhật thành công" : "Thêm hãng xe thành công");
  };

  const handleDelete = (index: number) => {
    if (!confirm("Xóa hãng xe này?")) return;
    const newCustom = customBrands.filter((_, i) => i !== index);
    setCustomBrands(newCustom);
    saveCustomBrands(newCustom);
    toast.success("Xóa thành công");
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Quản Lý Hãng Xe</h1>
          <p className="text-sm text-gray-500 mt-0.5">{allBrands.length} hãng xe</p>
        </div>
        <Button onClick={handleAdd} className="bg-red-600 hover:bg-red-700 text-sm">
          <Plus className="w-4 h-4 mr-1" /> Thêm Hãng Xe
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-sm text-gray-700">Hãng xe mặc định</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {MOTORCYCLE_BRANDS.map((brand, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Bike className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-900">{brand}</span>
              </div>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">Mặc định</span>
            </div>
          ))}
        </div>

        {customBrands.length > 0 && (
          <>
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <h3 className="font-semibold text-sm text-gray-700">Hãng xe tùy chỉnh</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {customBrands.map((brand, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                      <Bike className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">{brand}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(i)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(i)}><Trash2 className="w-3.5 h-3.5 text-red-500" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingIndex !== null ? "Sửa Hãng Xe" : "Thêm Hãng Xe Mới"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Tên hãng xe *</label>
              <Input value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="VD: Ducati, BMW..." required />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Hủy</Button>
              <Button type="submit" className="bg-red-600 hover:bg-red-700">
                {editingIndex !== null ? "Cập nhật" : "Thêm"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
