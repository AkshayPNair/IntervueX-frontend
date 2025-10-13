import { useState, useEffect } from "react";
import { InterviewerBooking, BookingStatus, PaginatedInterviewerBookings } from "@/types/booking.types";
import { getInterviewerBookings } from "@/services/bookingService";

interface useInterviewerBookingsReturn {
    bookings: InterviewerBooking[];
    pagination: PaginatedInterviewerBookings['pagination'] | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>

}

export const useInterviewerBookings = (page: number, limit: number, status: BookingStatus, search: string): useInterviewerBookingsReturn => {
    const [bookings, setBookings] = useState<PaginatedInterviewerBookings | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    const fetchBookings = async () => {
        setLoading(true)
        setError(null)

        try {
            const response = await getInterviewerBookings(page, limit, status, search)
            setBookings(response)
        } catch (err: any) {
            console.error('Error fetching bookings:', err);
            setError(err.response?.data?.error || 'Failed to fetch bookings');
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchBookings()
    }, [page, limit, status, search])

    return {
        bookings: bookings?.data ?? [],
        pagination: bookings?.pagination ?? null,
        loading,
        error,
        refetch: fetchBookings
    }
}