"use client"

import { Bell, Search, User, Settings, LogOut } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export function AdminHeader() {
  const { user, logout } = useAuth()

  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-6">
      {/* Search */}
      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Cari transaksi, user, program..." className="pl-10 bg-muted/50 border-0" />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-[10px] text-primary-foreground rounded-full flex items-center justify-center">
                3
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifikasi</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-success/10 text-success">
                  Donasi Baru
                </Badge>
                <span className="text-xs text-muted-foreground">2 menit lalu</span>
              </div>
              <p className="text-sm">Donasi Rp 5.000.000 dari PT ABC berhasil</p>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-warning/10 text-warning">
                  Pending
                </Badge>
                <span className="text-xs text-muted-foreground">15 menit lalu</span>
              </div>
              <p className="text-sm">Menunggu pembayaran dari John Doe</p>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-destructive/10 text-destructive">
                  Error
                </Badge>
                <span className="text-xs text-muted-foreground">1 jam lalu</span>
              </div>
              <p className="text-sm">Callback Midtrans gagal - order #12345</p>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {user?.name?.charAt(0) || "A"}
                </AvatarFallback>
              </Avatar>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-medium">{user?.name || "Admin"}</p>
                <p className="text-xs text-muted-foreground capitalize">{user?.role || "admin"}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin/profile" className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                Edit Profil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/settings" className="flex items-center">
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
