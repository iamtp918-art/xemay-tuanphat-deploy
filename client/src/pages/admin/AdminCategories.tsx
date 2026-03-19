import { useState } from "react";
import { trpc } from "@/lib/trpc";
import AdminLayout from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

function slugify(text: string) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "d").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function AdminCategories() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const utils = trpc.useUtils();

  const { data: categories, isLoading } = trpc.categories.list.useQuery();
  const createCat = trpc.categories.create.useMutation({ onSuccess: () => { utils.categories.invalidate(); setDialogOpen(false); toast.success("Thêm danh mục thành công"); } });
  const updateCat = trpc.categories.update.useMutation({ onSuccess: () => { utils.categories.invalidate(); setDialogOpen(false); toast.success("Cập nhật thành công"); } });
  const deleteCat = trpc.categories.delete.useMutation({ onSuccess: () => { utils.categories.invalidate(); toast.success("Xóa thành công"); } });

  const [form, setForm] = useState({ name: "", description: "", sortOrder: "0", isActive: true });

  const openCreate = () => { setEditing(null); setForm({ name: "", description: "", sortOrder: "0", isActive: true }); setDialogOpen(true); };
  const openEdit = (cat: any) => { setEditing(cat); setForm({ name: cat.name, description: cat.description || "", sortOrder: String(cat.sortOrder), isActive: cat.isActive }); setDialogOpen(true); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name: form.name, slug: slugify(form.name), description: form.description || undefined, sortOrder: Number(form.sortOrder), isActive: form.isActive };
    if (editing) updateCat.mutate({ id: editing.id, ...payload });
    else createCat.mutate(payload);
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Quản Lý Danh Mục</h1>
          <p className="text-sm text-gray-500 mt-0.5">{categories?.length ?? 0} danh mục</p>
        </div>
        <Button onClick={openCreate} className="bg-red-600 hover:bg-red-700 text-sm"><Plus className="w-4 h-4 mr-1" /> Thêm</Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="px-4 py-3 text-left">Tên</th>
              <th className="px-4 py-3 text-left hidden sm:table-cell">Mô tả</th>
              <th className="px-4 py-3 text-center">Thứ tự</th>
              <th className="px-4 py-3 text-center">Trạng thái</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? Array.from({ length: 3 }).map((_, i) => (
              <tr key={i}><td colSpan={5} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td></tr>
            )) : categories?.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{cat.name}</td>
                <td className="px-4 py-3 text-gray-500 hidden sm:table-cell line-clamp-1">{cat.description}</td>
                <td className="px-4 py-3 text-center text-gray-500">{cat.sortOrder}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${cat.isActive ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"}`}>
                    {cat.isActive ? "Hiện" : "Ẩn"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(cat)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => { if (confirm("Xóa danh mục này?")) deleteCat.mutate({ id: cat.id }); }}><Trash2 className="w-3.5 h-3.5 text-red-500" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Sửa Danh Mục" : "Thêm Danh Mục"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Tên danh mục *</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Mô tả</label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Thứ tự</label>
              <Input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded" />
              Hiển thị
            </label>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Hủy</Button>
              <Button type="submit" className="bg-red-600 hover:bg-red-700">{editing ? "Cập nhật" : "Thêm"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
