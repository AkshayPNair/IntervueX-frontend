export interface PaymentRecord {
  bookingId: string
  date: string
  amount: number
  paymentMethod: 'wallet' | 'razorpay'
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  interviewerName?: string
}

export interface PaymentStats {
  totalBooked: number
  completed: number
  cancelled: number
}

export interface PaymentHistoryResponse {
  stats: PaymentStats
  payments: PaymentRecord[]
}
