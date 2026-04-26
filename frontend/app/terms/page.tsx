import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-[#5C1515] to-[#8B2020] text-white py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Beranda
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Syarat & Ketentuan</h1>
          <p className="text-white/70 text-sm">Terakhir diperbarui: 1 Januari 2025</p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="space-y-10">

          <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200">
            <p className="text-sm text-amber-800 leading-relaxed">Dengan menggunakan layanan DPBD, Anda menyatakan telah membaca, memahami, dan menyetujui seluruh syarat dan ketentuan berikut.</p>
          </div>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">1. Tentang DPBD</h2>
            <p className="text-gray-600 leading-relaxed">Direktorat Pengembangan Bisnis dan Dana Abadi (DPBD) adalah platform donasi berbasis web yang memfasilitasi penyaluran donasi dari masyarakat kepada program-program yang mendukung diaspora Indonesia di seluruh dunia. DPBD beroperasi dengan prinsip transparansi dan akuntabilitas.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">2. Akun Pengguna</h2>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#5C1515] mt-2 shrink-0" />Anda bertanggung jawab menjaga kerahasiaan kredensial akun Anda</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#5C1515] mt-2 shrink-0" />Satu orang hanya diperbolehkan memiliki satu akun Personal</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#5C1515] mt-2 shrink-0" />Informasi yang Anda daftarkan harus akurat dan terkini</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#5C1515] mt-2 shrink-0" />DPBD berhak menangguhkan akun yang melanggar ketentuan ini</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">3. Ketentuan Donasi</h2>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#5C1515] mt-2 shrink-0" />Semua donasi yang masuk menjadi bagian dari dana general DPBD</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#5C1515] mt-2 shrink-0" />Donasi tidak langsung dialokasikan ke program tertentu secara otomatis</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#5C1515] mt-2 shrink-0" />Nominal donasi minimum Rp 10.000</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#5C1515] mt-2 shrink-0" />Bukti donasi dikirimkan ke email terdaftar setelah pembayaran berhasil</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#5C1515] mt-2 shrink-0" />DPBD tidak bertanggung jawab atas donasi yang gagal akibat kesalahan informasi dari pengguna</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">4. Penyaluran Dana</h2>
            <p className="text-gray-600 leading-relaxed mb-3">DPBD berkomitmen menyalurkan dana kepada penerima manfaat dengan proses:</p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#5C1515] mt-2 shrink-0" />Tim Finance mengajukan penyaluran berdasarkan kebutuhan program</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#5C1515] mt-2 shrink-0" />Admin memverifikasi dan menyetujui setiap pengajuan penyaluran</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#5C1515] mt-2 shrink-0" />Bukti transfer disimpan dan dapat diakses publik melalui halaman Transparansi</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">5. Larangan Penggunaan</h2>
            <p className="text-gray-600 leading-relaxed mb-3">Pengguna dilarang:</p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#5C1515] mt-2 shrink-0" />Menggunakan platform untuk tujuan pencucian uang atau aktivitas ilegal</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#5C1515] mt-2 shrink-0" />Mencoba mengakses sistem atau data yang tidak diotorisasi</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#5C1515] mt-2 shrink-0" />Menyebarkan informasi palsu atau menyesatkan terkait DPBD</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">6. Batasan Tanggung Jawab</h2>
            <p className="text-gray-600 leading-relaxed">DPBD tidak bertanggung jawab atas kerugian tidak langsung yang timbul dari penggunaan platform. Dalam kondisi force majeure (bencana alam, gangguan infrastruktur, dll), DPBD akan berupaya memulihkan layanan sesegera mungkin.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">7. Hukum yang Berlaku</h2>
            <p className="text-gray-600 leading-relaxed">Syarat dan ketentuan ini tunduk pada hukum yang berlaku di Republik Indonesia. Segala sengketa diselesaikan melalui musyawarah terlebih dahulu, dan jika tidak tercapai kesepakatan, melalui jalur hukum di pengadilan yang berwenang di Jakarta.</p>
          </section>

          <div className="p-5 rounded-2xl bg-[#5C1515]/5 border border-[#5C1515]/10">
            <p className="text-sm text-gray-700">Pertanyaan mengenai syarat dan ketentuan ini? Hubungi kami di <a href="mailto:legal@dpbd.org" className="text-[#5C1515] font-medium underline">legal@dpbd.org</a></p>
          </div>
        </div>
      </div>
    </main>
  )
}
