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
  Wallet,                                                                                                                                                                                                                   
} from "lucide-react"
import {useAuth} from '../hooks/useAuth'

interface NavigationProps {
  isLoggedIn?: boolean;
  onLogout?: () => void;
}

export const Navigation = ({ isLoggedIn = false, onLogout }: NavigationProps) => {
  // const router = useRouter()
  const pathname = usePathname()
  const {logout}=useAuth()
  
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

          { pathname.startsWith('/user') && (
            <div className="hidden md:flex items-center space-x-1">
              <NavButton 
                href="/user/dashboard" 
                icon={Home} 
                label="Dashboard" 
                isActive={pathname === '/user/dashboard'} 
              />
              <NavButton 
                href="/user/sessions" 
                icon={CalendarIcon} 
                label="Sessions" 
                isActive={pathname === '/user/sessions'} 
              />
              <NavButton 
                href="/user/profile" 
                icon={UserCircle} 
                label="Profile" 
                isActive={pathname === '/user/profile'} 
              />
              <NavButton 
                href="/user/wallet" 
                icon={Wallet} 
                label="Wallet" 
                isActive={pathname === '/user/wallet'} 
              />
              <NavButton 
                href="/user/interviewers" 
                icon={Users} 
                label="Interviewers" 
                isActive={pathname === '/user/interviewers'} 
              />
              <NavButton 
                href="/user/feedback" 
                icon={MessageSquare} 
                label="Feedback" 
                isActive={pathname === '/user/feedback'} 
              />

            </div>
          )}

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              
              <Button
                variant="link"
                size="sm"
                onClick={logout}
                className="text-[#7D8590] hover:text-[#E6EDF3]"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  )
}