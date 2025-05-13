"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { LogOut, Menu, X, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

export default function DashboardNavbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
  }

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-background/90 backdrop-blur-md shadow-md py-2 sticky top-0 z-50"
    >
      <div className="container flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center">
          <Image src="/images/logo-white.png" alt="BizMatchKE Logo" width={180} height={50} className="h-10 w-auto" />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <Link
            href="/dashboard"
            className="text-foreground hover:text-primary font-medium transition-colors duration-200"
          >
            Dashboard
          </Link>
          <Link
            href="/dashboard/idea-generator"
            className="text-foreground hover:text-primary font-medium transition-colors duration-200"
          >
            Generate Ideas
          </Link>
          <Link
            href="/dashboard/saved-ideas"
            className="text-foreground hover:text-primary font-medium transition-colors duration-200"
          >
            Saved Ideas
          </Link>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="bg-primary/20 p-1 rounded-full">
                <User className="h-5 w-5 text-primary" />
              </div>
              <span className="text-foreground">{user?.name}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-destructive"
            >
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Logout</span>
            </Button>
          </div>
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
              href="/dashboard"
              className="text-foreground hover:text-primary font-medium py-2 transition-colors duration-200"
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/idea-generator"
              className="text-foreground hover:text-primary font-medium py-2 transition-colors duration-200"
              onClick={() => setIsOpen(false)}
            >
              Generate Ideas
            </Link>
            <Link
              href="/dashboard/saved-ideas"
              className="text-foreground hover:text-primary font-medium py-2 transition-colors duration-200"
              onClick={() => setIsOpen(false)}
            >
              Saved Ideas
            </Link>

            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div className="flex items-center space-x-2">
                <div className="bg-primary/20 p-1 rounded-full">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <span className="text-foreground">{user?.name}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-destructive"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.nav>
  )
}
