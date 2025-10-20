import { useCallback, useEffect, useState } from 'react'
import { listUserFeedbacks } from '@/services/userService'
import { FeedbackResponseData, PaginatedFeedbackResponse } from '@/types/feedback.types'

interface UseUserFeedbacksReturn {
  feedbacks: FeedbackResponseData[]
  pagination: PaginatedFeedbackResponse['pagination'] | null
  loading: boolean
  error: string | null
  refetch: (page?: number) => Promise<void>
}

export const useUserFeedbacks = (initialPage = 1, initialLimit = 6): UseUserFeedbacksReturn => {
  const [feedbacks, setFeedbacks] = useState<FeedbackResponseData[]>([])
  const [pagination, setPagination] = useState<PaginatedFeedbackResponse['pagination'] | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFeedbacks = useCallback(async (page = initialPage, limit = initialLimit) => {
    setLoading(true)
    setError(null)
    try {
      const data = await listUserFeedbacks(page, limit)
      setFeedbacks(data.data)
      setPagination(data.pagination)
    } catch (err: any) {
      console.error('Error fetching user feedbacks:', err)
      setError(err?.response?.data?.error || 'Failed to fetch feedbacks')
    } finally {
      setLoading(false)
    }
  }, [initialLimit, initialPage])

  useEffect(() => {
    fetchFeedbacks(initialPage, initialLimit)
  }, [fetchFeedbacks, initialLimit, initialPage])

  return { feedbacks, pagination, loading, error, refetch: fetchFeedbacks }
}