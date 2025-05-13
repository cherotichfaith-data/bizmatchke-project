"use client"

import type React from "react"

import Link from "next/link"
import Image from "next/image"
import { Twitter, Linkedin, Instagram, Mail, Phone, MapPin } from "lucide-react"
import { motion } from "framer-motion"

export default function Footer() {
  const currentYear = new Date().getFullYear()

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
  }

  return (
    <footer id="contact" className="bg-card">
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Link href="/" className="inline-block mb-6">
              <Image src="/images/logo-white.png" alt="BizMatchKE" width={180} height={50} className="h-10 w-auto" />
            </Link>
            <p className="mb-6 text-muted-foreground">Empowering Kenyan entrepreneurs through AI technology.</p>
            <div className="flex space-x-4">
              <motion.a
                href="https://x.com/i/flow/login?redirect_after_login=%2FJHUBAfrica"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:[&>svg]:text-[#14171A] transition-colors"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              >
                <Twitter size={20} />
                <span className="sr-only">Twitter</span>
              </motion.a>
              <motion.a
                href="https://www.linkedin.com/company/jhubafrica"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:[&>svg]:text-[#0077B5] transition-colors"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              >
                <Linkedin size={20} />
                <span className="sr-only">LinkedIn</span>
              </motion.a>
              <motion.a
                href="https://www.instagram.com/discoverjkuat/?hl=en#"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:[&>svg]:text-[#833AB4] transition-colors"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              >
                <Instagram size={20} />
                <span className="sr-only">Instagram</span>
              </motion.a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="text-foreground font-semibold text-lg mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#features"
                  className="text-muted-foreground hover:text-primary transition-colors inline-block hover:translate-x-1 transition-transform duration-200"
                  onClick={handleLinkClick}
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="#how-it-works"
                  className="text-muted-foreground hover:text-primary transition-colors inline-block hover:translate-x-1 transition-transform duration-200"
                  onClick={handleLinkClick}
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  href="#idea-generator"
                  className="text-muted-foreground hover:text-primary transition-colors inline-block hover:translate-x-1 transition-transform duration-200"
                  onClick={handleLinkClick}
                >
                  Idea Generator
                </Link>
              </li>
              <li>
                <Link
                  href="#team"
                  className="text-muted-foreground hover:text-primary transition-colors inline-block hover:translate-x-1 transition-transform duration-200"
                  onClick={handleLinkClick}
                >
                  Our Team
                </Link>
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <h3 className="text-foreground font-semibold text-lg mb-6">Contact Us</h3>
            <ul className="space-y-4">
              <motion.li
                className="flex items-start"
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Mail className="mr-3 h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">hello@bizmatchke.co.ke</span>
              </motion.li>
              <motion.li
                className="flex items-start"
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Phone className="mr-3 h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">+254 700 123 456</span>
              </motion.li>
              <motion.li
                className="flex items-start"
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <MapPin className="mr-3 h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">Nairobi, Kenya</span>
              </motion.li>
            </ul>
          </motion.div>
        </div>

        <div className="border-t border-border mt-12 pt-8 text-center text-muted-foreground text-sm">
          <p>© {currentYear} BizMatchKE. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
