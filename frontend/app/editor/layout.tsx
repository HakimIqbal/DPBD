"use client"

import type { ReactNode } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { EditorSidebar } from "@/components/editor/editor-sidebar"
import { EditorHeader } from "@/components/editor/editor-header"
import { Loader2 } from "lucide-react"

export default function EditorLayout({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!user || (user.role !== "admin" && user.role !== "editor"))) {
      router.push("/auth/login")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-highlight" />
      </div>
    )
  }

  if (!user || (user.role !== "admin" && user.role !== "editor")) {
    return null
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <EditorSidebar />
      <div className="pl-64">
        <EditorHeader />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
