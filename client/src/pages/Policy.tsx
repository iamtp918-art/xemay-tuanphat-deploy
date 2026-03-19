import { trpc } from "@/lib/trpc";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useParams, Link } from "wouter";
import { ChevronRight, FileText, Phone, Shield, CreditCard, Repeat, BookOpen, Lock, ScrollText } from "lucide-react";
import { POLICY_TYPE_LABELS, SHOP_PHONE_RAW } from "@shared/constants";

const POLICY_ICONS: Record<string, any> = {
  warranty: Shield,
  installment: CreditCard,
  return: Repeat,
  privacy: Lock,
  terms: ScrollText,
  guide: BookOpen,
};

export default function Policy() {
  useScrollAnimation();
  const { slug } = useParams<{ slug: string }>();
  const { data: policy, isLoading } = trpc.policies.getBySlug.useQuery({ slug: slug || "" });
  const { data: allPolicies } = trpc.policies.list.useQuery({ activeOnly: true });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="container py-12">
          <div className="animate-pulse space-y-4 max-w-3xl mx-auto">
            <div className="h-8 bg-gray-200 rounded w-1/2" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!policy) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="container py-20 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-10 h-10 text-gray-300" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy chính sách</h2>
          <p className="text-gray-500 mb-4 text-sm">Chính sách này có thể đã bị xóa hoặc chưa được cập nhật.</p>
          <Link href="/" className="inline-flex items-center gap-2 text-red-600 font-semibold hover:text-red-700 bg-red-50 px-4 py-2 rounded-lg">
            Quay lại trang chủ
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const Icon = POLICY_ICONS[policy.type] || FileText;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      {/* Hero banner */}
      <div className="bg-gradient-to-r from-gray-900 to-red-900 py-10">
        <div className="container">
          <div className="flex items-center gap-2 text-red-300 text-xs sm:text-sm mb-3">
            <Link href="/" className="hover:text-white transition-colors">Trang chủ</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white font-medium">{policy.title}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <Icon className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white">{policy.title}</h1>
              <p className="text-gray-300 text-sm mt-0.5">{POLICY_TYPE_LABELS[policy.type] || policy.type} — Xe Máy Tuấn Phát</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm sticky top-24">
              <h3 className="font-bold text-gray-900 text-sm mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-red-500" />
                Chính sách khác
              </h3>
              <div className="space-y-1.5">
                {allPolicies?.map((p) => {
                  const PIcon = POLICY_ICONS[p.type] || FileText;
                  return (
                    <Link
                      key={p.id}
                      href={`/chinh-sach/${p.slug}`}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                        p.slug === slug
                          ? "bg-red-50 text-red-600 font-semibold"
                          : "text-gray-600 hover:bg-gray-50 hover:text-red-600"
                      }`}
                    >
                      <PIcon className="w-4 h-4 shrink-0" />
                      <span className="line-clamp-1">{p.title}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm">
              <style>{`
                .policy-content {
                  font-size: 15px;
                  line-height: 1.8;
                  color: #1A1A1A;
                }
                .policy-content h2 {
                  font-size: 1.35rem;
                  font-weight: 800;
                  color: #E53E3E;
                  margin-bottom: 1rem;
                  margin-top: 0;
                }
                .policy-content h3 {
                  font-size: 1.05rem;
                  font-weight: 700;
                  color: #1A1A1A;
                  margin-top: 1.5rem;
                  margin-bottom: 0.5rem;
                }
                .policy-content p {
                  margin-bottom: 0.75rem;
                  color: #333;
                }
                .policy-content ul, .policy-content ol {
                  margin-bottom: 0.75rem;
                  padding-left: 1.5rem;
                }
                .policy-content li {
                  margin-bottom: 0.35rem;
                  color: #444;
                }
                .policy-content strong {
                  color: #1A1A1A;
                }
                .policy-content em {
                  color: #666;
                }
                .policy-content a {
                  color: #E53E3E;
                  text-decoration: underline;
                }
                .policy-content a:hover {
                  color: #C53030;
                }
                .policy-content table {
                  width: 100%;
                  border-collapse: collapse;
                  margin: 1rem 0;
                }
                .policy-content th, .policy-content td {
                  border: 1px solid #E5E5E5;
                  padding: 0.5rem 0.75rem;
                  text-align: left;
                  font-size: 14px;
                }
                .policy-content th {
                  background: #F9F9F9;
                  font-weight: 600;
                }
              `}</style>
              <div className="policy-content" dangerouslySetInnerHTML={{ __html: policy.content }} />
            </div>

            {/* Contact CTA */}
            <div className="mt-6 bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 border border-red-100">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-bold text-gray-900 text-base mb-1">Cần tư vấn thêm?</h3>
                  <p className="text-sm text-gray-500">Liên hệ ngay để được hỗ trợ chi tiết về chính sách</p>
                </div>
                <a
                  href={`tel:${SHOP_PHONE_RAW}`}
                  className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm shadow-lg shadow-red-600/20 shrink-0"
                >
                  <Phone className="w-4 h-4" /> Gọi 0335.111.777
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
