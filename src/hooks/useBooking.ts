import { useState } from 'react';
import { createBooking} from '../services/bookingService';
import { PaymentMethod, Booking, CreateBookingData } from '../types/booking.types';
import { TimeSlot } from '../types/slotRule.types';

interface UseBookingProps {
  interviewerId: string;
  hourlyRate: number;
}

interface UseBookingReturn {
  bookSession: (date: string, slot: TimeSlot, paymentMethod: PaymentMethod, paymentId?: string) => Promise<Booking>;
  loading: boolean;
  error: string | null;
}

export const useBooking = ({ interviewerId, hourlyRate }: UseBookingProps): UseBookingReturn => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const bookSession = async (
    date: string,
    slot: TimeSlot,
    paymentMethod: PaymentMethod,
    paymentId?: string
  ): Promise<Booking> => {
    setLoading(true);
    setError(null);

    try {
      const bookingData: CreateBookingData = {
        interviewerId,
        date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        amount: hourlyRate,
        paymentMethod,
        paymentId
      };

      const response = await createBooking(bookingData);
      return response;
    } catch (err: any) {
      console.error('Error booking session:', err);
      setError(err.response?.data?.error || 'Failed to book session');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    bookSession,
    loading,
    error
  };
};