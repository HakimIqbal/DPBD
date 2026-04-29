"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import {
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Trash2,
  Quote,
  Calendar,
  MapPin,
  User,
  Mail,
} from "lucide-react"
import { getInitials, getAvatarColor } from "@/lib/avatar-utils"

/**
 * Single testimonial/feedback record. The mock list below contains rows in
 * various lifecycle states — explicitly typing the array as `Feedback[]`
 * (rather than letting TS infer narrow object-literal types) means
 * subsequent state updates (e.g. flipping a `pending` row to `approved`
 * with a fresh `approvedAt`) don't fail the type-checker.
 *
 * Notable shape choices:
 *   - `photo: string | null`  — one rejected entry has photo: null.
 *   - `status` widened to a string union covering all three states.
 *   - `approvedAt` / `rejectedAt` / `rejectedReason` are optional and
 *     populated only after the corresponding state transition.
 */
interface Feedback {
  id: number
  name: string
  email: string
  phone: string
  category: string
  location: string
  testimonial: string
  photo: string | null
  status: "pending" | "approved" | "rejected"
  submittedAt: string
  approvedAt?: string
  rejectedAt?: string
  rejectedReason?: string
}

// Mock data for feedback/testimonials
const mockFeedback: Feedback[] = [
  {
    id: 1,
    name: "Andi Pratama",
    email: "andi.pratama@email.com",
    phone: "+62 812 3456 7890",
    category: "Penerima Beasiswa",
    location: "Alumni TU Munich, Jerman",
    testimonial:
      "Berkat beasiswa dari DPBD, saya bisa melanjutkan studi S2 di Jerman tanpa beban biaya. Sekarang saya sudah bekerja dan siap berkontribusi balik untuk membantu pelajar Indonesia lainnya.",
    photo: "/indonesian-male-entrepreneur-portrait.jpg",
    status: "pending",
    submittedAt: "2024-01-15T10:30:00Z",
  },
  {
    id: 2,
    name: "Siti Rahayu",
    email: "siti.rahayu@email.com",
    phone: "+62 856 7890 1234",
    category: "Penerima Dana UMKM",
    location: "Jakarta, Indonesia",
    testimonial:
      "Modal usaha dari DPBD membantu saya memulai bisnis katering sehat. Omzet kami sudah meningkat 3x lipat dalam setahun! Terima kasih DPBD atas kesempatan yang diberikan.",
    photo: "/indonesian-female-student-portrait.jpg",
    status: "approved",
    submittedAt: "2024-01-14T08:15:00Z",
    approvedAt: "2024-01-14T14:00:00Z",
  },
  {
    id: 3,
    name: "Dr. Budi Santoso",
    email: "budi.santoso@email.com",
    phone: "+61 400 123 456",
    category: "Donatur",
    location: "Sydney, Australia",
    testimonial:
      "Sebagai donatur rutin, saya sangat terkesan dengan transparansi DPBD. Saya bisa melihat langsung dampak donasi saya setiap bulan melalui laporan yang diberikan.",
    photo: "/indonesian-male-entrepreneur-portrait.jpg",
    status: "approved",
    submittedAt: "2024-01-13T16:45:00Z",
    approvedAt: "2024-01-13T18:30:00Z",
  },
  {
    id: 4,
    name: "Maya Putri",
    email: "maya.putri@email.com",
    phone: "+31 6 1234 5678",
    category: "Penerima Bantuan Darurat",
    location: "Mahasiswa di Belanda",
    testimonial:
      "Program bantuan darurat DPBD sangat cepat merespon saat saya mengalami kesulitan finansial. Mereka benar-benar peduli pada pelajar Indonesia di luar negeri.",
    photo: "/indonesian-female-professional-portrait.jpg",
    status: "pending",
    submittedAt: "2024-01-15T09:00:00Z",
  },
  {
    id: 5,
    name: "Ahmad Fauzi",
    email: "ahmad.fauzi@email.com",
    phone: "+62 878 9012 3456",
    category: "Relawan",
    location: "Surabaya, Indonesia",
    testimonial: "Testimoni ini terlalu pendek dan tidak sesuai.",
    photo: null,
    status: "rejected",
    submittedAt: "2024-01-12T11:20:00Z",
    rejectedAt: "2024-01-12T15:00:00Z",
    rejectedReason: "Testimoni terlalu pendek dan tidak memberikan detail yang cukup.",
  },
]

// `Feedback` interface is declared above the mock array; consumers pick
// it up via the explicitly-typed `Feedback[]` annotation on mockFeedback.

export default function EditorFeedbackPage() {
  const [feedback, setFeedback] = useState(mockFeedback)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const pendingFeedback = feedback.filter((f) => f.status === "pending")
  const approvedFeedback = feedback.filter((f) => f.status === "approved")
  const rejectedFeedback = feedback.filter((f) => f.status === "rejected")

  const filteredPending = pendingFeedback.filter(
    (f) =>
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.testimonial.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredApproved = approvedFeedback.filter(
    (f) =>
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.testimonial.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredRejected = rejectedFeedback.filter(
    (f) =>
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.testimonial.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleApprove = (id: number) => {
    setFeedback((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, status: "approved", approvedAt: new Date().toISOString() } : f
      )
    )
    setViewDialogOpen(false)
  }

  const handleReject = () => {
    if (!selectedFeedback || !rejectReason) return
    setFeedback((prev) =>
      prev.map((f) =>
        f.id === selectedFeedback.id
          ? { ...f, status: "rejected", rejectedAt: new Date().toISOString(), rejectedReason: rejectReason }
          : f
      )
    )
    setRejectDialogOpen(false)
    setRejectReason("")
    setViewDialogOpen(false)
  }

  const handleDelete = () => {
    if (!selectedFeedback) return
    setFeedback((prev) => prev.filter((f) => f.id !== selectedFeedback.id))
    setDeleteDialogOpen(false)
    setSelectedFeedback(null)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const FeedbackCard = ({ item }: { item: Feedback }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            {item.photo ? (
              <Image
                src={item.photo}
                alt={item.name}
                width={56}
                height={56}
                className="w-14 h-14 rounded-full object-cover"
              />
            ) : (
              <div className={`w-14 h-14 rounded-full flex items-center justify-center font-semibold text-sm ${getAvatarColor(item.name)}`}>
                {getInitials(item.name)}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-gray-900">{item.name}</h3>
                <p className="text-sm text-gray-500">{item.category}</p>
              </div>
              <Badge
                variant={
                  item.status === "approved"
                    ? "default"
                    : item.status === "rejected"
                      ? "destructive"
                      : "secondary"
                }
                className={item.status === "approved" ? "bg-green-100 text-green-800" : ""}
              >
                {item.status === "approved" ? "Disetujui" : item.status === "rejected" ? "Ditolak" : "Menunggu"}
              </Badge>
            </div>
            <p className="mt-2 text-sm text-gray-600 line-clamp-2">"{item.testimonial}"</p>
            <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {item.location}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(item.submittedAt)}
              </span>
            </div>
            <div className="mt-3 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedFeedback(item)
                  setViewDialogOpen(true)
                }}
              >
                <Eye className="w-4 h-4 mr-1" />
                Lihat Detail
              </Button>
              {item.status === "pending" && (
                <>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleApprove(item.id)}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Setujui
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      setSelectedFeedback(item)
                      setRejectDialogOpen(true)
                    }}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Tolak
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Testimoni</h1>
          <p className="text-gray-500 mt-1">Review dan approve testimoni dari penerima manfaat dan donatur</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-yellow-100">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{pendingFeedback.length}</p>
                  <p className="text-sm text-gray-500">Menunggu Review</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-green-100">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{approvedFeedback.length}</p>
                  <p className="text-sm text-gray-500">Disetujui</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-red-100">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{rejectedFeedback.length}</p>
                  <p className="text-sm text-gray-500">Ditolak</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Cari nama atau testimoni..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pending">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="w-4 h-4" />
              Menunggu ({pendingFeedback.length})
            </TabsTrigger>
            <TabsTrigger value="approved" className="gap-2">
              <CheckCircle className="w-4 h-4" />
              Disetujui ({approvedFeedback.length})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="gap-2">
              <XCircle className="w-4 h-4" />
              Ditolak ({rejectedFeedback.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4 mt-6">
            {filteredPending.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Tidak ada testimoni yang menunggu review</p>
                </CardContent>
              </Card>
            ) : (
              filteredPending.map((item) => <FeedbackCard key={item.id} item={item} />)
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4 mt-6">
            {filteredApproved.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Belum ada testimoni yang disetujui</p>
                </CardContent>
              </Card>
            ) : (
              filteredApproved.map((item) => <FeedbackCard key={item.id} item={item} />)
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4 mt-6">
            {filteredRejected.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <XCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Tidak ada testimoni yang ditolak</p>
                </CardContent>
              </Card>
            ) : (
              filteredRejected.map((item) => <FeedbackCard key={item.id} item={item} />)
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* View Detail Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Testimoni</DialogTitle>
            <DialogDescription>Review testimoni sebelum menyetujui atau menolak</DialogDescription>
          </DialogHeader>
          {selectedFeedback && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                {selectedFeedback.photo ? (
                  <Image
                    src={selectedFeedback.photo}
                    alt={selectedFeedback.name}
                    width={80}
                    height={80}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center font-bold text-xl ${getAvatarColor(selectedFeedback.name)}`}>
                    {getInitials(selectedFeedback.name)}
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedFeedback.name}</h3>
                  <p className="text-sm text-[#5C1515] font-medium">{selectedFeedback.category}</p>
                  <p className="text-sm text-gray-500">{selectedFeedback.location}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>{selectedFeedback.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>Dikirim: {formatDate(selectedFeedback.submittedAt)}</span>
                </div>
              </div>

              <div className="p-6 bg-[#5C1515]/5 rounded-lg border-l-4 border-[#5C1515]">
                <Quote className="w-8 h-8 text-[#5C1515]/30 mb-3" />
                <p className="text-gray-700 leading-relaxed italic">"{selectedFeedback.testimonial}"</p>
              </div>

              {selectedFeedback.status === "rejected" && selectedFeedback.rejectedReason && (
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-sm font-medium text-red-800 mb-1">Alasan Penolakan:</p>
                  <p className="text-sm text-red-600">{selectedFeedback.rejectedReason}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="gap-2">
            {selectedFeedback?.status === "pending" && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setRejectDialogOpen(true)
                  }}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Tolak
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleApprove(selectedFeedback.id)}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Setujui & Tampilkan
                </Button>
              </>
            )}
            {selectedFeedback?.status !== "pending" && (
              <Button
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Hapus Permanen
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak Testimoni</DialogTitle>
            <DialogDescription>Berikan alasan penolakan untuk testimoni ini</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Alasan penolakan..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={!rejectReason}>
              Tolak Testimoni
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Testimoni</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus testimoni dari {selectedFeedback?.name}? Tindakan ini tidak dapat
              dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Hapus Permanen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
