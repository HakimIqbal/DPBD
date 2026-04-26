"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth-context"
import { Save, Upload, Building2, User, Loader2 } from "lucide-react"
import { usersApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

const COUNTRIES = [
  "Indonesia",
  "Jerman",
  "Belanda",
  "Jepang",
  "Australia",
  "Amerika Serikat",
  "Inggris",
  "Prancis",
  "Kanada",
  "Malaysia",
  "Singapura",
  "Lainnya",
]

export default function ProfilePage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const isCompany = user?.role === "company"
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    country: "Indonesia",
    companyName: "",
    npwp: "",
    picName: "",
    companyAddress: "",
    phone: "",
    website: "",
  })

  // Fetch profile data from API
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return
      
      setLoading(true)
      try {
        const profile = await usersApi.getProfile()
        if (profile) {
          setFormData({
            name: profile.name || "",
            email: profile.email || "",
            country: profile.country || profile.companyCountry || "Indonesia",
            companyName: profile.companyName || "",
            npwp: profile.npwp || "",
            picName: profile.picName || "",
            companyAddress: profile.companyAddress || "",
            phone: profile.phone || "",
            website: profile.website || "",
          })
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error)
        toast({
          title: "Error",
          description: "Gagal mengambil data profil",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user, toast])

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const updateData = isCompany
        ? {
            companyName: formData.companyName,
            npwp: formData.npwp,
            picName: formData.picName,
            companyAddress: formData.companyAddress,
            email: formData.email,
            phone: formData.phone,
            website: formData.website,
          }
        : {
            name: formData.name,
            email: formData.email,
            country: formData.country,
            phone: formData.phone,
          }

      const result = await usersApi.updateProfile(updateData)
      if (result) {
        toast({
          title: "Sukses",
          description: "Profil berhasil diperbarui",
        })
      }
    } catch (error) {
      console.error("Failed to save profile:", error)
      toast({
        title: "Error",
        description: "Gagal menyimpan profil",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">Profil</h1>
        <p className="text-muted-foreground">Kelola informasi profil Anda</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Photo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Foto Profil</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <Avatar className="w-24 h-24 mb-4">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                {isCompany ? (
                  <Building2 className="w-10 h-10" />
                ) : (
                  user?.name?.charAt(0) || <User className="w-10 h-10" />
                )}
              </AvatarFallback>
            </Avatar>
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Upload Foto
            </Button>
            <p className="text-xs text-muted-foreground mt-2">JPG, PNG max 2MB</p>
          </CardContent>
        </Card>

        {/* Profile Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">{isCompany ? "Informasi Perusahaan" : "Informasi Personal"}</CardTitle>
            <CardDescription>Perbarui data profil Anda</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              {isCompany ? (
                <>
                  <div className="space-y-2">
                    <Label>Nama Perusahaan</Label>
                    <Input value={formData.companyName} onChange={(e) => handleChange("companyName", e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>NPWP</Label>
                      <Input value={formData.npwp} onChange={(e) => handleChange("npwp", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Nama PIC</Label>
                      <Input value={formData.picName} onChange={(e) => handleChange("picName", e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Alamat Perusahaan</Label>
                    <Textarea
                      value={formData.companyAddress}
                      onChange={(e) => handleChange("companyAddress", e.target.value)}
                      rows={3}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label>Nama Lengkap</Label>
                    <Input value={formData.name} onChange={(e) => handleChange("name", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Negara Domisili</Label>
                    <Select value={formData.country} onValueChange={(v) => handleChange("country", v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              
              {/* Common fields for all users */}
              <div className="border-t pt-4 space-y-4">
                <div className="space-y-2">
                  <Label>Telpon</Label>
                  <Input value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Website</Label>
                  <Input value={formData.website} onChange={(e) => handleChange("website", e.target.value)} />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
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
