import {useState} from 'react'
import { CancelBookingData } from '@/types/booking.types'
import { cancelBooking } from '@/services/bookingService'

interface UseCancelBookingReturn{
    cancelSession:(data: CancelBookingData)=> Promise<void>
    loading:boolean;
    error:string|null;
}

export const useCancelBooking=():UseCancelBookingReturn=>{
    const [loading,setLoading]=useState<boolean>(false)
    const [error,setError]=useState<string|null>(null)

    const cancelSession = async (data:CancelBookingData):Promise<void>=>{
        setLoading(true)
        setError(null)

        try {
            await cancelBooking(data)
        } catch (error:any) {
            console.error('Error cancelling booking:',error)
            setError(error.response?.data?.error || 'Failed to cancel session')
        }finally{
            setLoading(false)
        }
    }

    return{
        cancelSession,
        loading,
        error
    }
}