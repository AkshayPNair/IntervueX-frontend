"use client"

import { motion } from "framer-motion"

interface ParticleProps {
  delay?: number;
}

export const Particle = ({ delay = 0 }: ParticleProps) => (
  <motion.div
    className="absolute w-1 h-1 bg-purple-400 rounded-full opacity-30"
    initial={{ x: 0, y: 0, opacity: 0 }}
    animate={{
      x: [0, Math.random() * 100 - 50],
      y: [0, Math.random() * 100 - 50],
      opacity: [0, 0.6, 0],
    }}
    transition={{
      duration: 4,
      delay,
      repeat: Number.POSITIVE_INFINITY,
      repeatType: "loop",
    }}
    style={{
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
    }}
  />
)