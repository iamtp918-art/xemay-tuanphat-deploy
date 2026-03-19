import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import AdminLayout from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, User, Headphones, Bot, MessageCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function AdminChat() {
  const [selectedConv, setSelectedConv] = useState<number | null>(null);
  const [reply, setReply] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const utils = trpc.useUtils();

  const { data: conversations, refetch: refetchConvs } = trpc.chat.conversations.useQuery(undefined, { refetchInterval: 5000 });
  const { data: messages, refetch: refetchMessages } = trpc.chat.getMessages.useQuery(
    { conversationId: selectedConv! },
    { enabled: !!selectedConv, refetchInterval: 3000 }
  );
  const sendMsg = trpc.chat.sendMessage.useMutation({ onSuccess: () => { refetchMessages(); setReply(""); utils.chat.conversations.invalidate(); } });
  const updateStatus = trpc.chat.updateStatus.useMutation({ onSuccess: () => { utils.chat.conversations.invalidate(); refetchMessages(); toast.success("Đã cập nhật"); } });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!reply.trim() || !selectedConv) return;
    sendMsg.mutate({ conversationId: selectedConv, content: reply.trim(), senderType: "staff", senderName: "Quản Trị Viên" });
  };

  const handleTakeOver = (convId: number) => {
    updateStatus.mutate({ id: convId, status: "staff", staffId: "admin" });
    setSelectedConv(convId);
  };

  const handleClose = (convId: number) => {
    updateStatus.mutate({ id: convId, status: "closed" });
  };

  const handleReopen = (convId: number) => {
    updateStatus.mutate({ id: convId, status: "ai" });
  };

  const statusLabels: Record<string, string> = { ai: "AI đang trả lời", waiting_staff: "Chờ nhân viên", staff: "Nhân viên", closed: "Đã đóng" };
  const statusColors: Record<string, string> = { ai: "bg-blue-50 text-blue-600", waiting_staff: "bg-yellow-50 text-yellow-600 animate-pulse", staff: "bg-green-50 text-green-600", closed: "bg-gray-100 text-gray-500" };

  const selectedConvData = conversations?.find(c => c.id === selectedConv);

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Tin Nhắn Tư Vấn</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {conversations?.length ?? 0} cuộc hội thoại
            {conversations?.filter(c => c.status === "waiting_staff").length ? (
              <span className="ml-2 text-yellow-600 font-medium">
                ({conversations.filter(c => c.status === "waiting_staff").length} đang chờ nhân viên)
              </span>
            ) : null}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetchConvs()} className="text-xs">
          <RefreshCw className="w-3 h-3 mr-1" /> Làm mới
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 h-[calc(100vh-220px)]">
        {/* Conversation list */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-3 border-b border-gray-100 font-semibold text-sm text-gray-900">Danh sách</div>
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {conversations?.length === 0 && (
              <div className="p-6 text-center text-sm text-gray-400">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                Chưa có cuộc hội thoại nào
              </div>
            )}
            {conversations?.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConv(conv.id)}
                className={`w-full text-left p-3 hover:bg-gray-50 transition-colors ${selectedConv === conv.id ? "bg-red-50 border-l-2 border-red-500" : ""}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900 truncate">
                    #{conv.id} - {conv.customerName || "Khách"}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${statusColors[conv.status || "ai"]}`}>
                    {statusLabels[conv.status || "ai"]}
                  </span>
                </div>
                <p className="text-xs text-gray-400 truncate">{conv.lastMessage || "..."}</p>
                <p className="text-[10px] text-gray-300 mt-0.5">{new Date(conv.updatedAt).toLocaleString("vi-VN")}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          {selectedConv ? (
            <>
              <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-red-600" />
                  <span className="font-semibold text-sm text-gray-900">
                    Hội thoại #{selectedConv}
                    {selectedConvData?.customerPhone && (
                      <span className="ml-2 text-xs text-gray-400 font-normal">SĐT: {selectedConvData.customerPhone}</span>
                    )}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ml-2 ${statusColors[selectedConvData?.status || "ai"]}`}>
                    {statusLabels[selectedConvData?.status || "ai"]}
                  </span>
                </div>
                <div className="flex gap-2">
                  {selectedConvData?.status !== "staff" && selectedConvData?.status !== "closed" && (
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-xs" onClick={() => handleTakeOver(selectedConv)}>
                      <Headphones className="w-3 h-3 mr-1" /> Tiếp nhận
                    </Button>
                  )}
                  {selectedConvData?.status === "closed" ? (
                    <Button size="sm" variant="outline" className="text-xs" onClick={() => handleReopen(selectedConv)}>
                      Mở lại
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" className="text-xs" onClick={() => handleClose(selectedConv)}>
                      Đóng
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {messages?.map((msg, i) => (
                  <div key={i} className={`flex gap-2 ${msg.senderType === "customer" ? "" : "flex-row-reverse"}`}>
                    <div className={`max-w-[70%] rounded-2xl px-3 py-2 text-sm ${
                      msg.senderType === "customer" ? "bg-white border border-gray-100 text-gray-700 rounded-bl-md" :
                      msg.senderType === "staff" ? "bg-green-600 text-white rounded-br-md" :
                      "bg-blue-600 text-white rounded-br-md"
                    }`}>
                      <div className="text-[10px] opacity-70 mb-0.5 flex items-center gap-1">
                        {msg.senderType === "customer" ? (
                          <><User className="w-2.5 h-2.5" /> Khách</>
                        ) : msg.senderType === "staff" ? (
                          <><Headphones className="w-2.5 h-2.5" /> {msg.senderName || "NV"}</>
                        ) : (
                          <><Bot className="w-2.5 h-2.5" /> AI</>
                        )}
                      </div>
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                      <div className="text-[9px] opacity-50 mt-1 text-right">
                        {new Date(msg.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-3 border-t border-gray-100">
                {selectedConvData?.status === "closed" ? (
                  <div className="text-center text-sm text-gray-400 py-2">Cuộc hội thoại đã đóng</div>
                ) : (
                  <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
                    <Input value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Nhập tin nhắn..." className="flex-1" />
                    <Button type="submit" className="bg-red-600 hover:bg-red-700" disabled={!reply.trim() || sendMsg.isPending}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-sm gap-2">
              <MessageCircle className="w-12 h-12 text-gray-200" />
              <p>Chọn một cuộc hội thoại để xem</p>
              <p className="text-xs text-gray-300">Tin nhắn từ khách hàng sẽ hiển thị ở đây</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
