"use client"

import { Bell, Search, Heart, User, Settings, LogOut } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"

export function UserHeader() {
  const { user, logout } = useAuth()

  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-6">
      {/* Search */}
      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Cari program..." className="pl-10 bg-muted/50 border-0" />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Donate Button */}
        <Button asChild className="bg-highlight hover:bg-highlight/90 text-highlight-foreground hidden sm:flex">
          <Link href="/donate">
            <Heart className="w-4 h-4 mr-2" />
            Donasi
          </Link>
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-[10px] text-primary-foreground rounded-full flex items-center justify-center">
                2
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifikasi</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-success/10 text-success">
                  Donasi Berhasil
                </Badge>
                <span className="text-xs text-muted-foreground">1 jam lalu</span>
              </div>
              <p className="text-sm">Donasi Rp 200.000 ke Beasiswa Pelajar berhasil!</p>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  Update Program
                </Badge>
                <span className="text-xs text-muted-foreground">2 hari lalu</span>
              </div>
              <p className="text-sm">Program Beasiswa Pelajar telah mencapai 78% target!</p>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-medium">{user?.name || "User"}</p>
                <p className="text-xs text-muted-foreground capitalize">{user?.role === "company" ? "Perusahaan" : "Personal"}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/user/profile" className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                Edit Profil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/user/settings" className="flex items-center">
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
