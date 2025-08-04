"use client"

import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Search, User } from 'lucide-react';

export default function Header() {
  return (
    <motion.header 
      className="header-glow h-16 px-6 flex items-center justify-between"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center flex-1 max-w-lg"> </div>
      
      <div className="flex items-center space-x-4">
        <motion.button 
          className="relative p-2 text-gray-400 hover:text-purple-400 transition-colors rounded-lg hover:bg-purple-500/10"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Bell className="w-5 h-5" />
          <motion.span 
            className="absolute top-0 right-0 w-2 h-2 bg-gradient-to-r from-pink-400 to-red-400 rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          />
        </motion.button>
        
        <motion.div 
          className="flex items-center space-x-3 glass-card-light rounded-lg px-3 py-2"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center pulse-glow">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="text-sm">
            <div className="text-white font-medium">Admin </div>
            
          </div>
        </motion.div>
      </div>
    </motion.header>
  );
}