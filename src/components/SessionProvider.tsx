"use client"

import { useEffect,useState, createContext, useContext  } from "react"
import { useDispatch} from "react-redux"
import { setUser } from "../store/authSlice"
import { fetchMe } from "../services/authService"

const SessionContext=createContext({isLoading:true})

export function useSession(){
    return useContext(SessionContext)
}

export function SessionProvider({children}:{children:React.ReactNode}){
    const dispatch=useDispatch()
    const [isLoading,setIsLoading]=useState(true)

    useEffect(()=>{
        fetchMe()
        .then((data)=>{
            dispatch(setUser(data.user))
            setIsLoading(false)
        })
        .catch(()=>{
            dispatch(setUser(null))
            setIsLoading(false)
        })
    },[dispatch])

    return (
        <SessionContext.Provider value={{isLoading}}>
            {children}
        </SessionContext.Provider>
    )
}