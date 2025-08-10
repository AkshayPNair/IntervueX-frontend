"use client"

import { ProtectedRoute } from "../../components/ProtectedRoute"
import {Navigation} from '../../components/userNavigation'
import {useAuth} from '../../hooks/useAuth'

export default function UserLayout({children}:{children:React.ReactNode}){
    const {isLoggedIn, logout} = useAuth()


    return(
        <ProtectedRoute allowedRoles={['user']}>
            <Navigation />
            <main className="">
                {children}
            </main>
        </ProtectedRoute>
    )
}