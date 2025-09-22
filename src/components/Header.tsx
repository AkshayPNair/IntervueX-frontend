"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Bell, User } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { useNotificationCenter } from '@/hooks/useNotificationCenter'

export default function Header() {
  const { items, unreadCount, clearAll, open, setOpen } = useNotificationCenter()

  return (
    <motion.header
      className="header-glow h-16 px-6 flex items-center justify-between"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center flex-1 max-w-lg"> </div>

      <div className="flex items-center space-x-4">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <motion.button
              className="relative p-2 text-gray-400 hover:text-purple-400 transition-colors rounded-lg hover:bg-purple-500/10"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <motion.span
                  className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-gradient-to-r from-pink-400 to-red-400 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                />
              )}
            </motion.button>
          </PopoverTrigger>
          <PopoverContent className="w-80 bg-[#161B22] border-[#30363D] text-white p-0" align="end">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#30363D]">
              <div className="font-semibold">Notifications</div>
              <Button variant="ghost" size="sm" className="text-[#7D8590] hover:text-white" onClick={clearAll}>
                Clear all
              </Button>
            </div>
            <div className="max-h-80 overflow-auto">
              {items.length === 0 ? (
                <div className="px-4 py-6 text-sm text-[#7D8590]">No notifications</div>
              ) : (
                <ul className="divide-y divide-[#30363D]">
                  {items.map((n) => (
                    <li key={n.id} className="px-4 py-3 hover:bg-white/5">
                      <div className="text-sm font-medium text-[#E6EDF3]">{n.title}</div>
                      {n.description && (
                        <div className="text-xs text-[#7D8590] mt-1">{n.description}</div>
                      )}
                      <div className="text-[10px] text-[#7D8590] mt-1">
                        {new Date(n.timestamp).toLocaleString()}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </PopoverContent>
        </Popover>

        <motion.div
          className="flex items-center space-x-3 glass-card-light rounded-lg px-3 py-2"
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center pulse-glow">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="text-sm">
            <div className="text-white font-medium">Admin</div>
          </div>
        </motion.div>
      </div>
    </motion.header>
  )
}