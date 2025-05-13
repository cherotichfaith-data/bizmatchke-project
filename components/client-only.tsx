"use client"

import type React from "react"

import { useEffect, useState } from "react"

interface ClientOnlyProps {
  children: React.ReactNode
  hideOnMobile?: boolean
}

export default function ClientOnly({ children, hideOnMobile = false }: ClientOnlyProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMounted(true)

    // Check if we're on mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Initial check
    checkMobile()

    // Add resize listener
    window.addEventListener("resize", checkMobile)

    // Cleanup
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Don't render anything on the server
  if (!isMounted) return null

  // If hideOnMobile is true and we're on mobile, don't render
  if (hideOnMobile && isMobile) return null

  // Otherwise render children
  return <>{children}</>
}
