import Link from "next/link"
import { ArrowLeft, CreditCard, Smartphone, Building2, QrCode, CheckCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const steps = [
  {
    step: 1,
    title: "Pilih Program",
    desc: "Kunjungi halaman Program dan pilih program yang ingin Anda dukung, atau langsung klik tombol Donasi Sekarang.",
  },
  {
    step: 2,
    title: "Isi Nominal",
    desc: "Masukkan jumlah donasi yang ingin Anda berikan. Anda bisa memilih nominal yang tersedia atau memasukkan nominal bebas.",
  },
  {
    step: 3,
    title: "Isi Data Diri",
    desc: "Lengkapi nama, email, dan nomor telepon. Anda juga bisa berdonasi secara anonim jika tidak ingin nama ditampilkan.",
  },
  {
    step: 4,
    title: "Pilih Metode Bayar",
    desc: "Pilih metode pembayaran yang tersedia: Transfer Bank, QRIS, GoPay, OVO, atau Kartu Kredit/Debit.",
  },
  {
    step: 5,
    title: "Selesaikan Pembayaran",
    desc: "Ikuti instruksi pembayaran sesuai metode yang dipilih. Konfirmasi otomatis dikirim ke email Anda.",
  },
]

const methods = [
  {
    icon: Building2,
    title: "Transfer Bank (VA)",
    items: ["BCA Virtual Account", "Mandiri Virtual Account", "BNI Virtual Account", "BRI Virtual Account"],
  },
  {
    icon: QrCode,
    title: "QRIS",
    items: ["Scan QR dari aplikasi apapun", "GoPay, OVO, Dana, ShopeePay", "Mobile banking BCA, Mandiri, dll", "Berlaku 15 menit setelah dibuat"],
  },
  {
    icon: Smartphone,
    title: "Dompet Digital",
    items: ["GoPay", "OVO", "Dana", "ShopeePay"],
  },
  {
    icon: CreditCard,
    title: "Kartu Kredit/Debit",
    items: ["Visa", "Mastercard", "American Express", "JCB"],
  },
]

const faqs = [
  {
    q: "Apakah donasi saya aman?",
    a: "Ya. Seluruh transaksi diproses oleh Midtrans, payment gateway resmi yang telah tersertifikasi PCI-DSS. Data kartu Anda tidak pernah disimpan di server kami.",
  },
  {
    q: "Apakah ada biaya admin?",
    a: "Tidak ada biaya admin yang dipotong dari donasi Anda. Biaya payment gateway ditanggung oleh DPBD agar 100% donasi Anda tersalurkan.",
  },
  {
    q: "Berapa lama verifikasi donasi?",
    a: "Transfer bank diverifikasi otomatis dalam 1x24 jam. QRIS dan dompet digital diverifikasi langsung.",
  },
  {
    q: "Bisakah saya mendapat bukti donasi?",
    a: "Ya. Bukti donasi dikirim otomatis ke email Anda setelah pembayaran berhasil. Anda juga bisa mengunduhnya dari dashboard akun.",
  },
]

export default function CaraDonasiPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#5C1515] to-[#8B2020] text-white py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Beranda
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-balance">Cara Berdonasi</h1>
          <p className="text-white/80 max-w-xl">Berdonasi di DPBD mudah, aman, dan transparan. Ikuti langkah-langkah berikut.</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-16 space-y-16">
        {/* Steps */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Langkah-Langkah Donasi</h2>
          <div className="space-y-4">
            {steps.map((s) => (
              <div key={s.step} className="flex gap-5 p-5 rounded-2xl border border-gray-100 hover:border-[#5C1515]/20 hover:bg-[#5C1515]/5 transition-colors">
                <div className="w-10 h-10 rounded-full bg-[#5C1515] text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {s.step}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{s.title}</p>
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Payment Methods */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Metode Pembayaran</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {methods.map((m) => (
              <Card key={m.title} className="border-gray-100">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 rounded-xl bg-[#5C1515]/10">
                      <m.icon className="w-5 h-5 text-[#5C1515]" />
                    </div>
                    <h3 className="font-semibold text-gray-900">{m.title}</h3>
                  </div>
                  <ul className="space-y-2">
                    {m.items.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Pertanyaan Umum</h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="p-5 rounded-2xl bg-gray-50 border border-gray-100">
                <p className="font-semibold text-gray-900 mb-2">{faq.q}</p>
                <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-br from-[#5C1515] to-[#8B2020] rounded-2xl p-8 text-white text-center">
          <h3 className="text-xl font-bold mb-2">Siap Berdonasi?</h3>
          <p className="text-white/80 mb-6 text-sm">Donasi Anda memberikan dampak nyata bagi diaspora Indonesia.</p>
          <Button asChild className="bg-[#D4C896] hover:bg-[#D4C896]/90 text-[#5C1515] font-semibold rounded-full px-8">
            <Link href="/donate">
              Donasi Sekarang
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </section>
      </div>
    </main>
  )
}
