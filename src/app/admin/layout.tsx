"use client"

import { ProtectedRoute } from '../../components/ProtectedRoute'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { motion } from 'framer-motion';
import './index.css'
import ParticleBackground from '../../components/ui/ParticleBackgroundAdmin'

export default function AdminLayout({ children }: {children:React.ReactNode}){
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="flex h-screen relative overflow-hidden">
      <ParticleBackground />
      
      <div className="content-overlay flex h-screen w-full">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <motion.main 
            className="flex-1 overflow-x-hidden overflow-y-auto p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {children}
          </motion.main>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  )
}