"use client"

import {  useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSelector} from "react-redux"
import { RootState } from "../store"
import { useSession } from "./SessionProvider"

export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    isApproved?:boolean;
}

interface ProtectedRouteProps{
    children:React.ReactNode
    allowedRoles:string[]
    fallbackPath?:string
    requireApproval?:boolean
}

function GradientSpinner() {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#BC8CFF] border-opacity-60 border-t-[#58A6FF]"></div>
      </div>
    );
}

export const ProtectedRoute=({
    children,
    allowedRoles,
    fallbackPath='/auth',
    requireApproval=false
}:ProtectedRouteProps)=>{
    const router=useRouter()
    const user=useSelector((state:RootState)=>state.auth.user)as User|null
    const {isLoading}=useSession()

    useEffect(()=>{
        if(isLoading) return;

        if(!user){
            router.push(fallbackPath)
            return
        }

        if (requireApproval && user.role === 'interviewer' && !user.isApproved) {
            router.push('/interviewer/verification')
            return
        }

        if(!allowedRoles.includes(user.role)){
            switch(user.role){
                case 'admin':
                    router.push('/admin/dashboard')
                    break
                case 'interviewer':
                    if (user.isApproved) {
                        router.push('/interviewer/dashboard')
                    } else {
                        router.push('/interviewer/verification')
                    }
                    break
                case 'user':
                    router.push('/user/dashboard')
                    break
                default:
                    router.push(fallbackPath)            
            }
            return 
        }
    },[user,router,allowedRoles,fallbackPath,isLoading,requireApproval])

    if(isLoading){
        return <GradientSpinner/>
    }

    return <>{children}</>
}