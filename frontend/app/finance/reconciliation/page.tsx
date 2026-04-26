"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, CheckCircle, Download } from "lucide-react"

export default function FinanceReconciliationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reconciliation</h1>
        <p className="text-muted-foreground">Rekonsiliasi dan verifikasi keuangan</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Donations In</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp 250.5M</div>
            <p className="text-xs text-muted-foreground">Bulan ini</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Disbursed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp 185.2M</div>
            <p className="text-xs text-muted-foreground">Bulan ini</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">Rp 65.3M</div>
            <p className="text-xs text-muted-foreground">Saldo tersedia</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Verification Status</CardTitle>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Download Report
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { status: "verified", message: "Semua transaksi Januari terverifikasi", count: 45 },
              { status: "pending", message: "Menunggu konfirmasi bank", count: 3 },
              { status: "mismatch", message: "Selisih data perlu review", count: 1 },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                {item.status === "verified" ? (
                  <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="font-medium">{item.message}</p>
                  <p className="text-sm text-muted-foreground">{item.count} transaksi</p>
                </div>
                {item.status !== "verified" && (
                  <Button variant="outline" size="sm">
                    Review
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Reconciliation Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {["Januari 2024", "Desember 2023", "November 2023"].map((month) => (
              <div key={month} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="bg-success/10 text-success">
                    Verified
                  </Badge>
                  <p className="font-medium">{month}</p>
                </div>
                <Button variant="ghost" size="sm">
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
