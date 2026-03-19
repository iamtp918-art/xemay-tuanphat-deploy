import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, User, Headphones, MessageCircle, ArrowLeft, Phone, Bot, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";
import { LOGO_URL } from "@shared/constants";

export default function StaffChat() {
  const [selectedConv, setSelectedConv] = useState<number | null>(null);
  const [reply, setReply] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const utils = trpc.useUtils();

  // Lấy tên nhân viên từ localStorage (set khi đăng nhập staff)
  const staffName = (() => {
    try {
      const staffInfo = localStorage.getItem("staff_info");
      if (staffInfo) return JSON.parse(staffInfo).name || "Nhân viên";
    } catch {}
    return "Nhân viên";
  })();

  const staffId = (() => {
    try {
      const staffInfo = localStorage.getItem("staff_info");
      if (staffInfo) return JSON.parse(staffInfo).id || "staff";
    } catch {}
    return "staff";
  })();

  const { data: conversations, refetch: refetchConvs } = trpc.chat.conversations.useQuery(undefined, { refetchInterval: 5000 });
  const { data: messages, refetch: refetchMessages } = trpc.chat.getMessages.useQuery(
    { conversationId: selectedConv! },
    { enabled: !!selectedConv, refetchInterval: 3000 }
  );
  const sendMsg = trpc.chat.sendMessage.useMutation({
    onSuccess: () => { refetchMessages(); setReply(""); utils.chat.conversations.invalidate(); }
  });
  const updateStatus = trpc.chat.updateStatus.useMutation({
    onSuccess: () => { utils.chat.conversations.invalidate(); refetchMessages(); toast.success("Đã cập nhật"); }
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!reply.trim() || !selectedConv) return;
    sendMsg.mutate({ conversationId: selectedConv, content: reply.trim(), senderType: "staff", senderName: staffName });
  };

  const handleTakeOver = (convId: number) => {
    updateStatus.mutate({ id: convId, status: "staff", staffId: staffId });
    setSelectedConv(convId);
  };

  const statusLabels: Record<string, string> = { ai: "AI đang trả lời", waiting_staff: "Chờ nhân viên", staff: "Nhân viên", closed: "Đã đóng" };
  const statusColors: Record<string, string> = { ai: "bg-blue-50 text-blue-600", waiting_staff: "bg-yellow-50 text-yellow-600 animate-pulse", staff: "bg-green-50 text-green-600", closed: "bg-gray-100 text-gray-500" };

  const activeConvs = conversations?.filter(c => c.status !== "closed") || [];
  const closedConvs = conversations?.filter(c => c.status === "closed") || [];
  const waitingCount = conversations?.filter(c => c.status === "waiting_staff").length || 0;
  const selectedConvData = conversations?.find(c => c.id === selectedConv);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-30">
        <Link href="/admin" className="flex items-center gap-2">
          <img src={LOGO_URL} alt="" className="w-8 h-8 rounded-full object-cover" />
          <div>
            <div className="font-bold text-sm text-gray-900">Xe Máy Tuấn Phát</div>
            <div className="text-[10px] text-gray-500">Hệ thống chat nhân viên</div>
          </div>
        </Link>
        <div className="flex-1" />
        {waitingCount > 0 && (
          <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full font-medium animate-pulse">
            {waitingCount} đang chờ
          </span>
        )}
        <Button variant="outline" size="sm" onClick={() => refetchConvs()} className="text-xs">
          <RefreshCw className="w-3 h-3" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-sm text-gray-600">{staffName}</span>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - conversation list */}
        <div className={`w-80 bg-white border-r border-gray-200 flex flex-col ${selectedConv ? "hidden md:flex" : "flex"} flex-1 md:flex-none`}>
          <div className="p-3 border-b border-gray-100">
            <h2 className="font-bold text-sm text-gray-900">Hội thoại ({activeConvs.length} đang mở)</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {activeConvs.length === 0 && closedConvs.length === 0 && (
              <div className="p-6 text-center text-sm text-gray-400">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                Chưa có cuộc hội thoại nào
              </div>
            )}
            {activeConvs.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConv(conv.id)}
                className={`w-full text-left p-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${selectedConv === conv.id ? "bg-red-50 border-l-2 border-l-red-600" : ""}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {conv.customerName || `Khách #${conv.id}`}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${statusColors[conv.status || "ai"]}`}>
                    {statusLabels[conv.status || "ai"]}
                  </span>
                </div>
                <p className="text-xs text-gray-400 truncate">{conv.lastMessage || "..."}</p>
                <p className="text-[10px] text-gray-300 mt-0.5">{new Date(conv.updatedAt).toLocaleString("vi-VN")}</p>
              </button>
            ))}
            {closedConvs.length > 0 && (
              <>
                <div className="p-2 bg-gray-50 text-xs text-gray-500 font-medium">Đã đóng ({closedConvs.length})</div>
                {closedConvs.slice(0, 10).map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConv(conv.id)}
                    className={`w-full text-left p-3 border-b border-gray-50 hover:bg-gray-50 transition-colors opacity-60 ${selectedConv === conv.id ? "bg-gray-100" : ""}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 truncate">{conv.customerName || `Khách #${conv.id}`}</span>
                    </div>
                    <p className="text-xs text-gray-400 truncate">{conv.lastMessage || "..."}</p>
                  </button>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className={`flex-1 flex flex-col ${selectedConv ? "flex" : "hidden md:flex"}`}>
          {selectedConv ? (
            <>
              <div className="p-3 bg-white border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button onClick={() => setSelectedConv(null)} className="md:hidden p-1 hover:bg-gray-100 rounded">
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <MessageCircle className="w-4 h-4 text-red-600" />
                  <div>
                    <span className="font-semibold text-sm text-gray-900">
                      {selectedConvData?.customerName || `Khách #${selectedConv}`}
                    </span>
                    {selectedConvData?.customerPhone && (
                      <span className="text-xs text-gray-400 ml-2">
                        <Phone className="w-3 h-3 inline" /> {selectedConvData.customerPhone}
                      </span>
                    )}
                  </div>
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
                    <Button size="sm" variant="outline" className="text-xs" onClick={() => updateStatus.mutate({ id: selectedConv, status: "ai" })}>
                      Mở lại
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" className="text-xs" onClick={() => updateStatus.mutate({ id: selectedConv, status: "closed" })}>
                      Đóng
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {messages?.map((msg, i) => (
                  <div key={i} className={`flex gap-2 ${msg.senderType === "customer" ? "" : "flex-row-reverse"}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                      msg.senderType === "customer" ? "bg-gray-200" : msg.senderType === "staff" ? "bg-green-100" : "bg-blue-100"
                    }`}>
                      {msg.senderType === "customer" ? (
                        <User className="w-3.5 h-3.5 text-gray-500" />
                      ) : msg.senderType === "staff" ? (
                        <Headphones className="w-3.5 h-3.5 text-green-600" />
                      ) : (
                        <Bot className="w-3.5 h-3.5 text-blue-600" />
                      )}
                    </div>
                    <div className={`max-w-[70%] rounded-2xl px-3 py-2 text-sm ${
                      msg.senderType === "customer" ? "bg-white border border-gray-100 text-gray-700 rounded-bl-md" :
                      msg.senderType === "staff" ? "bg-green-600 text-white rounded-br-md" :
                      "bg-blue-600 text-white rounded-br-md"
                    }`}>
                      <div className="text-[10px] opacity-70 mb-0.5">
                        {msg.senderType === "customer" ? "Khách" : msg.senderType === "staff" ? msg.senderName || "NV" : "AI Bot"}
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

              {selectedConvData?.status === "closed" ? (
                <div className="p-3 bg-white border-t border-gray-200 text-center text-sm text-gray-400">
                  Cuộc hội thoại đã đóng
                </div>
              ) : (
                <div className="p-3 bg-white border-t border-gray-200">
                  <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
                    <Input value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Nhập tin nhắn trả lời khách..." className="flex-1" />
                    <Button type="submit" className="bg-red-600 hover:bg-red-700" disabled={!reply.trim() || sendMsg.isPending}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">Chọn một cuộc hội thoại để bắt đầu</p>
                <p className="text-xs text-gray-300 mt-1">Tin nhắn từ khách hàng sẽ hiển thị ở đây</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
