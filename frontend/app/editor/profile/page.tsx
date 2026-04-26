"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth-context"
import { Save, Upload, Loader2 } from "lucide-react"

export default function EditorProfilePage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
    alert("Profil berhasil diperbarui!")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Edit Profil</h1>
        <p className="text-muted-foreground">Kelola informasi profil akun editor Anda</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Foto Profil</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <Avatar className="w-24 h-24 mb-4">
              <AvatarFallback className="bg-[#D4C896] text-[#5C1515] text-2xl">
                {user?.name?.charAt(0) || "E"}
              </AvatarFallback>
            </Avatar>
            <Button variant="outline" size="sm" className="bg-transparent">
              <Upload className="w-4 h-4 mr-2" />
              Upload Foto
            </Button>
            <p className="text-xs text-muted-foreground mt-2">JPG, PNG max 2MB</p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Informasi Editor</CardTitle>
            <CardDescription>Perbarui data profil Anda</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Nama Lengkap</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Nomor Telepon</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+62 812 3456 7890"
                />
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Simpan Perubahan
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
