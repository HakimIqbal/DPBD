"use client"

import { Search, User, Settings, LogOut } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/auth-context"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Link from "next/link"

export function EditorHeader() {
  const { user, logout } = useAuth()

  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-6">
      {/* Search */}
      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Cari konten..." className="pl-10 bg-muted/50 border-0" />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-highlight text-highlight-foreground text-sm">
                  {user?.name?.charAt(0) || "E"}
                </AvatarFallback>
              </Avatar>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-medium">{user?.name || "Editor"}</p>
                <p className="text-xs text-muted-foreground capitalize">{user?.role || "editor"}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/editor/profile" className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                Edit Profil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/editor/settings" className="flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                Pengaturan
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logout()} className="text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
