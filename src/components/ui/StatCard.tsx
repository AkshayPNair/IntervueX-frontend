import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: {
    value: string;
    type: 'increase' | 'decrease';
  };
  className?: string;
  delay?: number;
}

export default function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  change, 
  className = '', 
  delay = 0 
}: StatCardProps) {
  return (
    <motion.div 
      className={`stat-card-glow rounded-xl p-6 floating-animation ${className}`}
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.5, 
        delay,
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <motion.p 
            className="text-2xl font-bold text-white mt-2 glow-text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.3, duration: 0.5 }}
          >
            {value}
          </motion.p>
          {change && (
            <motion.p 
              className={`text-sm mt-2 ${
                change.type === 'increase' ? 'text-green-400' : 'text-red-400'
              }`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + 0.5, duration: 0.3 }}
            >
              {change.type === 'increase' ? '↗' : '↘'} {change.value}
            </motion.p>
          )}
        </div>
        <motion.div 
          className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center pulse-glow"
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.5 }}
        >
          <Icon className="w-6 h-6 text-white" />
        </motion.div>
      </div>
    </motion.div>
  );
}