"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Search, Heart, Loader2 } from "lucide-react"
import { programsApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Semua")
  const { toast } = useToast()

  // Fetch programs from API on mount
  useEffect(() => {
    const fetchPrograms = async () => {
      setLoading(true)
      try {
        const data = await programsApi.getAll()
        if (Array.isArray(data)) {
          setPrograms(data)
        } else if (data?.data) {
          setPrograms(data.data)
        }
      } catch (error) {
        console.error("Failed to fetch programs:", error)
        toast({
          title: "Error",
          description: "Gagal memuat program",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchPrograms()
  }, [toast])

  // Filter programs based on search and category
  const filteredPrograms = programs.filter((program) => {
    const matchesSearch =
      program.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.description?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategory === "Semua" || program.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  // Get unique categories from programs
  const categories = ["Semua", ...new Set(programs.map((p) => p.category).filter(Boolean))]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Program Kami</h1>
        <p className="text-muted-foreground mt-2">Berbagai inisiatif untuk mendukung pelajar dan komunitas Indonesia</p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Cari program..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="whitespace-nowrap"
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Programs Grid */}
      {filteredPrograms.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">Tidak ada program yang ditemukan</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrograms.map((program) => (
            <Link href={`/program/${program.id}`} key={program.id}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
                {/* Image */}
                {program.image && (
                  <div className="relative h-48 bg-muted">
                    <Image
                      src={program.image}
                      alt={program.title}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg"
                      }}
                    />
                  </div>
                )}

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col">
                  {program.category && <Badge className="w-fit mb-2">{program.category}</Badge>}

                  <h3 className="font-bold text-lg mb-2 line-clamp-2">{program.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{program.description}</p>

                  {/* Progress Bar (if has target/raised) */}
                  {program.target && (
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">
                          Rp {program.raised ? (program.raised / 1000000).toFixed(1) : 0}M
                        </span>
                        <span className="text-muted-foreground">
                          dari Rp {(program.target / 1000000).toFixed(0)}M
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{
                            width: `${Math.min(((program.raised || 0) / program.target) * 100, 100)}%`,
                          }}
                        />
                      </div>
                      {program.donors && (
                        <p className="text-xs text-muted-foreground">{program.donors} pendonasi</p>
                      )}
                    </div>
                  )}

                  <Button className="w-full mt-auto" size="sm">
                    <Heart className="w-4 h-4 mr-2" />
                    Lihat Detail
                  </Button>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
