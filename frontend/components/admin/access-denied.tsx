"use client"

import { ShieldAlert } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"

interface AccessDeniedProps {
  /** Override the default message. */
  message?: string
}

/**
 * Standard "Akses Ditolak" panel. Use as the `fallback` for PermissionGate
 * inside admin pages so a wrong-role user gets a clean explanation instead
 * of an empty page.
 *
 *   <PermissionGate require={Permission.READ_PORTFOLIO} fallback={<AccessDenied />}>
 *     ...
 *   </PermissionGate>
 */
export function AccessDenied({ message }: AccessDeniedProps) {
  const { user } = useAuth()

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8 text-destructive" />
        </div>
        <h2 className="text-xl font-bold mb-2">Akses Ditolak</h2>
        <p className="text-muted-foreground max-w-md mb-3">
          {message ?? "Anda tidak memiliki izin untuk mengakses halaman ini. Hubungi administrator jika Anda merasa ini adalah kesalahan."}
        </p>
        {user && (
          <p className="text-sm text-muted-foreground">
            Role saat ini:{" "}
            <span className="font-mono font-medium text-foreground">{user.role}</span>
          </p>
        )}
      </CardContent>
    </Card>
  )
}
