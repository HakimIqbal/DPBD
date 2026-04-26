import Link from "next/link"
import Image from "next/image"
import { Instagram, Mail, MapPin } from "lucide-react"

// Hardcoded footer data - managed via admin/editor settings
const contactInfo = {
  email: "dpbd@ppi.id",
  instagram: "dpbd.ppidunia",
  instagramUrl: "https://instagram.com/dpbd.ppidunia",
  address: "Sekretariat DPBD, Jakarta, Indonesia",
}

const socialLinks = [
  {
    icon: Instagram,
    href: "https://instagram.com/dpbd.ppidunia",
    label: "Instagram",
    bg: "hover:bg-gradient-to-br hover:from-purple-500 hover:to-pink-500",
  },
]

const quickLinks = [
  { label: "Beranda", href: "/" },
  { label: "Program", href: "/#program" },
  { label: "Transparansi", href: "/transparency" },
  { label: "Berita", href: "/berita" },
]

const dukunganLinks = [
  { label: "Cara Berdonasi", href: "/help/cara-donasi" },
  { label: "FAQ", href: "/#faq" },
  { label: "Hubungi Kami", href: "/contact" },
  { label: "Feedback", href: "/feedback" },
]

const legalLinks = [
  { label: "Kebijakan Privasi", href: "/privacy" },
  { label: "Syarat & Ketentuan", href: "/terms" },
  { label: "Kebijakan Refund", href: "/refund" },
]

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-5 group">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-gray-200 shadow-sm group-hover:border-[#5C1515]/30 transition-colors">
                <Image src="/logo-dpbd.png" alt="DPBD Logo" fill className="object-cover" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-[#5C1515] text-lg leading-tight">DPBD</span>
                <span className="text-xs text-gray-500 leading-tight">Direktorat Pengembangan Bisnis dan Dana Abadi</span>
              </div>
            </Link>

            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <a
                href={`mailto:${contactInfo.email}`}
                className="flex items-center gap-3 text-sm text-gray-600 hover:text-[#5C1515] transition-colors group"
              >
                <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-[#5C1515]/10 transition-colors shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                {contactInfo.email}
              </a>
              <a
                href={contactInfo.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-gray-600 hover:text-[#5C1515] transition-colors group"
              >
                <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-[#5C1515]/10 transition-colors shrink-0">
                  <Instagram className="w-4 h-4" />
                </div>
                @{contactInfo.instagram}
              </a>
              <div className="flex items-start gap-3 text-sm text-gray-600">
                <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="pt-2">{contactInfo.address}</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-5 text-sm uppercase tracking-wider">Navigasi</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-[#5C1515] transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5C1515]/30 group-hover:bg-[#5C1515] transition-colors shrink-0" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Dukungan Links */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-5 text-sm uppercase tracking-wider">Dukungan</h4>
            <ul className="space-y-3">
              {dukunganLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-[#5C1515] transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5C1515]/30 group-hover:bg-[#5C1515] transition-colors shrink-0" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-5 text-sm uppercase tracking-wider">Legal</h4>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-[#5C1515] transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5C1515]/30 group-hover:bg-[#5C1515] transition-colors shrink-0" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-center">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} DPBD - PPI Dunia. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
