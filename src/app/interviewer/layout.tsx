"use client"

import { ProtectedRoute } from '../../components/ProtectedRoute'
import Navigation from '../../components/InterviewerNavigation'
import './index.css'
import { usePathname } from 'next/navigation'

export default function InterviewerLayout ({ children }:{children:React.ReactNode}){
  const pathname = usePathname();
  const hideHeader = pathname?.startsWith('/interviewer/sessions/');
  return (
    <ProtectedRoute allowedRoles={['interviewer']}>
      {!hideHeader && <Navigation />}
      <main className="">
        {children}
      </main>
    </ProtectedRoute>
  )
}