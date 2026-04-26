import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-[#5C1515] to-[#8B2020] text-white py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Beranda
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Kebijakan Privasi</h1>
          <p className="text-white/70 text-sm">Terakhir diperbarui: 1 Januari 2025</p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="prose prose-gray max-w-none space-y-10">

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">1. Informasi yang Kami Kumpulkan</h2>
            <p className="text-gray-600 leading-relaxed mb-3">Kami mengumpulkan informasi berikut saat Anda menggunakan layanan DPBD:</p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#5C1515] mt-2 shrink-0" /><span><strong>Data Identitas:</strong> nama lengkap, alamat email, nomor telepon yang Anda berikan saat mendaftar atau berdonasi.</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#5C1515] mt-2 shrink-0" /><span><strong>Data Transaksi:</strong> nominal donasi, metode pembayaran, riwayat transaksi. Data kartu kredit/debit tidak pernah disimpan di server kami.</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#5C1515] mt-2 shrink-0" /><span><strong>Data Penggunaan:</strong> halaman yang dikunjungi, waktu akses, browser, dan perangkat yang digunakan.</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#5C1515] mt-2 shrink-0" /><span><strong>Data Lokasi:</strong> negara asal yang Anda cantumkan pada profil akun.</span></li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">2. Penggunaan Informasi</h2>
            <p className="text-gray-600 leading-relaxed mb-3">Informasi yang kami kumpulkan digunakan untuk:</p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#5C1515] mt-2 shrink-0" />Memproses dan mengkonfirmasi donasi Anda</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#5C1515] mt-2 shrink-0" />Mengirimkan bukti donasi, laporan, dan sertifikat</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#5C1515] mt-2 shrink-0" />Meningkatkan layanan dan pengalaman pengguna</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#5C1515] mt-2 shrink-0" />Memenuhi kewajiban hukum dan pelaporan keuangan</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#5C1515] mt-2 shrink-0" />Mengirimkan informasi program dan update kegiatan DPBD (dapat di-opt-out kapan saja)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">3. Keamanan Data</h2>
            <p className="text-gray-600 leading-relaxed">Kami menerapkan langkah-langkah keamanan standar industri termasuk enkripsi SSL/TLS untuk semua transmisi data, dan bekerja sama dengan Midtrans yang telah tersertifikasi PCI-DSS untuk pemrosesan pembayaran. Meskipun demikian, tidak ada metode transmisi data melalui internet yang 100% aman.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">4. Berbagi Data dengan Pihak Ketiga</h2>
            <p className="text-gray-600 leading-relaxed mb-3">Kami tidak menjual atau menyewakan data pribadi Anda kepada pihak ketiga. Data Anda hanya dibagikan kepada:</p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#5C1515] mt-2 shrink-0" /><span><strong>Midtrans</strong> sebagai payment gateway untuk memproses transaksi</span></li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#5C1515] mt-2 shrink-0" /><span><strong>Otoritas hukum</strong> jika diwajibkan oleh peraturan perundang-undangan yang berlaku</span></li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">5. Hak Pengguna</h2>
            <p className="text-gray-600 leading-relaxed mb-3">Anda memiliki hak untuk:</p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#5C1515] mt-2 shrink-0" />Mengakses dan memperbarui data pribadi Anda melalui pengaturan akun</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#5C1515] mt-2 shrink-0" />Meminta penghapusan akun dan data pribadi Anda</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#5C1515] mt-2 shrink-0" />Berhenti menerima email marketing kapan saja</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#5C1515] mt-2 shrink-0" />Mengajukan pertanyaan atau keluhan terkait privasi melalui <a href="mailto:privacy@dpbd.org" className="text-[#5C1515] underline">privacy@dpbd.org</a></li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">6. Cookie</h2>
            <p className="text-gray-600 leading-relaxed">Kami menggunakan cookie untuk meningkatkan pengalaman pengguna, menganalisis trafik website, dan menyimpan preferensi. Anda dapat mengatur browser untuk menolak cookie, namun beberapa fitur website mungkin tidak berfungsi optimal.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">7. Perubahan Kebijakan</h2>
            <p className="text-gray-600 leading-relaxed">Kami dapat memperbarui kebijakan privasi ini dari waktu ke waktu. Perubahan signifikan akan diberitahukan melalui email atau notifikasi di website. Penggunaan layanan setelah perubahan dianggap sebagai persetujuan terhadap kebijakan yang diperbarui.</p>
          </section>

          <div className="p-5 rounded-2xl bg-[#5C1515]/5 border border-[#5C1515]/10">
            <p className="text-sm text-gray-700">Pertanyaan tentang kebijakan privasi ini? Hubungi kami di <a href="mailto:privacy@dpbd.org" className="text-[#5C1515] font-medium underline">privacy@dpbd.org</a></p>
          </div>
        </div>
      </div>
    </main>
  )
}
