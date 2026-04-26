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
import { Search, MoreVertical, Shield, Ban, Mail, Building2, UserIcon, UserPlus, Trash2, Loader2, AlertCircle, Eye } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { usersApi, authApi } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'

interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: 'personal' | 'company' | 'admin' | 'editor' | 'finance'
  status: 'active' | 'suspended' | 'deleted'
  country?: string
  totalDonation?: number
  createdAt: string
  companyName?: string
  npwp?: string
}

const formatRupiah = (num: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num)
}

const roleConfig = {
  personal: { label: 'Personal', color: 'bg-blue-100 text-blue-800' },
  company: { label: 'Perusahaan', color: 'bg-purple-100 text-purple-800' },
  admin: { label: 'Admin', color: 'bg-red-100 text-red-800' },
  editor: { label: 'Editor', color: 'bg-green-100 text-green-800' },
  finance: { label: 'Finance', color: 'bg-yellow-100 text-yellow-800' },
}

const statusConfig = {
  active: { label: 'Aktif', color: 'bg-green-100 text-green-800' },
  suspended: { label: 'Ditangguhkan', color: 'bg-yellow-100 text-yellow-800' },
  deleted: { label: 'Dihapus', color: 'bg-red-100 text-red-800' },
}

export default function UsersPage() {
  const { toast } = useToast()
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [addStaffDialog, setAddStaffDialog] = useState(false)
  const [detailDialog, setDetailDialog] = useState<{ open: boolean; user: User | null }>({ open: false, user: null })
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; user: User | null }>({ open: false, user: null })
  const [statusChangeConfirm, setStatusChangeConfirm] = useState<{ open: boolean; user: User | null; newStatus: string }>({ open: false, user: null, newStatus: '' })
  const [newStaff, setNewStaff] = useState({ name: '', email: '', password: '', role: 'editor' })

  // Fetch users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const data = await usersApi.getAll()
        setAllUsers(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Error fetching users:', error)
        toast({
          title: 'Error',
          description: 'Gagal memuat daftar pengguna',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [toast])

  // Filter users based on search, role, and status
  const filteredUsers = allUsers.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'all' || user.role === filterRole
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus
    return matchesSearch && matchesRole && matchesStatus
  })

  // Group users by role/type
  const personalUsers = filteredUsers.filter(u => u.role === 'personal')
  const companyUsers = filteredUsers.filter(u => u.role === 'company')
  const staffUsers = filteredUsers.filter(u => ['admin', 'editor', 'finance'].includes(u.role))

  const handleAddStaff = async () => {
    if (!newStaff.name || !newStaff.email || !newStaff.password) {
      toast({
        title: 'Error',
        description: 'Mohon lengkapi semua field',
        variant: 'destructive',
      })
      return
    }

    try {
      await authApi.register({
        name: newStaff.name,
        email: newStaff.email,
        password: newStaff.password,
        role: newStaff.role as 'admin' | 'editor' | 'finance',
      })

      toast({
        title: 'Sukses',
        description: 'Staf baru berhasil ditambahkan',
      })

      setNewStaff({ name: '', email: '', password: '', role: 'editor' })
      setAddStaffDialog(false)

      // Refresh users list
      const data = await usersApi.getAll()
      setAllUsers(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error adding staff:', error)
      toast({
        title: 'Error',
        description: 'Gagal menambahkan staf',
        variant: 'destructive',
      })
    }
  }

  const handleStatusChange = async () => {
    if (!statusChangeConfirm.user) return

    try {
      await usersApi.updateStatus(statusChangeConfirm.user.id, statusChangeConfirm.newStatus as any)

      toast({
        title: 'Sukses',
        description: `Status pengguna berhasil diubah ke ${statusChangeConfirm.newStatus}`,
      })

      const data = await usersApi.getAll()
      setAllUsers(Array.isArray(data) ? data : [])
      setStatusChangeConfirm({ open: false, user: null, newStatus: '' })
    } catch (error) {
      console.error('Error updating status:', error)
      toast({
        title: 'Error',
        description: 'Gagal mengubah status pengguna',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteUser = async () => {
    if (!deleteConfirm.user) return

    try {
      await usersApi.delete(deleteConfirm.user.id)

      toast({
        title: 'Sukses',
        description: 'Pengguna berhasil dihapus',
      })

      const data = await usersApi.getAll()
      setAllUsers(Array.isArray(data) ? data : [])
      setDeleteConfirm({ open: false, user: null })
    } catch (error) {
      console.error('Error deleting user:', error)
      toast({
        title: 'Error',
        description: 'Gagal menghapus pengguna',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">User & Peran</h1>
        <p className="text-gray-600">Kelola pengguna dan hak akses sistem</p>
      </div>

      {/* Filters & Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label className="text-sm">Cari pengguna</Label>
              <Input
                placeholder="Cari nama atau email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm">Peran</Label>
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="company">Perusahaan</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="suspended">Ditangguhkan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => setAddStaffDialog(true)} className="gap-2">
              <UserPlus className="h-4 w-4" />
              Tambah Staf
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Tidak ada pengguna yang sesuai dengan filter</AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-4">
          {staffUsers.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3">Staf Sistem ({staffUsers.length})</h2>
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {staffUsers.map((user) => (
                      <div key={user.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                        <div className="flex items-center gap-3 flex-1">
                          <Avatar>
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{user.name}</p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={roleConfig[user.role as keyof typeof roleConfig]?.color || ''}>
                            {roleConfig[user.role as keyof typeof roleConfig]?.label}
                          </Badge>
                          <Badge className={statusConfig[user.status as keyof typeof statusConfig]?.color || ''}>
                            {statusConfig[user.status as keyof typeof statusConfig]?.label}
                          </Badge>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setDetailDialog({ open: true, user })}>
                              <Eye className="h-4 w-4 mr-2" />
                              Lihat Detail
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setStatusChangeConfirm({
                                open: true,
                                user,
                                newStatus: user.status === 'active' ? 'suspended' : 'active'
                              })}
                            >
                              <Ban className="h-4 w-4 mr-2" />
                              {user.status === 'active' ? 'Tangguhkan' : 'Aktifkan'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setDeleteConfirm({ open: true, user })}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {personalUsers.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3">Pengguna Personal ({personalUsers.length})</h2>
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {personalUsers.map((user) => (
                      <div key={user.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                        <div className="flex items-center gap-3 flex-1">
                          <Avatar>
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{user.name}</p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            {user.country && <p className="text-xs text-gray-500">{user.country}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {user.totalDonation && <p className="font-semibold">{formatRupiah(user.totalDonation)}</p>}
                          <Badge className={statusConfig[user.status as keyof typeof statusConfig]?.color || ''}>
                            {statusConfig[user.status as keyof typeof statusConfig]?.label}
                          </Badge>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setDetailDialog({ open: true, user })}>
                              <Eye className="h-4 w-4 mr-2" />
                              Lihat Detail
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setStatusChangeConfirm({
                                open: true,
                                user,
                                newStatus: user.status === 'active' ? 'suspended' : 'active'
                              })}
                            >
                              <Ban className="h-4 w-4 mr-2" />
                              {user.status === 'active' ? 'Tangguhkan' : 'Aktifkan'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setDeleteConfirm({ open: true, user })}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {companyUsers.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3">Pengguna Perusahaan ({companyUsers.length})</h2>
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {companyUsers.map((user) => (
                      <div key={user.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                        <div className="flex items-center gap-3 flex-1">
                          <Avatar>
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{user.companyName || user.name}</p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            {user.npwp && <p className="text-xs text-gray-500">NPWP: {user.npwp}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {user.totalDonation && <p className="font-semibold">{formatRupiah(user.totalDonation)}</p>}
                          <Badge className={statusConfig[user.status as keyof typeof statusConfig]?.color || ''}>
                            {statusConfig[user.status as keyof typeof statusConfig]?.label}
                          </Badge>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setDetailDialog({ open: true, user })}>
                              <Eye className="h-4 w-4 mr-2" />
                              Lihat Detail
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setStatusChangeConfirm({
                                open: true,
                                user,
                                newStatus: user.status === 'active' ? 'suspended' : 'active'
                              })}
                            >
                              <Ban className="h-4 w-4 mr-2" />
                              {user.status === 'active' ? 'Tangguhkan' : 'Aktifkan'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setDeleteConfirm({ open: true, user })}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Add Staff Dialog */}
      <Dialog open={addStaffDialog} onOpenChange={setAddStaffDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Staf Baru</DialogTitle>
            <DialogDescription>Buat akun staf baru dengan role admin, editor, atau finance</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nama Lengkap</Label>
              <Input
                placeholder="Nama lengkap"
                value={newStaff.name}
                onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="email@dpbd.org"
                value={newStaff.email}
                onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
              />
            </div>
            <div>
              <Label>Password</Label>
              <Input
                type="password"
                placeholder="Minimal 6 karakter"
                value={newStaff.password}
                onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
              />
            </div>
            <div>
              <Label>Peran</Label>
              <Select value={newStaff.role} onValueChange={(value) => setNewStaff({ ...newStaff, role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddStaffDialog(false)}>Batal</Button>
            <Button onClick={handleAddStaff} disabled={!newStaff.name || !newStaff.email || !newStaff.password}>
              Tambah Staf
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Change Confirmation Dialog */}
      <Dialog open={statusChangeConfirm.open} onOpenChange={(open) => {
        if (!open) setStatusChangeConfirm({ open: false, user: null, newStatus: '' })
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ubah Status Pengguna</DialogTitle>
            <DialogDescription>Ubah status aktivitas pengguna di sistem</DialogDescription>
          </DialogHeader>
          <p>Apakah Anda yakin ingin mengubah status <strong>{statusChangeConfirm.user?.name}</strong> ke <strong>{statusChangeConfirm.newStatus}</strong>?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusChangeConfirm({ open: false, user: null, newStatus: '' })}>Batal</Button>
            <Button onClick={handleStatusChange}>Ubah Status</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirm.open} onOpenChange={(open) => {
        if (!open) setDeleteConfirm({ open: false, user: null })
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Pengguna</DialogTitle>
            <DialogDescription>Tindakan ini tidak dapat dibatalkan</DialogDescription>
          </DialogHeader>
          <p>Apakah Anda yakin ingin menghapus pengguna <strong>{deleteConfirm.user?.name}</strong>? Tindakan ini tidak dapat dibatalkan.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm({ open: false, user: null })}>Batal</Button>
            <Button variant="destructive" onClick={handleDeleteUser}>Hapus</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailDialog.open} onOpenChange={(open) => !open && setDetailDialog({...detailDialog, open: false})}>
        <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Pengguna</DialogTitle>
            <DialogDescription>Informasi lengkap profil pengguna</DialogDescription>
          </DialogHeader>
          {detailDialog.user && (
            <div className="space-y-6">
              {/* Informasi Dasar */}
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2"><UserIcon className="h-5 w-5" /> Informasi Dasar</h3>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Nama</p>
                    <p className="font-semibold">{detailDialog.user.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Email</p>
                    <a href={`mailto:${detailDialog.user.email}`} className="text-blue-600 hover:underline font-semibold">{detailDialog.user.email}</a>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Role</p>
                    <Badge className={roleConfig[detailDialog.user.role as keyof typeof roleConfig]?.color || ''}>
                      {roleConfig[detailDialog.user.role as keyof typeof roleConfig]?.label}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Status</p>
                    <Badge className={statusConfig[detailDialog.user.status as keyof typeof statusConfig]?.color || ''}>
                      {statusConfig[detailDialog.user.status as keyof typeof statusConfig]?.label}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Data Tambahan berdasarkan Role */}
              {detailDialog.user.role === 'personal' && (
                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2"><UserIcon className="h-5 w-5" /> Informasi Personal</h3>
                  <div className="bg-gray-50 p-4 rounded">
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Negara</p>
                      <p className="font-semibold">{detailDialog.user.country || '-'}</p>
                    </div>
                    <div className="mt-3">
                      <p className="text-xs text-gray-500 uppercase">Total Donasi</p>
                      <p className="font-semibold text-lg text-green-600">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(detailDialog.user.totalDonation || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {detailDialog.user.role === 'company' && (
                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2"><Building2 className="h-5 w-5" /> Informasi Perusahaan</h3>
                  <div className="bg-gray-50 p-4 rounded space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Nama Perusahaan</p>
                      <p className="font-semibold">{detailDialog.user.companyName || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">NPWP</p>
                      <p className="font-semibold">{detailDialog.user.npwp || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Total Donasi</p>
                      <p className="font-semibold text-lg text-green-600">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(detailDialog.user.totalDonation || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tanggal Bergabung */}
              <div className="bg-blue-50 p-4 rounded border border-blue-100">
                <p className="text-xs text-blue-600 uppercase mb-1">Tanggal Bergabung</p>
                <p className="font-semibold">{new Date(detailDialog.user.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
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
