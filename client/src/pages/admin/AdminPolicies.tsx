import { useState } from "react";
import { trpc } from "@/lib/trpc";
import AdminLayout from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { POLICY_TYPE_LABELS } from "@shared/constants";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

function slugify(text: string) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "d").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function AdminPolicies() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const utils = trpc.useUtils();

  const { data: policies, isLoading } = trpc.policies.list.useQuery();
  const createPolicy = trpc.policies.create.useMutation({ onSuccess: () => { utils.policies.invalidate(); setDialogOpen(false); toast.success("Thêm chính sách thành công"); } });
  const updatePolicy = trpc.policies.update.useMutation({ onSuccess: () => { utils.policies.invalidate(); setDialogOpen(false); toast.success("Cập nhật thành công"); } });
  const deletePolicy = trpc.policies.delete.useMutation({ onSuccess: () => { utils.policies.invalidate(); toast.success("Đã xóa"); } });

  const [form, setForm] = useState({ title: "", content: "", type: "warranty" as string, sortOrder: "0", isActive: true });

  const openCreate = () => { setEditing(null); setForm({ title: "", content: "", type: "warranty", sortOrder: "0", isActive: true }); setDialogOpen(true); };
  const openEdit = (p: any) => { setEditing(p); setForm({ title: p.title, content: p.content, type: p.type, sortOrder: String(p.sortOrder), isActive: p.isActive }); setDialogOpen(true); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { title: form.title, slug: slugify(form.title), content: form.content, type: form.type as any, sortOrder: Number(form.sortOrder), isActive: form.isActive };
    if (editing) updatePolicy.mutate({ id: editing.id, ...payload });
    else createPolicy.mutate(payload);
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Quản Lý Chính Sách</h1>
          <p className="text-sm text-gray-500 mt-0.5">{policies?.length ?? 0} chính sách</p>
        </div>
        <Button onClick={openCreate} className="bg-red-600 hover:bg-red-700 text-sm"><Plus className="w-4 h-4 mr-1" /> Thêm</Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="px-4 py-3 text-left">Tiêu đề</th>
              <th className="px-4 py-3 text-center hidden sm:table-cell">Loại</th>
              <th className="px-4 py-3 text-center">Trạng thái</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? Array.from({ length: 3 }).map((_, i) => (
              <tr key={i}><td colSpan={4} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td></tr>
            )) : policies?.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{p.title}</td>
                <td className="px-4 py-3 text-center hidden sm:table-cell">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{POLICY_TYPE_LABELS[p.type] || p.type}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${p.isActive ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"}`}>
                    {p.isActive ? "Hiện" : "Ẩn"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(p)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => { if (confirm("Xóa chính sách này?")) deletePolicy.mutate({ id: p.id }); }}><Trash2 className="w-3.5 h-3.5 text-red-500" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Sửa Chính Sách" : "Thêm Chính Sách"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Tiêu đề *</label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Loại *</label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(POLICY_TYPE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Nội dung * (hỗ trợ HTML)</label>
              <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={12} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-300 resize-none font-mono" required />
            </div>
            <div className="flex items-center gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Thứ tự</label>
                <Input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} className="w-24" />
              </div>
              <label className="flex items-center gap-2 text-sm mt-5">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded" />
                Hiển thị
              </label>
            </div>
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
