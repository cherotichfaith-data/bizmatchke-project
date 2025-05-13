"use client"

import { useEffect } from "react"

export default function ScrollToSection() {
  useEffect(() => {
    // Handle smooth scrolling for anchor links
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const anchor = target.closest('a[href^="#"]')

      if (!anchor) return

      e.preventDefault()

      const targetId = anchor.getAttribute("href")
      if (!targetId || targetId === "#") return

      const targetElement = document.querySelector(targetId)
      if (!targetElement) return

      const navbarHeight = 80 // Approximate height of the navbar
      const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight

      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      })
    }

    // Add event listener to the document
    document.addEventListener("click", handleAnchorClick)

    // Clean up
    return () => {
      document.removeEventListener("click", handleAnchorClick)
    }
  }, [])

  return null
}
