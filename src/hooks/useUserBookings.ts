import { useState, useEffect } from 'react';
import { getUserBookings } from '../services/bookingService';
import { Booking } from '../types/booking.types';

interface UseUserBookingsReturn {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useUserBookings = (): UseUserBookingsReturn => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getUserBookings();
      setBookings(response);
    } catch (err: any) {
      console.error('Error fetching bookings:', err);
      setError(err.response?.data?.error || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return {
    bookings,
    loading,
    error,
    refetch: fetchBookings
  };
};