"use client"

import { ProtectedRoute } from '../../components/ProtectedRoute'
import Navigation from '../../components/InterviewerNavigation'
import './index.css'

export default function InterviewerLayout ({ children }:{children:React.ReactNode}){
  return (
    <ProtectedRoute allowedRoles={['interviewer']}>
      <Navigation />
      <main className="">
        {children}
      </main>
    </ProtectedRoute>
  )
}