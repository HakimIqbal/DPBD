'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Loader2, Upload } from 'lucide-react'
import { programsApi } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'

const CATEGORIES = [
  'Pendidikan',
  'Kesehatan',
  'Ekonomi',
  'Kemanusiaan',
  'Lingkungan',
  'Lainnya'
]

export default function CreateProgramPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    targetAmount: '',
    imageUrl: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      category: value
    }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          imageUrl: reader.result as string
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!formData.title || !formData.description || !formData.category || !formData.targetAmount) {
      toast({
        title: "Error",
        description: "Mohon isi semua field yang wajib.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      await programsApi.create({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        targetAmount: parseInt(formData.targetAmount, 10),
        imageUrl: formData.imageUrl,
      })

      toast({
        title: "Sukses",
        description: "Program berhasil dibuat!",
      })

      router.push('/editor/programs')
    } catch (error) {
      console.error('Error creating program:', error)
      toast({
        title: "Error",
        description: "Gagal membuat program. Silakan coba lagi.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-2 mb-8">
          <Link href="/editor/programs">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Buat Program Baru</h1>
            <p className="text-muted-foreground mt-1">
              Tambahkan program penggalangan dana baru ke platform
            </p>
          </div>
        </div>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>Detail Program</CardTitle>
            <CardDescription>
              Isi semua informasi program dengan lengkap dan akurat
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-base">
                  Judul Program <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Misalnya: Beasiswa Pendidikan S1"
                  value={formData.title}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-base">
                  Deskripsi <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Jelaskan tujuan program, manfaat, dan target penerima manfaat..."
                  rows={6}
                  value={formData.description}
                  onChange={handleChange}
                  disabled={loading}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  {formData.description.length}/500 karakter
                </p>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category" className="text-base">
                  Kategori <span className="text-destructive">*</span>
                </Label>
                <Select value={formData.category} onValueChange={handleCategoryChange} disabled={loading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori program" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Target Amount */}
              <div className="space-y-2">
                <Label htmlFor="targetAmount" className="text-base">
                  Target Dana (Rp) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="targetAmount"
                  name="targetAmount"
                  type="number"
                  placeholder="50000000"
                  value={formData.targetAmount}
                  onChange={handleChange}
                  disabled={loading}
                  min="0"
                />
                <p className="text-xs text-muted-foreground">
                  {formData.targetAmount ? `Rp ${parseInt(formData.targetAmount, 10).toLocaleString('id-ID')}` : '-'}
                </p>
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label htmlFor="image" className="text-base">
                  Gambar Program
                </Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 transition cursor-pointer">
                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={loading}
                    className="hidden"
                  />
                  <label htmlFor="image" className="cursor-pointer block">
                    {formData.imageUrl ? (
                      <div className="space-y-2">
                        <img
                          src={formData.imageUrl}
                          alt="Preview"
                          className="w-32 h-32 object-cover rounded mx-auto"
                        />
                        <p className="text-sm text-muted-foreground">Klik untuk ubah gambar</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                        <div>
                          <p className="font-medium">Klik untuk upload gambar</p>
                          <p className="text-sm text-muted-foreground">PNG, JPG, GIF hingga 5MB</p>
                        </div>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6">
                <Link href="/editor/programs" className="flex-1">
                  <Button type="button" variant="outline" className="w-full">
                    Batal
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {loading ? 'Membuat Program...' : 'Buat Program'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
