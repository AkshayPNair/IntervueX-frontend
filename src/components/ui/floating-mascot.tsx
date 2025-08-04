"use client"

import { motion } from "framer-motion"
import { Code } from "lucide-react"

export const FloatingMascot = () => (
  <motion.div
    className="fixed bottom-8 right-8 z-50 w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center shadow-lg cursor-pointer"
    animate={{
      y: [0, -10, 0],
    }}
    transition={{
      duration: 2,
      repeat: Number.POSITIVE_INFINITY,
      repeatType: "loop",
    }}
    whileHover={{ scale: 1.1 }}
  >
    <Code className="w-8 h-8 text-white" />
  </motion.div>
)