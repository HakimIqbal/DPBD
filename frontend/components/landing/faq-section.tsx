import Link from "next/link"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { HelpCircle } from "lucide-react"

const faqs = [
  {
    question: "Apa itu DPBD?",
    answer:
      "DPBD (Direktorat Pengembangan Bisnis dan Dana Abadi) adalah inisiatif pengelolaan dana kolektif yang bertujuan mengelola donasi secara profesional dan transparan untuk mendukung berbagai program pemberdayaan pelajar Indonesia di seluruh dunia.",
  },
  {
    question: "Bagaimana transparansi dana dijamin?",
    answer:
      "Kami menerapkan sistem pencatatan real-time untuk setiap transaksi. Laporan keuangan dipublikasikan setiap kuartal dan diaudit oleh akuntan publik independen. Donatur dapat melacak donasi mereka melalui dashboard personal, dan laporan penyaluran tersedia di halaman transparansi publik.",
  },
  {
    question: "Metode pembayaran apa saja yang tersedia?",
    answer:
      "Kami menerima donasi melalui Virtual Account (BCA, BNI, BRI, Mandiri) dan QRIS. Semua transaksi diproses melalui payment gateway yang tersertifikasi dan aman.",
  },
  {
    question: "Apakah saya bisa berdonasi secara anonim?",
    answer:
      "Ya, Anda dapat memilih untuk berdonasi secara anonim. Nama Anda tidak akan ditampilkan di daftar donatur publik, namun data tetap tercatat untuk keperluan pelaporan dan transparansi internal.",
  },
  {
    question: "Bagaimana cara kerja donasi bulanan?",
    answer:
      "Donasi bulanan memungkinkan Anda untuk memberikan kontribusi tetap setiap bulan secara otomatis. Anda dapat mengatur nominal dan memilih program yang ingin didukung. Pembatalan atau perubahan dapat dilakukan kapan saja melalui dashboard donatur.",
  },
  {
    question: "Siapa saja yang bisa menjadi penerima manfaat?",
    answer:
      "Penerima manfaat adalah pelajar Indonesia yang terdaftar di institusi pendidikan di luar negeri, alumni, keluarga pelajar yang membutuhkan, serta komunitas di Indonesia yang memenuhi kriteria program tertentu. Setiap penerima melalui proses seleksi dan verifikasi ketat.",
  },
  {
    question: "Bagaimana cara melihat dampak donasi saya?",
    answer:
      "Setelah login ke dashboard donatur, Anda dapat melihat riwayat donasi lengkap, program yang didukung, dan update berkala tentang perkembangan program. Kami juga mengirimkan laporan dampak via email setiap kuartal.",
  },
]

export function FaqSection() {
  return (
    <section id="faq" className="py-20 md:py-28 bg-[#f8f7f4]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#5C1515]/10 mb-4">
            <HelpCircle className="w-6 h-6 text-[#5C1515]" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#0A0A0A] mb-4">Pertanyaan yang Sering Diajukan</h2>
          <p className="text-[#6B6B4B] max-w-2xl mx-auto">
            Temukan jawaban untuk pertanyaan umum tentang DPBD dan proses donasi.
          </p>
        </div>

        {/* FAQ Accordion - Clean Professional Design */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#D4C896]/30 overflow-hidden">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border-b border-[#D4C896]/20 last:border-b-0"
              >
                <AccordionTrigger className="px-6 py-5 text-left hover:no-underline hover:bg-[#f8f7f4]/50 transition-colors group">
                  <span className="font-medium text-[#0A0A0A] group-hover:text-[#5C1515] transition-colors pr-4">
                    {faq.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-5 text-[#6B6B4B] leading-relaxed">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Contact CTA */}
        <div className="mt-10 text-center">
          <p className="text-[#6B6B4B]">
            Masih ada pertanyaan?{" "}
            <Link
              href="/contact"
              className="text-[#5C1515] font-medium hover:text-[#B30000] transition-colors"
            >
              Hubungi tim kami
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}
