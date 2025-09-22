import { useEffect, useState } from 'react'
import { getUserRatingByBooking } from '@/services/interviewerService'
import { InterviewerRatingData } from '@/types/feedback.types'

interface UseUserRatingByBookingIdReturn {
  data: InterviewerRatingData | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export const useUserRatingByBookingId = (bookingId: string | null): UseUserRatingByBookingIdReturn => {
  const [data, setData] = useState<InterviewerRatingData | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    if (!bookingId) {
      setData(null)
      setLoading(false)
      setError(null)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await getUserRatingByBooking(bookingId)
      setData(res)
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to fetch rating')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [bookingId])

  return { data, loading, error, refetch: fetchData }
}