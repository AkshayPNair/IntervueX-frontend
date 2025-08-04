"use client"

import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

export const FAQItem = ({ question, answer, isOpen, onToggle }: FAQItemProps) => (
  <motion.div
    className="border border-[#30363D] rounded-lg overflow-hidden bg-[#161B22]/50 backdrop-blur-md"
    whileHover={{ borderColor: "#BC8CFF" }}
    transition={{ duration: 0.2 }}
  >
    <button
      onClick={onToggle}
      className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-[#30363D]/30 transition-colors"
    >
      <h3 className="text-[#E6EDF3] font-semibold text-lg">{question}</h3>
      <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
        <ChevronDown className="w-5 h-5 text-[#BC8CFF]" />
      </motion.div>
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="px-6 pb-4 text-[#7D8590] leading-relaxed">{answer}</div>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
)