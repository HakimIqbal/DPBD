'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Building2, Trash2, Loader2, AlertCircle, MoreVertical, Plus, Mail, MapPin, Globe, Briefcase, Eye } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { usersApi } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'

interface Company {
  id: string
  email: string
  name: string
  role: string
  companyName: string
  npwp: string
  picName: string
  industry: string
  companyAddress: string
  phone: string
  website: string
  companyCountry: string
  avatar?: string
  status: 'active' | 'suspended' | 'deleted'
  totalDonation?: number
  createdAt: string
}

const formatRupiah = (num: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num)
}

const statusConfig = {
  active: { label: 'Aktif', color: 'bg-green-100 text-green-800' },
  suspended: { label: 'Ditangguhkan', color: 'bg-yellow-100 text-yellow-800' },
  deleted: { label: 'Dihapus', color: 'bg-red-100 text-red-800' },
}

export default function CompaniesPage() {
  const { toast } = useToast()
  const [allCompanies, setAllCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterIndustry, setFilterIndustry] = useState<string>('all')
  const [addCompanyDialog, setAddCompanyDialog] = useState(false)
  const [detailDialog, setDetailDialog] = useState<{ open: boolean; company: Company | null }>({ open: false, company: null })
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; company: Company | null }>({ open: false, company: null })
  const [newCompany, setNewCompany] = useState({
    email: '',
    password: '',
    name: '',
    picName: '',
    companyName: '',
    npwp: '',
    industry: '',
    companyAddress: '',
    phone: '',
    website: '',
    companyCountry: 'Indonesia',
  })
  const [industries, setIndustries] = useState<string[]>([])

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true)
        const data = (await usersApi.getAll()) as Company[]
        const companies = (data || []).filter((u: Company) => u.role === 'company') as Company[]
        setAllCompanies(companies)
        
        // Extract unique industries
        const uniqueIndustries = [...new Set(companies.map(c => c.industry).filter(Boolean))]
        setIndustries(uniqueIndustries as string[])
      } catch (error) {
        console.error('Error fetching companies:', error)
        toast({ title: 'Error', description: 'Gagal memuat daftar perusahaan', variant: 'destructive' })
      } finally {
        setLoading(false)
      }
    }
    fetchCompanies()
  }, [toast])

  const filteredCompanies = allCompanies.filter((company) => {
    const matchesSearch = 
      company.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.npwp?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || company.status === filterStatus
    const matchesIndustry = filterIndustry === 'all' || company.industry === filterIndustry
    return matchesSearch && matchesStatus && matchesIndustry
  })

  const handleAddCompany = async () => {
    if (!newCompany.email || !newCompany.password || !newCompany.companyName || !newCompany.npwp) {
      toast({ title: 'Error', description: 'Mohon lengkapi field yang diperlukan', variant: 'destructive' })
      return
    }
    try {
      await usersApi.create({
        email: newCompany.email,
        password: newCompany.password,
        name: newCompany.name,
        role: 'company',
        companyName: newCompany.companyName,
        npwp: newCompany.npwp,
        picName: newCompany.picName,
        industry: newCompany.industry,
        companyAddress: newCompany.companyAddress,
        phone: newCompany.phone,
        website: newCompany.website,
        companyCountry: newCompany.companyCountry,
      })
      toast({ title: 'Sukses', description: 'Perusahaan baru berhasil ditambahkan' })
      setNewCompany({
        email: '',
        password: '',
        name: '',
        picName: '',
        companyName: '',
        npwp: '',
        industry: '',
        companyAddress: '',
        phone: '',
        website: '',
        companyCountry: 'Indonesia',
      })
      setAddCompanyDialog(false)
      const data = (await usersApi.getAll()) as Company[]
      const companies = (data || []).filter((u: Company) => u.role === 'company') as Company[]
      setAllCompanies(companies)
    } catch (error) {
      console.error('Error adding company:', error)
      toast({ title: 'Error', description: 'Gagal menambahkan perusahaan', variant: 'destructive' })
    }
  }

  const handleDeleteCompany = async () => {
    if (!deleteConfirm.company) return
    try {
      await usersApi.delete(deleteConfirm.company.id)
      toast({ title: 'Sukses', description: 'Perusahaan berhasil dihapus' })
      const data = (await usersApi.getAll()) as Company[]
      const companies = (data || []).filter((u: Company) => u.role === 'company') as Company[]
      setAllCompanies(companies)
      setDeleteConfirm({ open: false, company: null })
    } catch (error) {
      console.error('Error deleting company:', error)
      toast({ title: 'Error', description: 'Gagal menghapus perusahaan', variant: 'destructive' })
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Manajemen Perusahaan</h1>
        <p className="text-gray-600">Kelola akun dan informasi perusahaan donatur</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-end flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <Label className="text-sm">Cari perusahaan</Label>
              <Input placeholder="Cari nama, email, atau NPWP..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-sm">Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="suspended">Ditangguhkan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">Industri</Label>
              <Select value={filterIndustry} onValueChange={setFilterIndustry}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  {industries.map(ind => (
                    <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => setAddCompanyDialog(true)} className="gap-2">
              <Plus className="h-4 w-4" /> Tambah Perusahaan
            </Button>
          </div>
        </CardContent>
      </Card>

      {filteredCompanies.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Tidak ada perusahaan yang sesuai dengan filter</AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-4">
          {filteredCompanies.map((company) => (
            <Card key={company.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="space-y-4">
                  {/* Header dengan nama dan status */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <Avatar className="h-12 w-12"><AvatarFallback>{company.companyName?.charAt(0) || 'C'}</AvatarFallback></Avatar>
                      <div>
                        <p className="font-bold text-lg">{company.companyName || company.name}</p>
                        <p className="text-sm text-gray-600">{company.picName || company.name} (PIC)</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-col">
                      <Badge className={statusConfig[company.status as keyof typeof statusConfig]?.color || ''}>
                        {statusConfig[company.status as keyof typeof statusConfig]?.label}
                      </Badge>
                      {company.industry && (
                        <Badge variant="outline" className="text-xs">{company.industry}</Badge>
                      )}
                    </div>
                  </div>

                  {/* Grid informasi perusahaan */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase">NPWP</p>
                      <p className="font-semibold text-sm">{company.npwp}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Email</p>
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="h-3 w-3" />
                        <a href={`mailto:${company.email}`} className="text-blue-600 hover:underline">{company.email}</a>
                      </div>
                    </div>
                    {company.phone && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Telepon</p>
                        <p className="font-semibold text-sm">{company.phone}</p>
                      </div>
                    )}
                    {company.website && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Website</p>
                        <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm flex items-center gap-1">
                          <Globe className="h-3 w-3" /> Kunjungi
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Alamat */}
                  {company.companyAddress && (
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-xs text-gray-500 uppercase flex items-center gap-1"><MapPin className="h-3 w-3" /> Alamat</p>
                      <p className="text-sm">{company.companyAddress}, {company.companyCountry}</p>
                    </div>
                  )}

                  {/* Footer dengan donasi dan aksi */}
                  <div className="flex items-center justify-between border-t pt-3">
                    <div>
                      {company.totalDonation ? (
                        <div>
                          <p className="text-xs text-gray-500">Total Donasi</p>
                          <p className="font-bold text-lg text-green-600">{formatRupiah(company.totalDonation)}</p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">Belum ada donasi</p>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm"><MoreVertical className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setDetailDialog({ open: true, company })}>
                          <Eye className="h-4 w-4 mr-2" /> Lihat Detail
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setDeleteConfirm({open: true, company})} className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={addCompanyDialog} onOpenChange={setAddCompanyDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tambah Perusahaan Baru</DialogTitle>
            <DialogDescription>Isikan informasi lengkap perusahaan untuk menambahkan pengguna perusahaan baru</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* INFO KONTAK */}
            <div>
              <p className="font-semibold text-sm mb-2">Informasi Kontak</p>
              <div className="space-y-3">
                <div><Label className="text-sm">Email *</Label><Input type="email" placeholder="email@perusahaan.com" value={newCompany.email} onChange={(e) => setNewCompany({...newCompany, email: e.target.value})} /></div>
                <div><Label className="text-sm">Password *</Label><Input type="password" placeholder="Minimal 6 karakter" value={newCompany.password} onChange={(e) => setNewCompany({...newCompany, password: e.target.value})} /></div>
                <div><Label className="text-sm">Nama PIC *</Label><Input placeholder="Nama Person In Charge" value={newCompany.picName} onChange={(e) => setNewCompany({...newCompany, picName: e.target.value})} /></div>
                <div><Label className="text-sm">Nama Pengguna (Profil)</Label><Input placeholder="Nama untuk profil user" value={newCompany.name} onChange={(e) => setNewCompany({...newCompany, name: e.target.value})} /></div>
              </div>
            </div>

            {/* INFO PERUSAHAAN */}
            <div>
              <p className="font-semibold text-sm mb-2">Informasi Perusahaan</p>
              <div className="space-y-3">
                <div><Label className="text-sm">Nama Perusahaan *</Label><Input placeholder="PT. / CV / Perusahaan Anda" value={newCompany.companyName} onChange={(e) => setNewCompany({...newCompany, companyName: e.target.value})} /></div>
                <div><Label className="text-sm">NPWP *</Label><Input placeholder="15 digit NPWP" value={newCompany.npwp} onChange={(e) => setNewCompany({...newCompany, npwp: e.target.value})} maxLength={15} /></div>
                <div><Label className="text-sm">Industri</Label><Input placeholder="Misalnya: Teknologi, Retail, Manufaktur" value={newCompany.industry} onChange={(e) => setNewCompany({...newCompany, industry: e.target.value})} /></div>
              </div>
            </div>

            {/* INFO TAMBAHAN */}
            <div>
              <p className="font-semibold text-sm mb-2">Informasi Tambahan</p>
              <div className="space-y-3">
                <div><Label className="text-sm">Alamat</Label><Input placeholder="Alamat lengkap perusahaan" value={newCompany.companyAddress} onChange={(e) => setNewCompany({...newCompany, companyAddress: e.target.value})} /></div>
                <div><Label className="text-sm">Telepon</Label><Input placeholder="Nomor telepon perusahaan" value={newCompany.phone} onChange={(e) => setNewCompany({...newCompany, phone: e.target.value})} /></div>
                <div><Label className="text-sm">Website</Label><Input placeholder="https://perusahaan.com" value={newCompany.website} onChange={(e) => setNewCompany({...newCompany, website: e.target.value})} /></div>
                <div><Label className="text-sm">Negara</Label>
                  <Input placeholder="Indonesia" value={newCompany.companyCountry} onChange={(e) => setNewCompany({...newCompany, companyCountry: e.target.value})} />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddCompanyDialog(false)}>Batal</Button>
            <Button onClick={handleAddCompany}>Tambah Perusahaan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteConfirm.open} onOpenChange={(open) => !open && setDeleteConfirm({...deleteConfirm, open: false})}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Perusahaan</DialogTitle>
            <DialogDescription>Tindakan ini tidak dapat dibatalkan</DialogDescription>
          </DialogHeader>
          <p>Apakah Anda yakin ingin menghapus perusahaan <strong>{deleteConfirm.company?.companyName}</strong>? Tindakan ini tidak dapat dibatalkan.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm({...deleteConfirm, open: false})}>Batal</Button>
            <Button variant="destructive" onClick={handleDeleteCompany}>Hapus</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailDialog.open} onOpenChange={(open) => !open && setDetailDialog({...detailDialog, open: false})}>
        <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Perusahaan</DialogTitle>
            <DialogDescription>Informasi lengkap tentang perusahaan yang terdaftar</DialogDescription>
          </DialogHeader>
          {detailDialog.company && (
            <div className="space-y-6">
              {/* Identitas Perusahaan */}
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2"><Building2 className="h-5 w-5" /> Identitas Perusahaan</h3>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Nama Perusahaan</p>
                    <p className="font-semibold">{detailDialog.company.companyName || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">NPWP</p>
                    <p className="font-semibold">{detailDialog.company.npwp || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Industri</p>
                    <p className="font-semibold">{detailDialog.company.industry || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Status</p>
                    <Badge className={statusConfig[detailDialog.company.status as keyof typeof statusConfig]?.color || ''}>
                      {statusConfig[detailDialog.company.status as keyof typeof statusConfig]?.label}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Informasi Kontak */}
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2"><Mail className="h-5 w-5" /> Informasi Kontak</h3>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Email</p>
                    <a href={`mailto:${detailDialog.company.email}`} className="text-blue-600 hover:underline font-semibold">{detailDialog.company.email}</a>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Telepon</p>
                    <p className="font-semibold">{detailDialog.company.phone || '-'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500 uppercase">Website</p>
                    {detailDialog.company.website ? (
                      <a href={detailDialog.company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-semibold">
                        {detailDialog.company.website}
                      </a>
                    ) : (
                      <p className="font-semibold">-</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Alamat */}
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2"><MapPin className="h-5 w-5" /> Lokasi</h3>
                <div className="bg-gray-50 p-4 rounded">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Alamat</p>
                    <p className="font-semibold">{detailDialog.company.companyAddress || '-'}</p>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 uppercase">Negara</p>
                    <p className="font-semibold">{detailDialog.company.companyCountry || '-'}</p>
                  </div>
                </div>
              </div>

              {/* PIC & Statistik */}
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2"><Briefcase className="h-5 w-5" /> PIC & Statistik</h3>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Nama PIC</p>
                    <p className="font-semibold">{detailDialog.company.picName || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Total Donasi</p>
                    <p className="font-semibold text-lg text-green-600">{formatRupiah(detailDialog.company.totalDonation || 0)}</p>
                  </div>
                </div>
              </div>

              {/* Tanggal Bergabung */}
              <div className="bg-blue-50 p-4 rounded border border-blue-100">
                <p className="text-xs text-blue-600 uppercase mb-1">Tanggal Bergabung</p>
                <p className="font-semibold">{new Date(detailDialog.company.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailDialog({...detailDialog, open: false})}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
