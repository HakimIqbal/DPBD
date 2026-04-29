"use client"

import { ShieldAlert, Wrench } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { PermissionGate } from "@/components/ui/permission-gate"
import { AccessDenied } from "@/components/admin/access-denied"
import { Permission } from "@/lib/permissions"

export default function RiskPage() {
  return (
    <PermissionGate require={Permission.READ_RISK} fallback={<AccessDenied />}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldAlert className="w-6 h-6" />
            Risk & Compliance
          </h1>
          <p className="text-muted-foreground">Monitoring eksposur dan threshold risiko</p>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Wrench className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold mb-1">Modul ini sedang dalam pengembangan</h2>
            <p className="text-sm text-muted-foreground max-w-md">
              Dashboard risk & compliance akan segera tersedia. Saat ini Anda hanya melihat halaman placeholder.
            </p>
          </CardContent>
        </Card>
      </div>
    </PermissionGate>
  )
}
