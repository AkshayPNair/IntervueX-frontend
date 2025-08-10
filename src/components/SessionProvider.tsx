"use client"

import { useEffect,useState, createContext, useContext } from "react"
import { useDispatch,useSelector} from "react-redux"
import { setUser } from "../store/authSlice"
import { refreshToken} from "../services/authService"
import { RootState } from "../store"

const SessionContext=createContext({isLoading:true})

export function useSession(){
    return useContext(SessionContext)
}

export function SessionProvider({children}:{children:React.ReactNode}){
    const dispatch=useDispatch()
    const [isLoading,setIsLoading]=useState(true)
    const user = useSelector((state: RootState) => state.auth.user)

    useEffect(()=>{

        if (user) {
            setIsLoading(false)
            return
        }

        const initializeAuth=async()=>{
            try {
                const data=await refreshToken()
                dispatch(setUser(data.user))
            } catch (error:any) {
                if (error?.response?.status !== 401) {
                    console.log('Session initialization failed:', error.message)
                }
            }finally{
                setIsLoading(false)
            }
        }
        initializeAuth()
    },[dispatch,user])


    return (
        <SessionContext.Provider value={{isLoading}}>
            {children}
        </SessionContext.Provider>
    )
}