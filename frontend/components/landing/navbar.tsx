"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Menu, X, LogIn } from "lucide-react"

const navItems = [
  { href: "tentang", label: "Tentang" },
  { href: "program", label: "Program" },
  { href: "transparansi", label: "Transparansi" },
  { href: "dampak", label: "Dampak" },
  { href: "faq", label: "FAQ" },
]

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("")
  const [scrolled, setScrolled] = useState(false)

  // Scroll spy - detect which section is in view
  useEffect(() => {
    const handleScroll = () => {
      // Check if scrolled past threshold for navbar bg change
      setScrolled(window.scrollY > 50)

      // Find active section
      const sections = navItems.map((item) => document.getElementById(item.href))
      const scrollPosition = window.scrollY + 100

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i]
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(navItems[i].href)
          break
        }
      }

      // If at top, no active section
      if (window.scrollY < 100) {
        setActiveSection("")
      }
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll() // Initial check
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Smooth scroll to section
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    const element = document.getElementById(href)
    if (element) {
      const offset = 80 // navbar height
      const elementPosition = element.getBoundingClientRect().top + window.scrollY
      window.scrollTo({
        top: elementPosition - offset,
        behavior: "smooth",
      })
    }
    setIsOpen(false)
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/95 backdrop-blur-md shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <Image
                src="/logo-dpbd.png"
                alt="DPBD Logo"
                width={44}
                height={44}
                className="rounded-xl transition-transform group-hover:scale-105"
              />
            </div>
            <div className="flex flex-col">
              <span
                className={`font-bold text-base transition-colors ${scrolled ? "text-gray-900" : "text-white"}`}
              >
                DPBD
              </span>
              <span className={`text-xs font-semibold transition-colors ${scrolled ? "text-gray-500" : "text-white/70"}`}>
                PPI DUNIA
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center">
            <div className={`flex items-center gap-1 p-1 rounded-full ${scrolled ? "bg-gray-100" : "bg-white/10"}`}>
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={`#${item.href}`}
                  onClick={(e) => scrollToSection(e, item.href)}
                  className={`relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
                    activeSection === item.href
                      ? scrolled
                        ? "bg-[#5C1515] text-white shadow-md"
                        : "bg-white text-[#5C1515] shadow-md"
                      : scrolled
                        ? "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                        : "text-white/80 hover:text-white hover:bg-white/20"
                  }`}
                >
                  {item.label}
                  {activeSection === item.href && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-current opacity-0" />
                  )}
                </a>
              ))}
            </div>
          </nav>

          {/* Login Button */}
          <div className="hidden lg:block">
            <Button
              asChild
              className={`px-6 py-2.5 rounded-full font-medium transition-all duration-300 ${
                scrolled
                  ? "bg-[#5C1515] hover:bg-[#3d0e0e] text-white shadow-lg shadow-[#5C1515]/20"
                  : "bg-white hover:bg-white/90 text-[#5C1515] shadow-lg shadow-black/10"
              }`}
            >
              <Link href="/auth/login" className="flex items-center gap-2">
                <LogIn className="w-4 h-4" />
                Masuk
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`lg:hidden p-2 rounded-lg transition-colors ${
              scrolled ? "text-gray-900 hover:bg-gray-100" : "text-white hover:bg-white/10"
            }`}
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-white border-t border-gray-100 shadow-lg">
          <nav className="flex flex-col px-4 py-4">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={`#${item.href}`}
                onClick={(e) => scrollToSection(e, item.href)}
                className={`px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  activeSection === item.href
                    ? "bg-[#5C1515]/10 text-[#5C1515]"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {item.label}
              </a>
            ))}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <Button asChild className="w-full bg-[#5C1515] hover:bg-[#3d0e0e] rounded-full">
                <Link href="/auth/login" className="flex items-center justify-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Masuk
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}
