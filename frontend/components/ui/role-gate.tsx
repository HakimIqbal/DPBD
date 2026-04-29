"use client"

import type { ReactNode } from "react"
import { useAuth } from "@/lib/auth-context"
import type { UserRole } from "@/lib/permissions"

interface RoleGateProps {
  /** Roles allowed to see `children`. The user must hold one of these. */
  roles: UserRole[]
  /** Rendered when the user is missing or holds a different role. Defaults to `null`. */
  fallback?: ReactNode
  children: ReactNode
}

/**
 * Conditionally renders its children when the current user's role is in the
 * `roles` allowlist. UI affordance only — backend RolesGuard / PermissionsGuard
 * are the security boundary.
 *
 * @example
 *   <RoleGate roles={["admin", "ceo"]}>
 *     <DangerButton />
 *   </RoleGate>
 */
export function RoleGate({ roles, fallback = null, children }: RoleGateProps) {
  const { user } = useAuth()
  if (!user) return <>{fallback}</>
  return roles.includes(user.role) ? <>{children}</> : <>{fallback}</>
}
