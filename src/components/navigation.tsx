"use client"

import { motion } from "framer-motion"
import { usePathname } from "next/navigation"
import Link from "next/link"                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Home,
  UserCircle,
  Users,
  MessageSquare,
  LogOut,                                                                                                                                                                                                                                                                                                                                                                                           
  CalendarIcon,                                                                                                                                                                                                                   
} from "lucide-react"

interface NavigationProps {
  isLoggedIn?: boolean;
  onLogout?: () => void;
}

export const Navigation = ({ isLoggedIn = false, onLogout }: NavigationProps) => {
  // const router = useRouter()
  const pathname = usePathname()
  
  const NavButton = ({ href, icon: Icon, label, isActive }: { 
    href: string; 
    icon: any; 
    label: string; 
    isActive?: boolean; 
  }) => (
    <Link href={href}>
      <motion.button
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
          isActive
            ? "bg-[#BC8CFF]/20 text-[#BC8CFF] shadow-lg"
            : "text-[#7D8590] hover:text-[#E6EDF3] hover:bg-[#30363D]/50"
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Icon className="w-4 h-4" />
        <span className="text-sm font-medium">{label}</span>
      </motion.button>
    </Link>
  )

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-40 bg-[#0D1117]/95 backdrop-blur-xl border-b border-[#30363D]/50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/">
            <motion.div
              className="flex items-center space-x-4 cursor-pointer"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-2xl font-bold bg-gradient-to-r from-[#BC8CFF] to-[#58A6FF] bg-clip-text text-transparent">
                IntervueX
              </div>
            </motion.div>
          </Link>

          {isLoggedIn && pathname.startsWith('/dashboard') && (
            <div className="hidden md:flex items-center space-x-1">
              <NavButton 
                href="/dashboard" 
                icon={Home} 
                label="Dashboard" 
                isActive={pathname === '/dashboard'} 
              />
              <NavButton 
                href="/sessions" 
                icon={CalendarIcon} 
                label="Sessions" 
                isActive={pathname === '/sessions'} 
              />
              <NavButton 
                href="/profile" 
                icon={UserCircle} 
                label="Profile" 
                isActive={pathname === '/profile'} 
              />
              <NavButton 
                href="/interviewers" 
                icon={Users} 
                label="Interviewers" 
                isActive={pathname === '/interviewers'} 
              />
              <NavButton 
                href="/feedback" 
                icon={MessageSquare} 
                label="Feedback" 
                isActive={pathname === '/feedback'} 
              />
            </div>
          )}

          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <div className="flex items-center space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiM2Qjc4ODQiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDEyQzE0LjIwOTEgMTIgMTYgMTAuMjA5MSAxNiA4QzE2IDUuNzkwODYgMTQuMjA5MSA0IDEyIDRDOS43OTA4NiA0IDggNS43OTA4NiA4IDhDOCAxMC4yMDkxIDkuNzkwODYgMTIgMTJaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTIgMTRDMTAgMzQgMTAgMzQgMTAgMzRIMTRDMTQgMzQgMTQgMzQgMTIgMTRaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4KPC9zdmc+" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onLogout}
                  className="text-[#7D8590] hover:text-[#E6EDF3]"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Link href="/auth">
                <Button className="bg-gradient-to-r from-[#BC8CFF] to-[#3B0A58] hover:from-[#BC8CFF]/80 hover:to-[#3B0A58]/80 text-white shadow-lg hover:shadow-[0_0_18px_rgba(188,140,255,0.5)] transition-all duration-300">
                  Get Started
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  )
}