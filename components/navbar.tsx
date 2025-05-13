"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { motion } from "framer-motion"
import { useAuth } from "@/contexts/auth-context"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { user, logout } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const href = e.currentTarget.getAttribute("href")

    if (href && href.startsWith("#")) {
      const targetId = href
      const targetElement = document.querySelector(targetId)

      if (targetElement) {
        const navbarHeight = 80 // Approximate height of the navbar
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        })

        // Update URL without page reload
        window.history.pushState(null, "", href)
      }
    }

    setIsOpen(false)
  }

  const handleLogout = async () => {
    await logout()
  }

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-background/90 backdrop-blur-md shadow-md py-2" : "bg-transparent py-4"
      }`}
    >
      <div className="container flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image src="/images/logo-white.png" alt="BizMatchKE Logo" width={180} height={50} className="h-10 w-auto" />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <Link
            href="#features"
            className="text-foreground hover:text-primary font-medium transition-colors duration-200"
            onClick={handleLinkClick}
          >
            Features
          </Link>
          <Link
            href="#how-it-works"
            className="text-foreground hover:text-primary font-medium transition-colors duration-200"
            onClick={handleLinkClick}
          >
            How It Works
          </Link>
          <Link
            href="#team"
            className="text-foreground hover:text-primary font-medium transition-colors duration-200"
            onClick={handleLinkClick}
          >
            Our Team
          </Link>
          <Link
            href="/resources"
            className="text-foreground hover:text-primary font-medium transition-colors duration-200"
          >
            Resources
          </Link>
          {user ? (
            <div className="flex items-center space-x-4">
              <Button
                asChild
                className="transition-transform duration-200 hover:scale-105 bg-secondary text-secondary-foreground"
              >
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <Button
                variant="ghost"
                className="transition-transform duration-200 hover:scale-105"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          ) : (
            <Button asChild className="transition-transform duration-200 hover:scale-105 bg-primary text-background">
              <Link href="/login">Login / Register</Link>
            </Button>
          )}
        </div>

        {/* Mobile Navigation Toggle */}
        <div className="md:hidden flex items-center space-x-2">
          <button
            className="text-foreground p-2 rounded-md hover:bg-muted transition-colors duration-200"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="md:hidden absolute top-full left-0 right-0 bg-background/90 backdrop-blur-md shadow-lg py-4 px-4"
        >
          <div className="flex flex-col space-y-4">
            <Link
              href="#features"
              className="text-foreground hover:text-primary font-medium py-2 transition-colors duration-200"
              onClick={handleLinkClick}
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-foreground hover:text-primary font-medium py-2 transition-colors duration-200"
              onClick={handleLinkClick}
            >
              How It Works
            </Link>
            <Link
              href="#team"
              className="text-foreground hover:text-primary font-medium py-2 transition-colors duration-200"
              onClick={handleLinkClick}
            >
              Our Team
            </Link>
            <Link
              href="/resources"
              className="text-foreground hover:text-primary font-medium py-2 transition-colors duration-200"
              onClick={() => setIsOpen(false)}
            >
              Resources
            </Link>
            {user ? (
              <>
                <Button
                  asChild
                  className="w-full transition-transform duration-200 hover:scale-105 bg-secondary text-secondary-foreground"
                >
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full transition-transform duration-200 hover:scale-105"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </>
            ) : (
              <Button
                asChild
                className="w-full transition-transform duration-200 hover:scale-105 bg-primary text-background"
              >
                <Link href="/login">Login / Register</Link>
              </Button>
            )}
          </div>
        </motion.div>
      )}
    </motion.nav>
  )
}
