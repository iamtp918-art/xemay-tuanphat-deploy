import { useState } from "react";
import { trpc } from "@/lib/trpc";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { MapView } from "@/components/Map";
import { SHOP_ADDRESS, SHOP_PHONE_RAW, SHOP_COORDINATES, ZALO_URL } from "@shared/constants";
import { Phone, MapPin, Clock, Send, CheckCircle, MessageCircle, User, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function Contact() {
  useScrollAnimation();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const sendContact = trpc.contacts.create.useMutation({
    onSuccess: () => {
      setSent(true);
      setFullName(""); setPhone(""); setMessage("");
      toast.success("Gửi liên hệ thành công! Chúng tôi sẽ liên hệ lại sớm nhất.");
    },
    onError: () => toast.error("Có lỗi xảy ra. Vui lòng thử lại."),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      toast.error("Vui lòng điền họ tên và số điện thoại.");
      return;
    }
    sendContact.mutate({ fullName: fullName.trim(), phone: phone.trim(), message: message.trim() || undefined });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      {/* Banner */}
      <div className="bg-gradient-to-r from-gray-900 to-red-900 py-10 sm:py-12">
        <div className="container">
          <p className="text-red-300 text-xs sm:text-sm mb-2 font-medium">Trang chủ / Liên hệ</p>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">Liên Hệ Xe Máy Tuấn Phát</h1>
          <p className="text-gray-300 mt-1.5 text-sm">Gửi thông tin để được tư vấn miễn phí về xe máy, trả góp, bảo hành</p>
        </div>
      </div>

      <div className="container py-8 sm:py-10">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Form */}
          <div className="animate-on-scroll">
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
                  <Send className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Gửi Liên Hệ</h2>
                  <p className="text-[11px] text-gray-400">Chúng tôi sẽ phản hồi trong 15 phút</p>
                </div>
              </div>

              {sent ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Gửi thành công!</h3>
                  <p className="text-sm text-gray-500 mb-5">Chúng tôi sẽ liên hệ lại trong thời gian sớm nhất.</p>
                  <Button onClick={() => setSent(false)} className="bg-red-600 hover:bg-red-700 text-sm rounded-xl">
                    Gửi liên hệ khác
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Họ và tên *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Nhập họ tên của bạn"
                        className="pl-10 h-10 rounded-xl"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Số điện thoại *</label>
                    <div className="relative">
                      <PhoneCall className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Nhập số điện thoại"
                        type="tel"
                        className="pl-10 h-10 rounded-xl"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Nội dung</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Ví dụ: Tôi muốn tìm xe Wave RSX giá dưới 15 triệu, hỗ trợ trả góp..."
                      rows={4}
                      className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-50 resize-none transition-all"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-sm rounded-xl h-11 shadow-sm" disabled={sendContact.isPending}>
                    <Send className="w-4 h-4 mr-2" />
                    {sendContact.isPending ? "Đang gửi..." : "Gửi Liên Hệ"}
                  </Button>
                </form>
              )}
            </div>

            {/* Contact info cards */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <a href={`tel:${SHOP_PHONE_RAW}`} className="bg-white rounded-2xl p-4 border border-gray-100 text-center hover:shadow-md hover:border-red-100 transition-all group">
                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:bg-red-100 transition-colors">
                  <Phone className="w-5 h-5 text-red-600" />
                </div>
                <div className="text-[11px] text-gray-400 mb-0.5 font-medium">Hotline</div>
                <div className="text-sm font-bold text-gray-900 group-hover:text-red-600 transition-colors">0335.111.777</div>
              </a>
              <div className="bg-white rounded-2xl p-4 border border-gray-100 text-center">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-[11px] text-gray-400 mb-0.5 font-medium">Địa chỉ</div>
                <div className="text-xs font-semibold text-gray-900 leading-relaxed">{SHOP_ADDRESS}</div>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-gray-100 text-center">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Clock className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-[11px] text-gray-400 mb-0.5 font-medium">Giờ mở cửa</div>
                <div className="text-sm font-bold text-gray-900">7:30 - 19:00</div>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="animate-on-scroll delay-2">
            <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
              <div className="p-4 sm:p-5 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Bản Đồ Đường Đi</h2>
                <p className="text-xs text-gray-500 mt-0.5">{SHOP_ADDRESS}</p>
              </div>
              <MapView
                initialCenter={SHOP_COORDINATES}
                initialZoom={15}
                className="h-[350px] sm:h-[400px]"
              />
              <div className="p-3 sm:p-4 border-t border-gray-100 flex gap-2">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${SHOP_COORDINATES.lat},${SHOP_COORDINATES.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
                >
                  <MapPin className="w-4 h-4" />
                  Chỉ Đường
                </a>
                <a
                  href={ZALO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Zalo
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
