"use client"

import { Zap, Coins, MapPin } from "lucide-react"
import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"

export default function Features() {
  const features = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Instant Recommendations",
      description: "Get personalized business ideas in seconds based on your unique profile",
    },
    {
      icon: <Coins className="h-6 w-6" />,
      title: "Budget-Smart",
      description: "Ideas tailored to your available capital, from 10K to 1M+ KES",
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Location-Aware",
      description: "Recommendations optimized for your county and local market",
    },
  ]

  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  }

  return (
    <section id="features" className="py-20">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="section-title text-foreground">
            Why Choose <span className="text-primary">BizMatchKE</span>
          </h2>
          <p className="section-subtitle">We're revolutionizing entrepreneurship in Kenya</p>
        </motion.div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{
                scale: 1.03,
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)",
              }}
              className="bg-card rounded-xl p-8 shadow-md border border-border hover:border-primary/50 transition-all duration-300"
            >
              <div className="w-14 h-14 bg-primary/20 rounded-full flex items-center justify-center text-primary mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3 text-card-foreground">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
