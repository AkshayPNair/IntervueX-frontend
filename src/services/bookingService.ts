import api from './api'
import { CreateBookingData,BookingStatus,PaginatedInterviewerBookings,Booking,RazorpayOrder, InterviewerBooking,CancelBookingData, CompleteBookingData, VerifyPaymentData} from '../types/booking.types'
import { API_ROUTES } from '@/constants/apiRoutes';

export const createBooking = async (bookingData: CreateBookingData): Promise<Booking> => {
    const response = await api.post(API_ROUTES.USER.CREATE_BOOKING, bookingData);
    return response.data;
};

export const cancelBooking=async(data:CancelBookingData):Promise<{message:string}>=>{
    const response=await api.post(API_ROUTES.USER.CANCEL_BOOKING,data)
    return response.data
}

export const completeBooking=async (data:CompleteBookingData):Promise<{message:string}>=>{
    const response=await api.post(API_ROUTES.USER.COMPLETE_BOOKING,data)
    return response.data
}

export const getUserBookings = async (): Promise<Booking[]> => {
    const response = await api.get(API_ROUTES.USER.BOOKINGS);
    return response.data;
};

export const createRazorpayOrder = async (amount: number): Promise<RazorpayOrder> => {
    const response = await api.post(API_ROUTES.USER.RAZORPAY_CREATE_ORDER, { amount });
    return response.data;
};

export const verifyPayment = async (verifyData: VerifyPaymentData): Promise<{ message: string }> => {
    const response = await api.post(API_ROUTES.USER.RAZORPAY_VERIFY_PAYMENT, verifyData);
    return response.data;
};


export const getInterviewerBookings=async(page:number,limit:number,status:BookingStatus,search:string):Promise<PaginatedInterviewerBookings>=>{
    const params = new URLSearchParams({page: String(page),limit: String(limit),status: status,search: search,});
    const response = await api.get(`${API_ROUTES.INTERVIEWER.BOOKINGS}?${params.toString()}`);
    return response.data
}

