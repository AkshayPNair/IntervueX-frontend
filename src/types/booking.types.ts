export enum BookingStatus{
    PENDING='pending',
    CONFIRMED='confirmed',
    COMPLETED='completed',
    CANCELLED='cancelled'
}

export enum PaymentMethod {
    WALLET = 'wallet',
    RAZORPAY = 'razorpay'
}

export interface CreateBookingData{
    interviewerId:string;
    date:string;
    startTime:string;
    endTime:string;
    amount:number;
    paymentMethod:PaymentMethod;
    paymentId?:string;
}

export interface Booking {
    id: string;
    userId: string;
    interviewerId: string;
    interviewerName: string;
    interviewerProfilePicture?: string;
    interviewerJobTitle?: string;
    interviewerExperience?: number;
    date: string;
    startTime: string;
    endTime: string;
    amount: number;
    adminFee: number;
    interviewerAmount: number;
    status: BookingStatus;
    paymentMethod: PaymentMethod;
    paymentId?: string;
    createdAt: string;
    updatedAt: string;
    cancelReason?: string;
}

export interface RazorpayOrder {
    id: string;
    amount: number;
   currency: string;
    receipt: string;
}

export interface InterviewerBooking{
    id: string;
    userId: string;
    interviewerId: string;
    date: string;
    startTime: string;
    endTime: string;
    amount: number;
    adminFee: number;
    interviewerAmount: number;
    status: BookingStatus;
    paymentMethod: PaymentMethod;
    paymentId?: string;
    createdAt: Date;
    updatedAt: Date;
    userName: string;
    userEmail: string;
    userProfilePicture: string;
    cancelReason?: string;
}

export interface CancelBookingData{
    bookingId:string;
    reason:string;
}

export interface CompleteBookingData{
    bookingId:string
}

export interface AdminBookingList {
  id: string;
  userName: string;
  interviewerName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  paymentMethod:PaymentMethod;
}