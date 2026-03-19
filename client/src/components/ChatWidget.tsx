import { useState, useRef, useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { LOGO_URL, SHOP_PHONE_RAW, ZALO_URL } from "@shared/constants";
import { MessageCircle, X, Send, Headphones, Phone } from "lucide-react";
import { nanoid } from "nanoid";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [showQuickPanel, setShowQuickPanel] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [visible, setVisible] = useState(false);

  // Ẩn ChatWidget trên trang admin và staff
  const isAdminOrStaff = typeof window !== "undefined" && (window.location.pathname.startsWith("/admin") || window.location.pathname.startsWith("/staff"));
  if (isAdminOrStaff) return null;

  // Session persistence: lưu sessionId vào localStorage
  const [sessionId] = useState(() => {
    try {
      const stored = localStorage.getItem("chat_session_id");
      if (stored) return stored;
      const id = nanoid(16);
      localStorage.setItem("chat_session_id", id);
      return id;
    } catch {
      return nanoid(16);
    }
  });

  // Restore convId from localStorage
  const [convId, setConvId] = useState<number | null>(() => {
    try {
      const stored = localStorage.getItem("chat_conv_id");
      return stored ? parseInt(stored, 10) : null;
    } catch {
      return null;
    }
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const getOrCreate = trpc.chat.getOrCreate.useMutation();
  const sendMsg = trpc.chat.sendCustomerMessage.useMutation();

  const { data: chatMessages, refetch } = trpc.chat.getMessages.useQuery(
    { conversationId: convId! },
    {
      enabled: !!convId,
      refetchInterval: open ? 3000 : false,
    }
  );

  // Persist convId to localStorage
  useEffect(() => {
    if (convId) {
      try {
        localStorage.setItem("chat_conv_id", String(convId));
      } catch { /* ignore */ }
    }
  }, [convId]);

  // Delay 3s before showing the widget
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Initialize conversation when opening chat
  useEffect(() => {
    if (open && !convId) {
      getOrCreate.mutateAsync({ sessionId }).then((conv) => {
        if (conv) setConvId(conv.id);
      }).catch(console.error);
    }
    // Re-validate existing convId
    if (open && convId) {
      refetch();
    }
  }, [open]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, sending]);

  // Focus input when chat opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  const handleSend = useCallback(async () => {
    const trimmed = message.trim();
    if (!trimmed || sending) return;
    setSending(true);
    try {
      const result = await sendMsg.mutateAsync({
        sessionId,
        content: trimmed,
      });
      if (result.conversationId && !convId) {
        setConvId(result.conversationId);
      }
      setMessage("");
      // Refetch messages after a short delay to get AI response
      setTimeout(() => refetch(), 500);
      setTimeout(() => refetch(), 2000);
    } catch (e) {
      console.error("[Chat] Send error:", e);
    } finally {
      setSending(false);
    }
  }, [message, sending, sessionId, convId]);

  if (!visible) return null;

  return (
    <>
      <style>{`
        @keyframes widgetPopIn {
          0% { transform: scale(0); opacity: 0; }
          80% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes chatSlideUp {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      {/* Quick contact panel */}
      {showQuickPanel && !open && (
        <div className="fixed bottom-24 right-5 z-50 bg-white rounded-xl shadow-xl border border-gray-200 p-3 w-56" style={{ animation: "chatSlideUp 0.2s ease-out" }}>
          <a
            href={`tel:${SHOP_PHONE_RAW}`}
            className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center">
              <Phone className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">Gọi ngay</div>
              <div className="text-xs text-gray-500">0335.111.777</div>
            </div>
          </a>
          <a
            href={ZALO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">Nhắn Zalo</div>
              <div className="text-xs text-gray-500">0335.111.777</div>
            </div>
          </a>
          <button
            onClick={() => { setShowQuickPanel(false); setOpen(true); }}
            className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-lg transition-colors w-full"
          >
            <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-red-600" />
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold text-gray-900">Chat tư vấn</div>
              <div className="text-xs text-gray-500">Trả lời ngay</div>
            </div>
          </button>
        </div>
      )}

      {/* Toggle button */}
      {!open && (
        <button
          onClick={() => setShowQuickPanel(!showQuickPanel)}
          className="fixed bottom-5 right-5 z-50 bg-[#E53E3E] hover:bg-[#C53030] text-white w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-105"
          style={{ animation: "widgetPopIn 0.4s ease-out" }}
          aria-label="Liên hệ tư vấn"
        >
          {showQuickPanel ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7" />}
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div
          className="fixed bottom-0 right-0 sm:bottom-5 sm:right-5 z-50 w-full sm:w-[400px] h-full sm:h-[550px] sm:max-h-[80vh] bg-white sm:rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          style={{ animation: "chatSlideUp 0.3s ease-out" }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#E53E3E] to-[#C53030] text-white p-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-white/10 p-0.5">
                <img src={LOGO_URL} alt="" className="w-full h-full object-cover rounded-full" />
              </div>
              <div>
                <div className="font-bold text-sm">Xe Máy Tuấn Phát</div>
                <div className="text-[10px] text-red-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  Đang trực tuyến
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 scroll-smooth">
            {(!chatMessages || chatMessages.length === 0) && (
              <>
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full overflow-hidden shrink-0">
                    <img src={LOGO_URL} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="bg-white rounded-2xl rounded-bl-md px-3 py-2 text-sm text-gray-700 shadow-sm border border-gray-100 max-w-[80%]">
                    Dạ chào anh/chị! Em là tư vấn viên của Xe Máy Tuấn Phát. Anh/chị đang tìm xe gì ạ? Em hỗ trợ ngay ạ!
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pl-9">
                  {["Xem xe trả góp 0đ", "Xe tay ga giá rẻ", "Thủ tục mua xe", "Bảo hành thế nào?"].map((q) => (
                    <button
                      key={q}
                      onClick={async () => {
                        if (sending) return;
                        setSending(true);
                        try {
                          const result = await sendMsg.mutateAsync({ sessionId, content: q });
                          if (result.conversationId && !convId) setConvId(result.conversationId);
                          setTimeout(() => refetch(), 500);
                          setTimeout(() => refetch(), 2000);
                        } catch (e) { console.error("[Chat] Send error:", e); }
                        finally { setSending(false); }
                      }}
                      className="text-xs bg-white border border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 px-3 py-1.5 rounded-full transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </>
            )}
            {chatMessages?.map((msg, i) => (
              <div key={msg.id || i} className={`flex gap-2 ${msg.senderType === "customer" ? "flex-row-reverse" : ""}`}>
                {msg.senderType !== "customer" && (
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 overflow-hidden ${
                    msg.senderType === "staff" ? "bg-green-100" : ""
                  }`}>
                    {msg.senderType === "staff" ? (
                      <Headphones className="w-4 h-4 text-green-600" />
                    ) : (
                      <img src={LOGO_URL} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${
                  msg.senderType === "customer"
                    ? "bg-[#E53E3E] text-white rounded-br-md"
                    : msg.senderType === "staff"
                    ? "bg-green-50 text-gray-700 shadow-sm border border-green-200 rounded-bl-md"
                    : "bg-white text-gray-700 shadow-sm border border-gray-100 rounded-bl-md"
                }`}>
                  {msg.senderType === "staff" && (
                    <div className="text-[10px] text-green-600 font-medium mb-0.5">{msg.senderName || "Nhân viên"}</div>
                  )}
                  {msg.content}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full overflow-hidden shrink-0">
                  <img src={LOGO_URL} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="bg-white rounded-2xl rounded-bl-md px-4 py-2 shadow-sm border border-gray-100">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick actions */}
          <div className="px-3 py-2 border-t border-gray-100 bg-white flex gap-2 shrink-0">
            <button
              onClick={async () => {
                if (sending) return;
                setSending(true);
                try {
                  const result = await sendMsg.mutateAsync({ sessionId, content: "Tôi muốn nói chuyện với nhân viên tư vấn" });
                  if (result.conversationId && !convId) setConvId(result.conversationId);
                  setTimeout(() => refetch(), 500);
                  setTimeout(() => refetch(), 2000);
                } catch (e) { console.error("[Chat] Send error:", e); }
                finally { setSending(false); }
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-xs font-medium transition-colors"
            >
              <Headphones className="w-3 h-3" />
              Nhân viên
            </button>
            <a
              href={`tel:${SHOP_PHONE_RAW}`}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-xs font-medium transition-colors"
            >
              <Phone className="w-3 h-3" />
              Gọi ngay
            </a>
            <a
              href={ZALO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-medium transition-colors"
            >
              Zalo
            </a>
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-100 bg-white shrink-0">
            <form
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex gap-2"
            >
              <input
                ref={inputRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Nhập câu hỏi về xe máy..."
                className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-red-300 focus:ring-1 focus:ring-red-200"
                disabled={sending}
              />
              <button
                type="submit"
                data-chat-send
                disabled={!message.trim() || sending}
                className="bg-[#E53E3E] hover:bg-[#C53030] disabled:bg-gray-300 text-white p-2 rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
