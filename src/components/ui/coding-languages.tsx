"use client"

import { motion } from "framer-motion"
import { Code } from "lucide-react"

export const CodingLanguages = () => {
  const languages = [
    "JavaScript",
    "Python",
    "Java",
    "C++",
    "React",
    "Node.js",
    "TypeScript",
    "Go",
    "Rust",
    "Swift",
    "Kotlin",
    "PHP",
    "Ruby",
    "C#",
    "Scala",
    "Dart",
    "Flutter",
  ]

  return (
    <div className="overflow-hidden py-8 bg-gradient-to-r from-[#0D1117] via-[#161B22] to-[#0D1117]">
      <motion.div
        className="flex space-x-8 whitespace-nowrap"
        animate={{
          x: [0, -2000],
        }}
        transition={{
          duration: 30,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      >
        {[...languages, ...languages, ...languages].map((lang, index) => (
          <div
            key={index}
            className="flex items-center space-x-2 bg-[#161B22]/50 backdrop-blur-sm border border-[#30363D] rounded-lg px-4 py-2"
          >
            <Code className="w-4 h-4 text-[#BC8CFF]" />
            <span className="text-[#E6EDF3] font-medium">{lang}</span>
          </div>
        ))}
      </motion.div>
    </div>
  )
}