"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LightbulbIcon, MapPinIcon } from "lucide-react"
import { motion } from "framer-motion"

export default function Hero() {
  return (
    <section className="pt-24 pb-16 md:pt-32 md:pb-24">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="section-title text-foreground"
            >
              Launch Your Dream Business in <span className="text-primary">Kenya</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-xl text-muted-foreground md:text-2xl"
            >
              AI-powered business ideas tailored to your skills, budget, and location
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 sm:gap-6"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-4 bg-card p-4 rounded-lg shadow-sm"
              >
                <div className="bg-primary/20 p-2 rounded-full">
                  <LightbulbIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <span className="block font-semibold text-card-foreground">AI-Powered</span>
                  <span className="text-muted-foreground text-sm">Idea Generation</span>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-4 bg-card p-4 rounded-lg shadow-sm"
              >
                <div className="bg-primary/20 p-2 rounded-full">
                  <MapPinIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <span className="block font-semibold text-card-foreground">Kenya-Focused</span>
                  <span className="text-muted-foreground text-sm">Market Insights</span>
                </div>
              </motion.div>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 0.5 }}>
              <Button
                asChild
                size="lg"
                className="mt-4 transition-transform duration-200 hover:scale-105 bg-primary text-background"
              >
                <Link href="/login" className="text-base flex items-center gap-2">
                  Get Started
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-arrow-right"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="relative"
          >
            <Image
              src="/images/hero-illustration.png"
              alt="AI-powered business ideas for Kenya"
              width={600}
              height={500}
              className="w-full h-auto"
              priority
            />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
