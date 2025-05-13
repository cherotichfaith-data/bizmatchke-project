"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import Image from "next/image"

interface Business {
  title: string
  description: string
  image: string
}

export default function Businesses() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const businesses: Business[] = [
    {
      title: "Fresh Produce Market",
      //description: "Local fruit and vegetable vendors providing fresh produce to communities",
      image: "/images/business-1.png",
    },
    {
      title: "Mobile Repair Shop",
      //description: "Tech entrepreneurs offering affordable device repair services",
      image: "/images/business-2.png",
    },
    {
      title: "Handmade Crafts",
      //description: "Artisans creating unique handcrafted items for local and tourist markets",
      image: "/images/business-3.png",
    },
  ]

  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  return (
    <section className="py-20 bg-muted/30">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="section-title text-foreground">
            Business <span className="text-primary">Opportunities</span>
          </h2>
          <p className="section-subtitle">Examples of ventures you could start with BizMatchKE</p>
        </motion.div>

        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.2,
              },
            },
          }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
        >
          {businesses.map((business, index) => (
            <motion.div
              key={index}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
              }}
              className="relative overflow-hidden rounded-xl shadow-lg"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="relative h-64 w-full overflow-hidden">
                <motion.div
                  animate={{
                    x: hoveredIndex === index ? "-10%" : "0%",
                  }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className="absolute inset-0 w-[120%] h-full"
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={business.image || "/placeholder.svg"}
                      alt={business.title}
                      fill
                      className="object-cover"
                      priority={index === 0}
                    />
                  </div>
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h3 className="text-lg font-semibold mb-1">{business.title}</h3>
                  <p className="text-sm text-gray-200">{business.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="max-w-3xl mx-auto mt-12 text-center"
        >
          <p className="text-muted-foreground text-body">
            Our AI-powered platform analyzes market trends, local economic conditions, and your personal profile to
            identify viable business opportunities with the highest potential for success in your region. BizMatchKE
            provides detailed insights and startup guidance tailored to Kenya's unique entrepreneurial landscape.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
