import { useState,useEffect } from "react";
import { InterviewerBooking } from "@/types/booking.types";
import { getInterviewerBookings } from "@/services/bookingService";

interface useInterviewerBookingsReturn{
    bookings:InterviewerBooking[];
    loading:boolean;
    error:string|null;
    refetch:()=> Promise<void>

}

export const useInterviewerBookings=(): useInterviewerBookingsReturn =>{
    const [bookings,setBookings]=useState<InterviewerBooking[]>([])
    const [loading,setLoading]=useState<boolean>(true)
    const [error,setError]=useState<string|null>(null)

    const fetchBookings=async()=>{
        setLoading(true)
        setError(null)

        try {
            const response= await getInterviewerBookings()
            setBookings(response)
        } catch (err:any) {
            console.error('Error fetching bookings:', err);
            setError(err.response?.data?.error || 'Failed to fetch bookings');
        }finally{
            setLoading(false)
        }
    }

    useEffect(()=>{
        fetchBookings()
    },[])
    
    return{
        bookings,
        loading,
        error,
        refetch:fetchBookings
    }
}