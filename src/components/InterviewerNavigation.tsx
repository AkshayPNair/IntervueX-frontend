"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import {useState,useEffect} from "react";
import { Button } from "@/components/ui/button";
import { Code, User, Settings, LogOut, Calendar, Clock, Video, MessageCircleMore, Bell } from "lucide-react";
import { useAuth } from '../hooks/useAuth'
import { getVerificationStatus, VerificationStatusData } from "../services/interviewerService";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNotificationCenter } from "@/hooks/useNotificationCenter";

interface verificationStatusData{
  hasSubmittedVerification:boolean
  isApproved:boolean
  profileExists:boolean 
}

const Navigation = () => {
  const pathname = usePathname();
  const { logout, user } = useAuth()
  const [verificationStatus,setVerificationStatus]=useState<VerificationStatusData | null>(null)
  const { items, unreadCount, clearAll, open, setOpen } = useNotificationCenter()

  useEffect(()=>{
    const fetchVerificationStatus=async()=>{
      if(user?.role==='interviewer'){
        try {
          const status=await getVerificationStatus()
          setVerificationStatus(status)
        } catch (error) {
          console.error('Error fetching verification status:',error)
        }
      }
    }
    fetchVerificationStatus()
  },[user])

  const navItems = [
    { href: "/interviewer/dashboard", label: "Dashboard", icon: Calendar },
    { href: "/interviewer/sessions", label: "Sessions", icon: Video },
    { href: "/interviewer/profile", label: "Profile", icon: User },
    { href: "/interviewer/add-slots", label: "Add Slots", icon: Calendar},
    { href: "/interviewer/chat", label: "Chat", icon: MessageCircleMore},
    { href: "/interviewer/wallet", label: "Wallet", icon: Clock},
    { href: "/interviewer/feedback", label: "History", icon: Clock },
    { href: "/interviewer/settings", label: "Settings", icon: Settings }
  ];

  const isApproved = verificationStatus?.isApproved ?? false
  const hasSubmittedVerification = verificationStatus?.hasSubmittedVerification ?? false;


  return (
    <nav className="glass-nav sticky top-0 z-50 px-6 py-4">
      <div className="container mx-auto flex items-center justify-between">
        <Link href={isApproved ? "/interviewer/dashboard" : "#"} className="flex items-center space-x-3 hover-glow rounded-lg p-2">
          <div className="w-10 h-10 glow-button rounded-xl flex items-center justify-center">
            <Code className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-gradient">IntervueX</span>
            <span className="text-xs text-purple-300 -mt-1">Future of Interviews</span>
          </div>
        </Link>

        {isApproved && (
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 hover-glow ${pathname === item.href
                    ? 'glow-button text-white font-medium shadow-lg'
                    : 'glass-effect text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            ))}
          </div>
        )}

        <div className="flex items-center space-x-3">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <button
                className="relative p-2 text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-white/10"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-gradient-to-r from-pink-400 to-red-400 rounded-full" />
                )}
              </button>
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

          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="text-[#7D8590] hover:text-[#E6EDF3]"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;