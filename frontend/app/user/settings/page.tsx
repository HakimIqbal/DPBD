"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Eye, EyeOff, Save, Bell, Mail, Shield } from "lucide-react"

export default function SettingsPage() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [notifications, setNotifications] = useState({
    email: true,
    donationSuccess: true,
    programUpdates: true,
    newsletter: false,
  })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">Pengaturan</h1>
        <p className="text-muted-foreground">Kelola keamanan dan preferensi akun</p>
      </div>

      {/* Password */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">Ubah Password</CardTitle>
          </div>
          <CardDescription>Pastikan password Anda kuat dan unik</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4 max-w-md">
            <div className="space-y-2">
              <Label>Password Saat Ini</Label>
              <div className="relative">
                <Input type={showCurrentPassword ? "text" : "password"} placeholder="Masukkan password saat ini" />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Password Baru</Label>
              <div className="relative">
                <Input type={showNewPassword ? "text" : "password"} placeholder="Minimal 6 karakter" />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Konfirmasi Password Baru</Label>
              <Input type="password" placeholder="Ulangi password baru" />
            </div>
            <Button>
              <Save className="w-4 h-4 mr-2" />
              Ubah Password
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">Notifikasi</CardTitle>
          </div>
          <CardDescription>Atur preferensi notifikasi Anda</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">Notifikasi Email</p>
                <p className="text-xs text-muted-foreground">Terima notifikasi melalui email</p>
              </div>
            </div>
            <Switch
              checked={notifications.email}
              onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, email: checked }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Donasi Berhasil</p>
              <p className="text-xs text-muted-foreground">Notifikasi saat donasi berhasil diproses</p>
            </div>
            <Switch
              checked={notifications.donationSuccess}
              onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, donationSuccess: checked }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Update Program</p>
              <p className="text-xs text-muted-foreground">Notifikasi progress program yang Anda dukung</p>
            </div>
            <Switch
              checked={notifications.programUpdates}
              onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, programUpdates: checked }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Newsletter</p>
              <p className="text-xs text-muted-foreground">Berita dan update dari DPBD</p>
            </div>
            <Switch
              checked={notifications.newsletter}
              onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, newsletter: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-base text-destructive">Zona Berbahaya</CardTitle>
          <CardDescription>Tindakan ini tidak dapat dibatalkan</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive">Hapus Akun</Button>
        </CardContent>
      </Card>
    </div>
  )
}
