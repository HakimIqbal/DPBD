"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Bell,
  Shield,
  Database,
  Save,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react"

export default function SettingsPage() {
  const [saving, setSaving] = useState(false)

  const handleSave = () => {
    setSaving(true)
    setTimeout(() => setSaving(false), 1500)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pengaturan</h1>
          <p className="text-muted-foreground">Konfigurasi sistem dan preferensi</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          <Save className="w-4 h-4" />
          {saving ? "Menyimpan..." : "Simpan Semua"}
        </Button>
      </div>

      <Tabs defaultValue="notifications">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" />
            Notifikasi
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="w-4 h-4" />
            Keamanan
          </TabsTrigger>
          <TabsTrigger value="donation" className="gap-2">
            <Database className="w-4 h-4" />
            Donasi
          </TabsTrigger>
        </TabsList>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Notifikasi</CardTitle>
              <CardDescription>Kelola notifikasi email dan sistem</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">Notifikasi Donasi Baru</p>
                    <p className="text-sm text-muted-foreground">Terima email setiap ada donasi masuk</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">Notifikasi Donasi Besar</p>
                    <p className="text-sm text-muted-foreground">Notifikasi khusus untuk donasi di atas Rp 5 Juta</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">Notifikasi Donatur Baru</p>
                    <p className="text-sm text-muted-foreground">Email ketika ada donatur baru mendaftar</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">Laporan Mingguan</p>
                    <p className="text-sm text-muted-foreground">Ringkasan donasi setiap minggu</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">Alert Pembayaran Gagal</p>
                    <p className="text-sm text-muted-foreground">Notifikasi ketika ada masalah pembayaran</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="pt-4 border-t">
                <Label className="mb-3 block">Email Penerima Notifikasi</Label>
                <div className="flex gap-2">
                  <Input placeholder="email@example.com" className="flex-1" />
                  <Button variant="outline">Tambah</Button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant="secondary" className="gap-1">
                    admin@dpbd.org
                    <button className="ml-1 hover:text-destructive">×</button>
                  </Badge>
                  <Badge variant="secondary" className="gap-1">
                    finance@dpbd.org
                    <button className="ml-1 hover:text-destructive">×</button>
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Keamanan Sistem</CardTitle>
              <CardDescription>Pengaturan keamanan dan autentikasi</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">Two-Factor Authentication (2FA)</p>
                    <p className="text-sm text-muted-foreground">Wajibkan 2FA untuk semua admin</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">Session Timeout</p>
                    <p className="text-sm text-muted-foreground">Logout otomatis setelah tidak aktif</p>
                  </div>
                  <Select defaultValue="30">
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 menit</SelectItem>
                      <SelectItem value="30">30 menit</SelectItem>
                      <SelectItem value="60">1 jam</SelectItem>
                      <SelectItem value="120">2 jam</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">IP Whitelist</p>
                    <p className="text-sm text-muted-foreground">Batasi akses admin dari IP tertentu</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">Login History</p>
                    <p className="text-sm text-muted-foreground">Simpan riwayat login</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              {/* Status */}
              <div className="pt-4 border-t">
                <Label className="mb-3 block">Status Keamanan</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-success/10 rounded-lg border border-success/20">
                    <CheckCircle2 className="w-5 h-5 text-success" />
                    <div>
                      <p className="font-medium text-success">SSL Certificate</p>
                      <p className="text-xs text-muted-foreground">Valid hingga Jan 2025</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-success/10 rounded-lg border border-success/20">
                    <CheckCircle2 className="w-5 h-5 text-success" />
                    <div>
                      <p className="font-medium text-success">Database Encrypted</p>
                      <p className="text-xs text-muted-foreground">AES-256 encryption</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <div>
                      <p className="font-medium text-yellow-600">2FA Not Enabled</p>
                      <p className="text-xs text-muted-foreground">Disarankan untuk diaktifkan</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-success/10 rounded-lg border border-success/20">
                    <CheckCircle2 className="w-5 h-5 text-success" />
                    <div>
                      <p className="font-medium text-success">Backup Aktif</p>
                      <p className="text-xs text-muted-foreground">Daily backup enabled</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Donation Tab */}
        <TabsContent value="donation" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Donasi</CardTitle>
              <CardDescription>Konfigurasi default untuk sistem donasi</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Minimal Donasi</Label>
                  <Input type="number" defaultValue="10000" />
                  <p className="text-xs text-muted-foreground">Nominal minimum untuk setiap donasi</p>
                </div>
                <div className="space-y-2">
                  <Label>Maksimal Donasi</Label>
                  <Input type="number" defaultValue="1000000000" />
                  <p className="text-xs text-muted-foreground">Nominal maksimum per transaksi</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Label className="mb-3 block">Nominal Preset</Label>
                <p className="text-sm text-muted-foreground mb-3">Pilihan cepat nominal donasi di form</p>
                <div className="flex flex-wrap gap-2">
                  {["50000", "100000", "250000", "500000", "1000000"].map((val) => (
                    <Badge key={val} variant="secondary" className="text-sm py-1.5 px-3">
                      Rp {Number.parseInt(val).toLocaleString("id-ID")}
                      <button className="ml-2 hover:text-destructive">×</button>
                    </Badge>
                  ))}
                  <Button variant="outline" size="sm">
                    + Tambah
                  </Button>
                </div>
              </div>

              <div className="pt-4 border-t space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">Izinkan Donasi Anonim</p>
                    <p className="text-sm text-muted-foreground">Donatur dapat menyembunyikan identitas</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">Izinkan Donasi Berulang</p>
                    <p className="text-sm text-muted-foreground">Donatur dapat mengatur donasi bulanan</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">Izinkan Donasi Tanpa Login</p>
                    <p className="text-sm text-muted-foreground">Guest dapat berdonasi tanpa membuat akun</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="pt-4 border-t space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">Tampilkan Progress Bar</p>
                    <p className="text-sm text-muted-foreground">Tampilkan progress donasi di card program</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">Tampilkan Jumlah Donatur</p>
                    <p className="text-sm text-muted-foreground">Tampilkan jumlah donatur di statistik</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">Tampilkan Nama Donatur Terbaru</p>
                    <p className="text-sm text-muted-foreground">Tampilkan daftar donatur terbaru di landing</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  )
}
