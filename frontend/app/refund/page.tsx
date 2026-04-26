import Link from "next/link"
import { ArrowLeft, AlertCircle, CheckCircle, XCircle } from "lucide-react"

const eligible = [
  "Donasi yang gagal diproses oleh sistem payment gateway (pembayaran terpotong namun status error)",
  "Donasi duplikat yang terjadi akibat kesalahan sistem (bukan kesalahan pengguna)",
  "Donasi yang dibatalkan sebelum batas waktu pembayaran",
]

const notEligible = [
  "Donasi yang telah berhasil disalurkan kepada penerima manfaat",
  "Donasi yang dibatalkan karena alasan pribadi setelah pembayaran berhasil",
  "Selisih kurs atau biaya konversi mata uang asing",
  "Biaya payment gateway yang mungkin dikenakan oleh bank penerbit kartu Anda",
]

const steps = [
  { step: 1, title: "Hubungi Kami", desc: "Kirim email ke refund@dpbd.org dengan subjek \"Permintaan Refund - [Order ID]\"" },
  { step: 2, title: "Sertakan Bukti", desc: "Lampirkan bukti transaksi (screenshot atau PDF) dan jelaskan alasan permintaan refund" },
  { step: 3, title: "Verifikasi", desc: "Tim kami akan memverifikasi permintaan Anda dalam 3 hari kerja" },
  { step: 4, title: "Proses Refund", desc: "Jika disetujui, refund diproses dalam 7-14 hari kerja ke metode pembayaran asal" },
]

export default function RefundPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-[#5C1515] to-[#8B2020] text-white py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Beranda
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Kebijakan Refund</h1>
          <p className="text-white/70 text-sm">Terakhir diperbarui: 1 Januari 2025</p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 py-16 space-y-10">

        {/* Important Notice */}
        <div className="flex items-start gap-4 p-5 rounded-2xl bg-amber-50 border border-amber-200">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 leading-relaxed">
            Karena sifat donasi sebagai amal, DPBD menerapkan kebijakan refund yang ketat. Kami mendorong Anda untuk mempertimbangkan donasi dengan matang sebelum melakukan pembayaran. Dana yang sudah disalurkan kepada penerima manfaat tidak dapat dikembalikan.
          </p>
        </div>

        {/* Eligible */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-xl bg-emerald-100">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Kondisi yang Memenuhi Syarat Refund</h2>
          </div>
          <div className="space-y-3">
            {eligible.map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl border border-emerald-100 bg-emerald-50/50">
                <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <p className="text-sm text-gray-700 leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Not Eligible */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-xl bg-red-100">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Kondisi yang Tidak Memenuhi Syarat Refund</h2>
          </div>
          <div className="space-y-3">
            {notEligible.map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl border border-red-100 bg-red-50/50">
                <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                <p className="text-sm text-gray-700 leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Process */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-6">Proses Pengajuan Refund</h2>
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

        {/* Timeline */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-5">Estimasi Waktu Proses</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { label: "Verifikasi Permohonan", time: "1–3 hari kerja" },
              { label: "Proses Refund (jika disetujui)", time: "7–14 hari kerja" },
              { label: "Dana Masuk ke Rekening", time: "Sesuai kebijakan bank" },
            ].map((item) => (
              <div key={item.label} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-center">
                <p className="text-lg font-bold text-[#5C1515]">{item.time}</p>
                <p className="text-sm text-gray-600 mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="p-5 rounded-2xl bg-[#5C1515]/5 border border-[#5C1515]/10">
          <p className="text-sm text-gray-700">Untuk mengajukan refund atau pertanyaan lebih lanjut, hubungi <a href="mailto:refund@dpbd.org" className="text-[#5C1515] font-medium underline">refund@dpbd.org</a></p>
        </div>
      </div>
    </main>
  )
}
