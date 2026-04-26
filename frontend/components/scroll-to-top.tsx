"use client"

import { usePathname } from "next/navigation"
import { useEffect } from "react"

export function ScrollToTop() {
  const pathname = usePathname()

  useEffect(() => {
    // Scroll to top whenever pathname changes
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }, 0)
  }, [pathname])

  return null
}
