import { useState } from "react";
import { trpc } from "@/lib/trpc";
import AdminLayout from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Phone, Trash2, Eye, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export default function AdminContacts() {
  const [page, setPage] = useState(1);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.contacts.list.useQuery({ page, limit: 20 });
  const updateStatus = trpc.contacts.updateStatus.useMutation({ onSuccess: () => { utils.contacts.invalidate(); toast.success("Cập nhật trạng thái"); } });
  const deleteContact = trpc.contacts.delete.useMutation({ onSuccess: () => { utils.contacts.invalidate(); toast.success("Đã xóa"); } });

  const statusColors: Record<string, string> = {
    new: "bg-red-50 text-red-600",
    read: "bg-yellow-50 text-yellow-600",
    replied: "bg-green-50 text-green-600",
  };
  const statusLabels: Record<string, string> = { new: "Mới", read: "Đã xem", replied: "Đã trả lời" };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Quản Lý Liên Hệ</h1>
        <p className="text-sm text-gray-500 mt-0.5">{data?.total ?? 0} liên hệ</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Họ tên</th>
                <th className="px-4 py-3 text-left">SĐT</th>
                <th className="px-4 py-3 text-left hidden md:table-cell">Nội dung</th>
                <th className="px-4 py-3 text-center">Trạng thái</th>
                <th className="px-4 py-3 text-left hidden sm:table-cell">Ngày</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td></tr>
              )) : data?.items.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{c.fullName}</td>
                  <td className="px-4 py-3">
                    <a href={`tel:${c.phone}`} className="text-blue-600 hover:underline flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {c.phone}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell max-w-xs truncate">{c.message || "-"}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[c.status] || ""}`}>
                      {statusLabels[c.status] || c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs hidden sm:table-cell">{new Date(c.createdAt).toLocaleDateString("vi-VN")}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => { setSelected(c); setDetailOpen(true); if (c.status === "new") updateStatus.mutate({ id: c.id, status: "read" }); }}>
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => { if (confirm("Xóa liên hệ này?")) deleteContact.mutate({ id: c.id }); }}>
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Chi Tiết Liên Hệ</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-3">
              <div><span className="text-sm text-gray-500">Họ tên:</span> <span className="font-medium">{selected.fullName}</span></div>
              <div><span className="text-sm text-gray-500">SĐT:</span> <a href={`tel:${selected.phone}`} className="text-blue-600 font-medium">{selected.phone}</a></div>
              <div><span className="text-sm text-gray-500">Nội dung:</span> <p className="text-sm mt-1">{selected.message || "Không có"}</p></div>
              <div><span className="text-sm text-gray-500">Ngày gửi:</span> <span className="text-sm">{new Date(selected.createdAt).toLocaleString("vi-VN")}</span></div>
              <div className="flex gap-2 pt-2">
                <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => { updateStatus.mutate({ id: selected.id, status: "replied" }); setDetailOpen(false); }}>
                  Đánh dấu đã trả lời
                </Button>
                <a href={`tel:${selected.phone}`}>
                  <Button size="sm" variant="outline"><Phone className="w-3.5 h-3.5 mr-1" /> Gọi</Button>
                </a>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
