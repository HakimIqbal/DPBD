"use client"

import { createContext, useContext, useState, useEffect, useMemo, useCallback, type ReactNode } from "react"
import {
  Permission,
  permissionsForRole,
  hasPermission as roleHasPermission,
  type UserRole,
} from "@/lib/permissions"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

export type { UserRole }

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  country?: string
  companyName?: string
  npwp?: string
  picName?: string
  companyAddress?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  permissions: Permission[]
  hasPermission: (p: Permission) => boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; redirectTo?: string }>
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

interface RegisterData {
  email: string
  password: string
  name: string
  type: "personal" | "company"
  country?: string
  companyName?: string
  npwp?: string
  picName?: string
  companyAddress?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function getRedirectPath(role: UserRole): string {
  switch (role) {
    case "admin":
      return "/admin"
    case "editor":
      return "/editor"
    case "finance":
      return "/finance"
    case "personal":
    case "company":
      return "/user"
    // Organizational roles all land on the admin shell — sidebar gates
    // expose only the menu items each role is allowed to use.
    case "ceo":
    case "cfo":
    case "investment_manager":
    case "risk_manager":
    case "ethic_committee":
    case "audit_independent":
    case "dewan_pengawas":
    case "dewan_pembina":
    case "partnership_onboarding":
      return "/admin"
    default:
      return "/"
  }
}

async function callAuthAPI(endpoint: string, payload: Record<string, unknown>) {
  const token = typeof window !== "undefined" ? localStorage.getItem("dpbd_token") : null

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }))
    throw new Error(error.message || "Auth failed")
  }

  return response.json()
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const stored = localStorage.getItem("dpbd_user")
      const token = localStorage.getItem("dpbd_token")
      if (stored && token) {
        const parsedUser = JSON.parse(stored)
        setUser(parsedUser)
      }
    } catch (error) {
      // Silent error handling
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await callAuthAPI("/auth/login", { email, password })

      const userData: User = response.user
      setUser(userData)

      // Store token and user
      try {
        localStorage.setItem("dpbd_token", response.access_token)
        localStorage.setItem("dpbd_user", JSON.stringify(userData))
      } catch (error) {
        // Silent error handling
      }

      const redirectTo = getRedirectPath(userData.role)
      return { success: true, redirectTo }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login gagal"
      return { success: false, error: message }
    }
  }

  const register = async (data: RegisterData) => {
    try {
      const payload = {
        email: data.email,
        password: data.password,
        name: data.name,
        role: data.type,
        ...(data.country && { country: data.country }),
        ...(data.companyName && { companyName: data.companyName }),
        ...(data.npwp && { npwp: data.npwp }),
        ...(data.picName && { picName: data.picName }),
        ...(data.companyAddress && { companyAddress: data.companyAddress }),
      }

      const response = await callAuthAPI("/auth/register", payload)

      const userData: User = response.user
      setUser(userData)

      // Store token and user
      try {
        localStorage.setItem("dpbd_token", response.access_token)
        localStorage.setItem("dpbd_user", JSON.stringify(userData))
      } catch (error) {
        // Silent error handling
      }

      return { success: true }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Registrasi gagal"
      return { success: false, error: message }
    }
  }

  const logout = () => {
    setUser(null)
    try {
      localStorage.removeItem("dpbd_user")
      localStorage.removeItem("dpbd_token")
    } catch (error) {
      // Silent error handling
    }
  }

  // Permissions are derived from the current user's role. Recomputed only
  // when role changes — guards against re-renders from unrelated state.
  const permissions = useMemo<Permission[]>(
    () => permissionsForRole(user?.role ?? null),
    [user?.role],
  )

  const hasPermission = useCallback(
    (p: Permission) => roleHasPermission(user?.role ?? null, p),
    [user?.role],
  )

  return (
    <AuthContext.Provider
      value={{ user, isLoading, permissions, hasPermission, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}
