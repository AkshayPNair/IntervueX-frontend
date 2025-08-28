import { useState } from "react";
import { CompleteBookingData } from "@/types/booking.types";
import { completeBooking } from "@/services/bookingService";

interface UseCompleteBookingReturn {
    completeSession: (data: CompleteBookingData) => Promise<void>
    loading: boolean
    error: string | null
}

export const useCompleteBooking=():UseCompleteBookingReturn=>{
    const [loading,setLoading]=useState<boolean>(false)
    const [error,setError]=useState<string | null>(null)

    const completeSession=async (data:CompleteBookingData):Promise<void>=>{
        setLoading(true)
        setError(null)
        try{
            await completeBooking(data)
        }catch(error:any){
            console.error('Error completing booking:', error)
            setError(error?.response?.data?.error || 'Failed to complete session')
        }finally{
            setLoading(false)
        }
    }

    return{
        completeSession,
        loading,
        error
    }
}