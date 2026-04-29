import {
  Calculator,
  ClipboardCheck,
  Compass,
  Crown,
  Eye,
  Handshake,
  Info,
  LineChart,
  Scale,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react"

/**
 * Governance role displayed as a card. `name` is intentionally optional —
 * once an actual person is appointed, fill it in; until then it falls back
 * to "Akan Diumumkan".
 */
interface GovernanceRole {
  title: string
  description: string
  icon: LucideIcon
  /** Person currently filling the role. Empty string or undefined → "Akan Diumumkan". */
  name?: string
}

interface GovernanceGroup {
  category: string
  roles: GovernanceRole[]
}

/**
 * The full org chart for Dana Abadi PPI Dunia, grouped by function.
 * Order matters — visitors read top-to-bottom: who runs day-to-day
 * operations (Eksekutif), who manages the money (Pengelola), who watches
 * the watchers (Pengawasan), and who audits everything (Audit).
 *
 * When a real person is named, just fill in the `name` field — the
 * UI handles the empty-state automatically.
 */
const GOVERNANCE_GROUPS: GovernanceGroup[] = [
  {
    category: "Eksekutif",
    roles: [
      {
        title: "Direktur Utama (CEO)",
        description: "Ketua pelaksana operasional dana abadi.",
        icon: Crown,
      },
      {
        title: "Direktur Keuangan (CFO)",
        description:
          "Bertanggung jawab atas laporan keuangan dan kepatuhan.",
        icon: Calculator,
      },
    ],
  },
  {
    category: "Pengelola",
    roles: [
      {
        title: "Manajer Investasi",
        description: "Mengelola portofolio instrumen syariah.",
        icon: LineChart,
      },
      {
        title: "Manajer Risiko",
        description: "Memantau eksposur dan threshold risiko.",
        icon: ShieldAlert,
      },
      {
        title: "Onboarding Kemitraan",
        description: "Mengelola mitra dan kategori program.",
        icon: Handshake,
      },
    ],
  },
  {
    category: "Pengawasan",
    roles: [
      {
        title: "Dewan Pengawas",
        description:
          "Pengawasan periodik atas operasional dan laporan.",
        icon: Eye,
      },
      {
        title: "Dewan Pembina",
        description: "Arahan strategis jangka panjang.",
        icon: Compass,
      },
      {
        title: "Komite Etik",
        description:
          "Memastikan kepatuhan etika dalam setiap keputusan.",
        icon: Scale,
      },
    ],
  },
  {
    category: "Audit",
    roles: [
      {
        title: "Audit Independen",
        description:
          "Pemeriksaan eksternal atas laporan keuangan.",
        icon: ClipboardCheck,
      },
    ],
  },
]

export function AboutSection() {
  return (
    <section id="tentang" className="py-20 md:py-28 bg-[#f8f7f4]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-sm font-medium text-[#B30000] uppercase tracking-wider">
            Transparansi Tata Kelola
          </span>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold text-gray-900 leading-tight text-balance">
            Dikelola oleh Orang yang Tepat
          </h2>
          <p className="mt-4 text-lg text-gray-600 leading-relaxed text-pretty">
            Dana Abadi PPI Dunia dikelola oleh pengurus yang dipilih secara
            demokratis dari komunitas diaspora Indonesia di seluruh dunia,
            dengan pengawasan independen untuk memastikan amanah.
          </p>
        </div>

        {/* Governance groups — each rendered as a labelled subsection */}
        <div className="space-y-10">
          {GOVERNANCE_GROUPS.map((group) => (
            <GovernanceGroupView key={group.category} group={group} />
          ))}
        </div>

        {/* Transparency note */}
        <div className="mt-14 max-w-3xl mx-auto">
          <div className="flex items-start gap-3 p-5 rounded-xl bg-gradient-to-r from-[#D4C896]/20 to-[#D4C896]/5 border border-[#D4C896]/30">
            <Info
              className="w-5 h-5 text-[#5C1515] mt-0.5 flex-shrink-0"
              aria-hidden
            />
            <p className="text-sm text-gray-700 leading-relaxed">
              Struktur tata kelola ini merupakan bagian dari komitmen
              transparansi Dana Abadi PPI Dunia. Pengurus dipilih melalui
              mekanisme demokratis komunitas PPI Dunia.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

// ---- Helpers ---------------------------------------------------------------

function GovernanceGroupView({ group }: { group: GovernanceGroup }) {
  const isSingleton = group.roles.length === 1

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <h3 className="text-xs font-semibold text-[#5C1515] uppercase tracking-[0.18em]">
          {group.category}
        </h3>
        {/* Decorative rule that runs out from the label, mirrors the
            "section divider" treatment used elsewhere on the landing. */}
        <div className="flex-1 h-px bg-gradient-to-r from-[#5C1515]/30 to-transparent" />
      </div>

      {/*
        For single-card categories (Audit), constrain the width so the
        lonely card doesn't stretch awkwardly across the full row. For
        multi-card categories, use a responsive grid.
      */}
      {isSingleton ? (
        <div className="max-w-md mx-auto md:mx-0">
          <RoleCard role={group.roles[0]} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {group.roles.map((role) => (
            <RoleCard key={role.title} role={role} />
          ))}
        </div>
      )}
    </div>
  )
}

function RoleCard({ role }: { role: GovernanceRole }) {
  const Icon = role.icon
  // Treat empty string and undefined the same — easier for whoever fills
  // these in to leave the field blank rather than having to delete it.
  const displayName = role.name && role.name.trim() !== "" ? role.name : null

  return (
    <article className="group relative bg-white rounded-xl border border-gray-200/80 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 p-5">
      <div className="flex items-start gap-3 mb-3">
        <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-[#5C1515]/10 to-[#5C1515]/5 flex-shrink-0">
          <Icon className="w-5 h-5 text-[#5C1515]" aria-hidden />
        </div>
        <div className="min-w-0 pt-0.5">
          <h4 className="text-base font-semibold text-gray-900 leading-tight">
            {role.title}
          </h4>
          <p className="text-xs text-gray-400 italic mt-1">
            {displayName ?? "Akan Diumumkan"}
          </p>
        </div>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed">{role.description}</p>
    </article>
  )
}
