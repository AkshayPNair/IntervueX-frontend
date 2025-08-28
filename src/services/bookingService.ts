import api from './api'
import { CreateBookingData,PaymentMethod,Booking,RazorpayOrder, InterviewerBooking,CancelBookingData, CompleteBookingData} from '../types/booking.types'

export const createBooking = async (bookingData: CreateBookingData): Promise<Booking> => {
    const response = await api.post('/user/bookings', bookingData);
    return response.data;
};

export const cancelBooking=async(data:CancelBookingData):Promise<{message:string}>=>{
    const response=await api.post('/user/bookings/cancel',data)
    return response.data
}

export const completeBooking=async (data:CompleteBookingData):Promise<{message:string}>=>{
    const response=await api.post('/user/bookings/complete',data)
    return response.data
}

export const getUserBookings = async (): Promise<Booking[]> => {
    const response = await api.get('/user/bookings');
    return response.data;
};

export const createRazorpayOrder = async (amount: number): Promise<RazorpayOrder> => {
    const response = await api.post('/user/razorpay/create-order', { amount });
    return response.data;
};

export const getInterviewerBookings=async():Promise<InterviewerBooking[]>=>{
    const response=await api.get('/interviewer/bookings')
    return response.data
}

