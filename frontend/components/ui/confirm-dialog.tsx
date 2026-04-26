"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AlertTriangle, Trash2 } from "lucide-react"

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: "danger" | "warning" | "default"
  onConfirm: () => void
}

const iconMap = {
  danger: Trash2,
  warning: AlertTriangle,
  default: AlertTriangle,
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Ya, Lanjutkan",
  cancelText = "Batal",
  variant = "danger",
  onConfirm,
}: ConfirmDialogProps) {
  const Icon = iconMap[variant]

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-full ${
                variant === "danger" ? "bg-destructive/10" : variant === "warning" ? "bg-yellow-500/10" : "bg-muted"
              }`}
            >
              <Icon
                className={`w-5 h-5 ${
                  variant === "danger"
                    ? "text-destructive"
                    : variant === "warning"
                      ? "text-yellow-600"
                      : "text-muted-foreground"
                }`}
              />
            </div>
            <AlertDialogTitle>{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pl-11">{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={
              variant === "danger"
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : variant === "warning"
                  ? "bg-yellow-600 text-white hover:bg-yellow-700"
                  : ""
            }
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
