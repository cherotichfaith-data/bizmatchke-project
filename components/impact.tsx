"use client"

import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"

export default function Impact() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  return (
    <section className="py-20">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <h2 className="section-title text-foreground">
            Driving Kenya's <span className="text-primary">Economic Growth</span>
          </h2>
          <p className="section-subtitle">BizMatchKE contributes to Sustainable Development Goals</p>
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
          className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto"
        >
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            whileHover={{ scale: 1.03 }}
            className="bg-card border border-primary/20 rounded-xl p-8 shadow-md"
          >
            <div className="text-5xl font-bold text-primary mb-4">1</div>
            <h3 className="text-xl font-semibold mb-3 text-card-foreground">No Poverty</h3>
            <p className="text-muted-foreground">
              Creating income opportunities for all Kenyans through accessible entrepreneurship
            </p>
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            whileHover={{ scale: 1.03 }}
            className="bg-card border border-primary/20 rounded-xl p-8 shadow-md"
          >
            <div className="text-5xl font-bold text-primary mb-4">8</div>
            <h3 className="text-xl font-semibold mb-3 text-card-foreground">Decent Work</h3>
            <p className="text-muted-foreground">Promoting sustainable entrepreneurship and innovation across Kenya</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
