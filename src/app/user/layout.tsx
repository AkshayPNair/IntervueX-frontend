"use client"

import { ProtectedRoute } from "../../components/ProtectedRoute"
import {Navigation} from '../../components/userNavigation'
import {useAuth} from '../../hooks/useAuth'
import { usePathname } from 'next/navigation'   

export default function UserLayout({children}:{children:React.ReactNode}){
    const pathname = usePathname();
    const hideHeader = pathname?.startsWith('/user/sessions/');
    const {isLoggedIn, logout} = useAuth()


    return(
        <ProtectedRoute allowedRoles={['user']}>
             {!hideHeader && <Navigation />}
            <main className="">
                {children}
            </main>
        </ProtectedRoute>
    )
}