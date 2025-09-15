import { useEffect, useState } from 'react'
import { listUserFeedbacks } from '@/services/userService'
import { FeedbackResponseData } from '@/types/feedback.types'

interface UseUserFeedbacksReturn {
  feedbacks: FeedbackResponseData[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export const useUserFeedbacks = (): UseUserFeedbacksReturn => {
  const [feedbacks, setFeedbacks] = useState<FeedbackResponseData[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFeedbacks = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listUserFeedbacks()
      setFeedbacks(data)
    } catch (err: any) {
      console.error('Error fetching user feedbacks:', err)
      setError(err?.response?.data?.error || 'Failed to fetch feedbacks')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFeedbacks()
  }, [])

  return { feedbacks, loading, error, refetch: fetchFeedbacks }
}