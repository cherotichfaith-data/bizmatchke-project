"use client"

import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Twitter, Linkedin, Github } from "lucide-react"
import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"

interface TeamMember {
  name: string
  description: string
  image: string
  role?: string
}

export default function Team() {
  const teamMembers: TeamMember[] = [
    {
      name: "Faith Cherotich",
      description: "Data science expert, business strategy and project lead",
      image: "/images/team-faith.jpg",
      role: "Team Lead, Data Scientist",
    },
    {
      name: "Mercy Okumu",
      description: "Machine learning specialist implementing our AI algorithms",
      image: "/images/team-mercy.jpg",
      role: "Machine Learning Engineer",
    },
    {
      name: "Vallarie Seroney",
      description: "Expert in frontend development and user experience design",
      image: "/images/team-vallary.jpg",
      role: "Web Developer",
    },
    {
      name: "Jotham Mboya",
      description: "Specializing in AI prompt engineering and web development",
      image: "/images/team-jotham.png",
      role: "Prompt Engineer DevOps",
    },
    {
      name: "Maxwell Gitonga",
      description: "Machine learning engineer optimizing our AI models",
      image: "/images/team-maxwell.jpg",
      role: "Machine Learning Engineer",
    },
  ]

  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  return (
    <section id="team" className="py-20">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="section-title text-foreground">
            Meet Our <span className="text-primary">Team</span>
          </h2>
          <p className="section-subtitle">The minds behind BizMatchKE</p>
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
                staggerChildren: 0.1,
              },
            },
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8"
        >
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
              }}
              whileHover={{ y: -5 }}
            >
              <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-card">
                <CardContent className="p-6 text-center">
                  <div className="mb-4 mx-auto w-24 h-24 relative rounded-full overflow-hidden">
                    <Image src={member.image || "/placeholder.svg"} alt={member.name} fill className="object-cover" />
                  </div>
                  <h3 className="font-semibold text-lg mb-1 text-card-foreground">{member.name}</h3>
                  {member.role && <p className="text-primary text-sm font-medium mb-2">{member.role}</p>}
                  <p className="text-muted-foreground text-sm mb-4">{member.description}</p>

                  <div className="flex justify-center space-x-3 mt-2">
                    <motion.a
                      href="#"
                      className="text-muted-foreground hover:text-[#0077b5] transition-colors duration-200"
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Linkedin size={18} />
                      <span className="sr-only">LinkedIn</span>
                    </motion.a>
                    <motion.a
                      href="#"
                      className="text-muted-foreground hover:text-[#171515] transition-colors duration-200"
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Github size={18} />
                      <span className="sr-only">GitHub</span>
                    </motion.a>
                    <motion.a
                      href="#"
                      className="text-muted-foreground hover:text-[#1DA1F2] transition-colors duration-200"
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Twitter size={18} />
                      <span className="sr-only">Twitter</span>
                    </motion.a>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
