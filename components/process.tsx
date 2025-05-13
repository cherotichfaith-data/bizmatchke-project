"use client"

import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"

export default function Process() {
  const steps = [
    {
      number: 1,
      title: "Tell Us About You",
      description: "Share your skills, interests, and available budget",
    },
    {
      number: 2,
      title: "AI Magic Happens",
      description: "Our system analyzes thousands of data points",
    },
    {
      number: 3,
      title: "Get Custom Ideas",
      description: "Receive 3-5 tailored business recommendations",
    },
  ]

  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  return (
    <section id="how-it-works" className="py-20 bg-muted/30">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="section-title text-foreground">
            How <span className="text-primary">BizMatchKE</span> Works
          </h2>
          <p className="section-subtitle">
            Our AI-powered platform makes finding your perfect business idea simple and effective
          </p>
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
                staggerChildren: 0.3,
              },
            },
          }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
        >
          {steps.map((step, index) => (
            <motion.div
              key={index}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
              }}
              className="relative"
            >
              <div className="flex flex-col items-center text-center">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  className="w-16 h-16 rounded-full bg-primary text-background flex items-center justify-center text-2xl font-bold mb-6"
                >
                  {step.number}
                </motion.div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>

              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[calc(100%_-_16px)] w-[calc(100%_-_32px)] h-0.5 bg-border" />
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
