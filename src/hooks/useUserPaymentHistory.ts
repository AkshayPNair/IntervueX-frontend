import { useEffect, useState } from 'react'
import {PaymentHistoryResponse } from '@/types/payment.types'
import { getUserPaymentHistory } from '@/services/userService'

interface UseUserPaymentHistoryReturn extends PaymentHistoryResponse{
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export const useUserPaymentHistory = (): UseUserPaymentHistoryReturn => {
  const [data, setData] = useState<PaymentHistoryResponse>({ stats: { totalBooked: 0, completed: 0, cancelled: 0 }, payments: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getUserPaymentHistory()
      setData(res)
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load payment history')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [])

  return { ...data, loading, error, refetch: fetchAll }
}