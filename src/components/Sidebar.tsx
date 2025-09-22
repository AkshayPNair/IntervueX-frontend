"use client"

import React from 'react';
import Link from 'next/link';
import { usePathname , useRouter} from 'next/navigation';
import {useAuth} from '../hooks/useAuth'
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Monitor,
  Settings,
  MessageSquare,
  Code,
  Shield,
  UserCheck,
  LogOut,
  Wallet
} from 'lucide-react';
import { toast } from 'sonner';





const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'User Management', href: '/admin/users', icon: Users },
  { name: 'Session Monitor', href: '/admin/sessions', icon: Monitor },
  { name: 'Interview Requests', href: '/admin/requests', icon: UserCheck },
  {name: 'Wallet', href:'/admin/wallet',icon: Wallet},
];

export default function Sidebar() {

  const {logout} =useAuth()
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const handleLogout=async()=>{
    
    toast('Are you sure you want to logout?', {
      action: {
        label: 'Logout',
        onClick: async () => {
          try {
            setIsLoggingOut(true);
            await logout();
            router.push('/auth');
            toast.success('Logged out successfully');
          } catch (error) {
            console.error('Logout failed:', error);
            toast.error('Logout failed. Please try again.');
          } finally {
            setIsLoggingOut(false);
          }
        },
      },
      cancel: {
        label: 'Cancel',
        onClick: () => {
          // Do nothing, toast will dismiss
        },
      },
    });  
  }
  return (
    <motion.div 
      className="w-64 sidebar-glow"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center h-16 px-6 border-b border-purple-500/20">
        <motion.div
          className="flex items-center"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg flex items-center justify-center pulse-glow">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="ml-3 text-xl font-bold gradient-text">Admin</span>
        </motion.div>
      </div>
      
      <nav className="mt-8 px-4">
        <ul className="space-y-2">
          {navigation.map((item, index) => (
            <motion.li 
              key={item.name}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            >
              <Link
                href={item.href}
                className={`nav-item-glow flex items-center px-4 py-3 text-sm font-medium transition-all duration-300 ${
                  pathname === item.href
                    ? 'active text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                </motion.div>
                {item.name}
                {item.name === 'Interview Requests' && (
                  <motion.span 
                    className="ml-auto bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                  >
                    1
                  </motion.span>
                )}
              </Link>
            </motion.li>
          ))}
          <motion.li 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: navigation.length * 0.1, duration: 0.3 }}
            className="mt-4"
          >
            <motion.button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className={`nav-item-glow w-full flex items-center px-4 py-3 text-sm font-medium transition-all duration-300 ${
                isLoggingOut 
                  ? 'text-gray-500 cursor-not-allowed' 
                  : 'text-gray-300 hover:text-white'
              }`}
              whileHover={!isLoggingOut ? { scale: 1.02 } : {}}
              whileTap={!isLoggingOut ? { scale: 0.98 } : {}}
            >
              <motion.div
                whileHover={!isLoggingOut ? { rotate: 15 } : {}}
                transition={{ duration: 0.3 }}
              >
                {isLoggingOut ? (
                  <div className="w-5 h-5 mr-3 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <LogOut className="w-5 h-5 mr-3" />
                )}
              </motion.div>
              <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
            </motion.button>
          </motion.li>
        </ul>
      </nav>
        
      {/* Decorative elements */}
      <div className="absolute bottom-8 left-4 right-4">
        <motion.div 
          className="glass-card-light rounded-lg p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-green-400 rounded-full pulse-glow"></div>
            <span className="text-sm text-gray-300">System Online</span>
          </div>
          <div className="mt-2 text-xs text-gray-400">
            All services operational
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
